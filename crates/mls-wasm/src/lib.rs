use openmls::prelude::tls_codec::*;
use openmls::prelude::*;
use openmls_basic_credential::SignatureKeyPair;
use openmls_rust_crypto::OpenMlsRustCrypto;
use wasm_bindgen::prelude::*;

const CIPHERSUITE: Ciphersuite = Ciphersuite::MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519;

fn js_err<E: std::fmt::Debug>(e: E) -> JsValue {
    JsValue::from_str(&format!("{e:?}"))
}

fn no_group_err() -> JsValue {
    JsValue::from_str("party has no active group; call create_group or join_from_welcome first")
}

// One party's local MLS state: its own crypto provider/storage, its signing
// keypair, and (once created/joined) the MlsGroup it belongs to. This is the
// vertical-slice surface only — exactly two parties, no remove_members, no
// persistent storage backing yet (see ADR for the follow-up scope).
#[wasm_bindgen]
pub struct MlsParty {
    provider: OpenMlsRustCrypto,
    signer: SignatureKeyPair,
    credential_with_key: CredentialWithKey,
    group: Option<MlsGroup>,
}

#[wasm_bindgen]
impl MlsParty {
    #[wasm_bindgen(constructor)]
    pub fn new(identity: &str) -> Result<MlsParty, JsValue> {
        console_error_panic_hook::set_once();

        let provider = OpenMlsRustCrypto::default();
        let credential = BasicCredential::new(identity.as_bytes().to_vec());
        let signer =
            SignatureKeyPair::new(CIPHERSUITE.signature_algorithm()).map_err(js_err)?;
        signer.store(provider.storage()).map_err(js_err)?;

        let credential_with_key = CredentialWithKey {
            credential: credential.into(),
            signature_key: signer.public().into(),
        };

        Ok(MlsParty {
            provider,
            signer,
            credential_with_key,
            group: None,
        })
    }

    /// Generates a one-time-use key package for this party so another party
    /// can invite it into a group. Must be transported to the inviter
    /// out-of-band (in the real system: via the MLS Delivery Service).
    pub fn generate_key_package(&self) -> Result<Vec<u8>, JsValue> {
        let bundle = KeyPackage::builder()
            .build(
                CIPHERSUITE,
                &self.provider,
                &self.signer,
                self.credential_with_key.clone(),
            )
            .map_err(js_err)?;

        bundle.key_package().tls_serialize_detached().map_err(js_err)
    }

    /// Creates a brand-new group with this party as the sole initial member.
    pub fn create_group(&mut self) -> Result<(), JsValue> {
        let config = MlsGroupCreateConfig::builder()
            .use_ratchet_tree_extension(true)
            .build();

        let group = MlsGroup::new(
            &self.provider,
            &self.signer,
            &config,
            self.credential_with_key.clone(),
        )
        .map_err(js_err)?;

        self.group = Some(group);
        Ok(())
    }

    /// Adds a member (by their serialized key package) to this party's group
    /// and returns the serialized Welcome message for the new member.
    pub fn add_member(&mut self, key_package_bytes: &[u8]) -> Result<Vec<u8>, JsValue> {
        let key_package_in =
            KeyPackageIn::tls_deserialize(&mut &key_package_bytes[..]).map_err(js_err)?;
        let key_package = key_package_in
            .validate(self.provider.crypto(), ProtocolVersion::Mls10)
            .map_err(js_err)?;

        let group = self.group.as_mut().ok_or_else(no_group_err)?;

        let (_commit, welcome, _group_info) = group
            .add_members(
                &self.provider,
                &self.signer,
                core::slice::from_ref(&key_package),
            )
            .map_err(js_err)?;

        group.merge_pending_commit(&self.provider).map_err(js_err)?;

        welcome.tls_serialize_detached().map_err(js_err)
    }

    /// Joins a group from a serialized Welcome message. The ratchet tree
    /// extension is enabled on group creation, so no out-of-band tree transfer
    /// is needed here.
    pub fn join_from_welcome(&mut self, welcome_bytes: &[u8]) -> Result<(), JsValue> {
        let message_in = MlsMessageIn::tls_deserialize(&mut &welcome_bytes[..]).map_err(js_err)?;
        let welcome = match message_in.extract() {
            MlsMessageBodyIn::Welcome(welcome) => welcome,
            _ => return Err(JsValue::from_str("expected a welcome message")),
        };

        let staged = StagedWelcome::new_from_welcome(
            &self.provider,
            &MlsGroupJoinConfig::default(),
            welcome,
            None,
        )
        .map_err(js_err)?;

        self.group = Some(staged.into_group(&self.provider).map_err(js_err)?);
        Ok(())
    }

    /// Encrypts a plaintext application message for this party's group.
    pub fn encrypt(&mut self, plaintext: &[u8]) -> Result<Vec<u8>, JsValue> {
        let group = self.group.as_mut().ok_or_else(no_group_err)?;

        let message_out = group
            .create_message(&self.provider, &self.signer, plaintext)
            .map_err(js_err)?;

        message_out.tls_serialize_detached().map_err(js_err)
    }

    /// Decrypts an incoming application message for this party's group.
    pub fn decrypt(&mut self, ciphertext: &[u8]) -> Result<Vec<u8>, JsValue> {
        let message_in = MlsMessageIn::tls_deserialize(&mut &ciphertext[..]).map_err(js_err)?;
        let protocol_message: ProtocolMessage = message_in.try_into().map_err(js_err)?;

        let group = self.group.as_mut().ok_or_else(no_group_err)?;

        let processed = group
            .process_message(&self.provider, protocol_message)
            .map_err(js_err)?;

        match processed.into_content() {
            ProcessedMessageContent::ApplicationMessage(app_msg) => Ok(app_msg.into_bytes()),
            _ => Err(JsValue::from_str("expected an application message")),
        }
    }
}
