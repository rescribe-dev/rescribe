import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import './index.scss';

interface ModalArgs {
  deleteFolder: () => Promise<void>;
  toggle: () => void;
  isOpen: boolean;
}

const FolderModal = (args: ModalArgs): JSX.Element => {
  return (
    <Modal isOpen={args.isOpen} toggle={args.toggle}>
      <ModalHeader toggle={args.toggle}>Delete Folder</ModalHeader>
      <ModalBody>Are you sure?</ModalBody>
      <ModalFooter>
        <Button
          color="danger"
          onClick={async () => {
            await args.deleteFolder();
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

export default FolderModal;
