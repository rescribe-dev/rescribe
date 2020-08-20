import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import './index.scss';

interface ModalArgs {
  deletePaymentMethod: () => Promise<void>;
  toggle: () => void;
  isOpen: boolean;
}

const DeletePaymentMethodModal = (args: ModalArgs): JSX.Element => {
  return (
    <Modal isOpen={args.isOpen} toggle={args.toggle}>
      <ModalHeader toggle={args.toggle}>Delete Payment Method</ModalHeader>
      <ModalBody>Are you sure?</ModalBody>
      <ModalFooter>
        <Button
          color="danger"
          onClick={async () => {
            await args.deletePaymentMethod();
            args.toggle();
          }}
        >
          Delete
        </Button>{' '}
        <Button color="secondary" onClick={args.toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeletePaymentMethodModal;
