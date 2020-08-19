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
  CardFooter,
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
        <Container
          style={{
            marginTop: '1rem',
            paddingLeft: 0,
          }}
        >
          <Button
            color="primary"
            onClick={(evt) => {
              evt.preventDefault();
              args.setAdd(true);
              args.toggleModal();
            }}
          >
            New {capitalizeFirstLetter(name)}
          </Button>
        </Container>
      ) : (
        <>
          {args.selectMode ? (
            <Container
              style={{
                marginTop: '2rem',
                marginBottom: '3rem',
              }}
            >
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
                        <ListGroupItem
                          style={{
                            margin: 0,
                          }}
                          key={`${id}-${item._id.toHexString()}`}
                        >
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
                              <Col
                                xs="auto"
                                style={{
                                  padding: 0,
                                }}
                              >
                                {args.getListLabel(item)}
                              </Col>
                              <Col xs="auto">
                                <Button
                                  style={{
                                    color: '#818A91',
                                    backgroundColor: '#fff',
                                    border: '0px',
                                    padding: 0,
                                  }}
                                  onClick={(evt) => {
                                    evt.preventDefault();
                                    args.setCurrentItem(item._id);
                                    args.toggleDeleteItemModal();
                                  }}
                                >
                                  <AiFillDelete className="my-auto" />
                                </Button>
                              </Col>
                            </Row>
                          </Container>
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  </FormGroup>
                </CardBody>
                <CardFooter
                  className="text-center"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                >
                  <Button
                    color="primary"
                    onClick={(evt) => {
                      evt.preventDefault();
                      args.setAdd(true);
                      args.toggleModal();
                    }}
                  >
                    Add New {capitalizeFirstLetter(name)}
                  </Button>
                </CardFooter>
              </Card>
            </Container>
          ) : (
            <div
              style={{
                marginTop: '1rem',
                marginBottom: '2rem',
              }}
            >
              {getSelectedLabel()}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default SelectList;
