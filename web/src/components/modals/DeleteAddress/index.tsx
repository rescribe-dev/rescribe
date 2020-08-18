import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import './index.scss';

interface ModalArgs {
  deleteAddress: () => Promise<void>;
  toggle: () => void;
  isOpen: boolean;
}

const DeleteAddressModal = (args: ModalArgs): JSX.Element => {
  return (
    <Modal isOpen={args.isOpen} toggle={args.toggle}>
      <ModalHeader toggle={args.toggle}>Delete Address</ModalHeader>
      <ModalBody>Are you sure?</ModalBody>
      <ModalFooter>
        <Button
          color="danger"
          onClick={async () => {
            await args.deleteAddress();
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

export default DeleteAddressModal;
