async function test() {
  const result = await fetch(
    'http://localhost:3001/api/auth/sign-in/username',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Demo1234!' }),
    },
  );
  const data = await result.json();
  console.log('Login res:', data);
  console.log('Headers:', result.headers);
}
test();
