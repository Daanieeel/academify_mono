import { Dialog, DialogContent } from '@/components/ui/dialog';
import React from 'react';

type ThemedModalProps = {
  children?: React.ReactNode;
  visible: boolean;
  onRequestClose: () => void;
};

const ThemedModal = (props: ThemedModalProps) => {
  return (
    <Dialog
      open={props.visible}
      onOpenChange={(open) => {
        if (!open) {
          props.onRequestClose();
        }
      }}
    >
      <DialogContent className="h-[90%]">{props.children}</DialogContent>
    </Dialog>
  );
};

export default ThemedModal;
