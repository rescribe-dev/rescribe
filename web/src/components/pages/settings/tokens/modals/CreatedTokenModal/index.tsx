import React from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  InputGroup,
  Input,
  InputGroupAddon,
} from 'reactstrap';
import copy from 'copy-to-clipboard';

import './index.scss';
import { toast } from 'react-toastify';

interface ModalArgs {
  token: string;
  toggle: () => void;
  isOpen: boolean;
}

const CreatedTokenModal = (args: ModalArgs): JSX.Element => {
  return (
    <Modal isOpen={args.isOpen} toggle={args.toggle}>
      <ModalHeader toggle={args.toggle}>Token</ModalHeader>
      <ModalBody>
        <InputGroup>
          <Input
            value={args.token}
            readOnly={true}
            onFocus={(evt) => evt.target.select()}
          />
          <InputGroupAddon addonType="append">
            <Button
              onClick={(evt) => {
                evt.preventDefault();
                copy(args.token);
                toast('copied to clipboard', {
                  type: 'success',
                });
              }}
            >
              Copy
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </ModalBody>
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
