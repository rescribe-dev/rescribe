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
import { CurrencyData } from 'state/purchase/types';
import { client } from 'utils/apollo';
import {
  Currencies,
  CurrenciesQuery,
  CurrenciesQueryVariables,
} from 'lib/generated/datamodel';
import isDebug from 'utils/mode';
import { toast } from 'react-toastify';
import { ApolloError } from '@apollo/client';

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
  id: string;
  setCurrentCurrency?: (currency: CurrencyData) => void;
}

const SelectList = (args: SelectListArgs): JSX.Element => {
  useEffect(() => {
    (async () => {
      await args.updateItems();
    })();
  }, []);

  const name = args.mode === Mode.Address ? 'address' : 'payment method';

  const getSelectedLabel = (): JSX.Element => {
    if (!args.selectedID) {
      return <p>No {capitalizeFirstLetter(name)} Selected</p>;
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
            style={{
              fontSize: '14px',
            }}
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
                  <FormGroup tag="fieldset" name={name} id={args.id}>
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
                          key={`${args.id}-${item._id.toHexString()}`}
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
                                      args.setFieldValue(args.id, item._id);
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
                                  onClick={async (evt): Promise<void> => {
                                    evt.preventDefault();
                                    args.setCurrentItem(item._id);
                                    if (
                                      args.setCurrentCurrency &&
                                      item.currency
                                    ) {
                                      try {
                                        const currencyRes = await client.query<
                                          CurrenciesQuery,
                                          CurrenciesQueryVariables
                                        >({
                                          query: Currencies,
                                          variables: {
                                            names: [item.currency as string],
                                          },
                                          fetchPolicy: isDebug()
                                            ? 'no-cache'
                                            : 'cache-first', // disable cache if in debug
                                        });
                                        if (currencyRes.errors) {
                                          throw new Error(
                                            currencyRes.errors.join(', ')
                                          );
                                        }
                                        if (
                                          currencyRes.data.currencies.length ===
                                          0
                                        ) {
                                          throw new Error(
                                            'cannot find currency data'
                                          );
                                        }
                                        args.setCurrentCurrency(
                                          currencyRes.data.currencies[0]
                                        );
                                      } catch (err) {
                                        toast((err as ApolloError).message, {
                                          type: 'error',
                                        });
                                      }
                                    }
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
                    style={{
                      fontSize: '14px',
                    }}
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
