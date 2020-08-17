import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import './index.scss';

interface WriteAddressArgs {
  add: boolean;
  isOpen: boolean;
  toggle: () => void;
}

const WriteAddress = (args: WriteAddressArgs): JSX.Element => {
  return (
    <Modal isOpen={args.isOpen} toggle={args.toggle}>
      <ModalHeader toggle={args.toggle}>
        {args.add ? 'Add' : 'Edit'} Address
      </ModalHeader>
      <ModalBody>TODO - put form here</ModalBody>
      <ModalFooter>
        <Button
          style={{
            backgroundColor: 'var(--light-orange)',
            borderColor: 'var(--light-orange)',
          }}
          onClick={(evt) => {
            evt.preventDefault();
          }}
        >
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default WriteAddress;
