import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import './index.scss';

interface ModalArgs {
  token: string;
  toggle: () => void;
  isOpen: boolean;
}

const CreatedTokenModal = (args: ModalArgs): JSX.Element => {
  return (
    <Modal isOpen={args.isOpen} toggle={args.toggle}>
      <ModalHeader toggle={args.toggle}>Token</ModalHeader>
      <ModalBody>{args.token}</ModalBody>
      <ModalFooter>
        Note - you can only see this once.
        <Button color="secondary" onClick={args.toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CreatedTokenModal;
