import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import SignUpContent from 'components/SignUp';

interface args {
  toggle: () => void;
  isOpen: boolean;
}

const SignUpModal = (args: args): JSX.Element => {
  return (
    <div>
      <Modal
        size="lg"
        keyboard={false} // disable escape key closing modal
        isOpen={args.isOpen}
        toggle={args.toggle}
      >
        <ModalHeader
          style={{
            borderBottom: 0,
          }}
          toggle={args.toggle}
        />
        <ModalBody>
          <SignUpContent />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={args.toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default SignUpModal;
