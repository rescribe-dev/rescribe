import React, { useEffect } from 'react';
import './index.scss';
import { CheckoutMessages } from 'locale/pages/checkout/checkoutMessages';
import {
  ListGroup,
  ListGroupItem,
  Button,
  Row,
  Col,
  Input,
  Container,
  Card,
  CardBody,
  FormGroup,
} from 'reactstrap';
import ObjectId from 'bson-objectid';
import { capitalizeFirstLetter } from 'utils/misc';
import { AiFillDelete } from 'react-icons/ai';
import { Mode } from '../mode';

interface ListItem {
  _id: ObjectId;
  [key: string]: unknown;
}

interface SelectListArgs {
  messages: CheckoutMessages;
  toggleModal: () => void;
  updateItems: () => Promise<void>;
  setAdd: (add: boolean) => void;
  items: ListItem[];
  getListLabel: (item: any) => JSX.Element;
  getSelectedLabel: (item: any) => JSX.Element;
  mode: Mode;
  selectedID: ObjectId | null;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void;
  selectMode: boolean;
  setCurrentItem: (item: any) => void;
  toggleDeleteItemModal: () => void;
}

const SelectList = (args: SelectListArgs): JSX.Element => {
  useEffect(() => {
    (async () => {
      await args.updateItems();
    })();
  }, []);

  const name = args.mode === Mode.Address ? 'address' : 'payment method';
  const id = name.replaceAll(' ', '-');

  const getSelectedLabel = (): JSX.Element => {
    if (!args.selectedID) {
      return <p>No Address Selected</p>;
    }
    const selectedElement = args.items.find((elem) =>
      elem._id.equals(args.selectedID as ObjectId)
    );
    if (!selectedElement) {
      return <p>Cannot find selected element</p>;
    }
    return args.getSelectedLabel(selectedElement);
  };

  return (
    <>
      {args.items.length === 0 ? (
        <Button
          onClick={(evt) => {
            evt.preventDefault();
            args.setAdd(true);
            args.toggleModal();
          }}
        >
          New {capitalizeFirstLetter(name)}
        </Button>
      ) : (
        <>
          {args.selectMode ? (
            <Card>
              <CardBody
                style={{
                  paddingLeft: 0,
                  paddingRight: 0,
                }}
              >
                <FormGroup tag="fieldset" name={name} id={id}>
                  <ListGroup
                    className="list-group-flush"
                    style={{
                      marginLeft: 0,
                    }}
                  >
                    {args.items.map((item) => (
                      <ListGroupItem key={`${id}-${item._id.toHexString()}`}>
                        <Container>
                          <Row>
                            <Col xs="auto">
                              <FormGroup check>
                                <Input
                                  type="radio"
                                  value={item._id.toHexString()}
                                  checked={
                                    !!(
                                      args.selectedID &&
                                      item._id.equals(args.selectedID)
                                    )
                                  }
                                  onChange={() => {
                                    args.setFieldValue(id, item._id);
                                  }}
                                />
                              </FormGroup>
                            </Col>
                            <Col xs="auto">{args.getListLabel(item)}</Col>
                            <Col>
                              <Button
                                style={{
                                  color: '#818A91',
                                  backgroundColor: '#fff',
                                  border: '0px',
                                }}
                                onClick={(evt) => {
                                  evt.preventDefault();
                                  args.setCurrentItem(item._id);
                                  args.toggleDeleteItemModal();
                                }}
                              >
                                <AiFillDelete />
                              </Button>
                            </Col>
                          </Row>
                        </Container>
                      </ListGroupItem>
                    ))}
                  </ListGroup>
                </FormGroup>
                <Button
                  onClick={(evt) => {
                    evt.preventDefault();
                    args.setAdd(true);
                    args.toggleModal();
                  }}
                >
                  Add New {capitalizeFirstLetter(name)}
                </Button>
              </CardBody>
            </Card>
          ) : (
            <>{getSelectedLabel()}</>
          )}
        </>
      )}
    </>
  );
};

export default SelectList;
