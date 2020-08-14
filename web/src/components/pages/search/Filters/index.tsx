import React, { useState, Dispatch } from 'react';
import {
  Container,
  Form,
  Label,
  FormGroup,
  Button,
  Row,
  Col,
} from 'reactstrap';
import AsyncSelect from 'react-select/async';
import { ValueType } from 'react-select';
import { setLanguages } from 'state/search/actions';
import { isSSR } from 'utils/checkSSR';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'state';
import UserFilters from '../UserFilters';
import isDebug from 'utils/mode';
import { useQuery } from '@apollo/react-hooks';
import {
  LanguageData,
  LanguagesQuery,
  LanguagesQueryVariables,
  Languages,
  Language,
} from 'lib/generated/datamodel';
import { capitalizeFirstLetter } from 'utils/misc';
import { navigate } from 'gatsby';
import { getSearchURL } from 'state/search/getters';
import { toast } from 'react-toastify';
import { thunkSearch } from 'state/search/thunks';
import { SearchActionTypes } from 'state/search/types';
import { AppThunkDispatch } from 'state/thunk';
import { ApolloError } from 'apollo-client';

interface SelectObject {
  value: Language;
  label: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface FiltersPropsDataType {}

const Filters = (_args: FiltersPropsDataType): JSX.Element => {
  const loggedIn = isSSR
    ? undefined
    : useSelector<RootState, boolean | undefined>(
        (state) => state.authReducer.loggedIn
      );
  // // useEffect needs to be top-level (not in if statement)
  // useEffect(() => {
  //   // run unsubscribe on unmount
  //   return store.subscribe(() => loggedIn);
  // }, []);
  const [selectedLanguages, setSelectedLanguages] = useState<SelectObject[]>(
    []
  );
  const alreadySelectedLanguages = isSSR
    ? undefined
    : useSelector<RootState, string[] | undefined>(
        (state) => state.searchReducer.filters.languages
      );
  const [languageOptions, setLanguageOptions] = useState<SelectObject[]>([]);
  const getLabel = (language: LanguageData): string => {
    return `name: ${language.name}, color: ${language.color}`;
  };
  if (!isSSR) {
    useQuery<LanguagesQuery, LanguagesQueryVariables>(Languages, {
      variables: {},
      fetchPolicy: isDebug() ? 'no-cache' : 'cache-first', // disable cache if in debug
      onError: (err) => {
        toast((err as ApolloError).message, {
          type: 'error',
        });
      },
      onCompleted: (data) => {
        const newLanguageOptions = data.languages;
        setLanguageOptions(
          newLanguageOptions.map((language) => {
            return {
              label: getLabel(language),
              value: language.name,
            };
          })
        );
        if (alreadySelectedLanguages) {
          setSelectedLanguages(
            alreadySelectedLanguages.map((name) => {
              const languageObject = newLanguageOptions.find(
                (elem) => elem.name === name
              );
              const language =
                Language[capitalizeFirstLetter(name) as keyof typeof Language];
              if (!languageObject)
                return {
                  label: name,
                  value: language,
                };
              return {
                label: getLabel(languageObject),
                value: language,
              };
            })
          );
        }
      },
    });
  }
  const getLanguages = async (inputValue: string): Promise<SelectObject[]> => {
    if (!languageOptions) return [];
    return inputValue.length > 0
      ? languageOptions.filter((language) => {
          return language.value
            .toLowerCase()
            .includes(inputValue.toLowerCase());
        })
      : languageOptions;
  };
  let dispatch: Dispatch<any>;
  let dispatchSearchThunk: AppThunkDispatch<SearchActionTypes>;
  if (!isSSR) {
    dispatch = useDispatch();
    dispatchSearchThunk = useDispatch<AppThunkDispatch<SearchActionTypes>>();
  }
  return (
    <>
      <Container
        style={{
          marginBottom: 0,
          padding: 0,
          marginRight: 0,
        }}
      >
        <hr
          style={{
            marginTop: 0,
          }}
        />
        <Row style={{}}>
          <Col>
            <Form key="form">
              <FormGroup
                style={{
                  marginRight: '0.5rem',
                }}
              >
                <Label for="languages">Languages</Label>
                <AsyncSelect
                  id="languages"
                  name="languages"
                  isMulti={true}
                  defaultOptions={languageOptions}
                  cacheOptions={true}
                  loadOptions={getLanguages}
                  value={selectedLanguages}
                  onChange={(selectedOptions: ValueType<SelectObject>) => {
                    if (!selectedOptions) {
                      selectedOptions = [];
                    }
                    const selected = selectedOptions as SelectObject[];
                    setSelectedLanguages(selected);
                    const languages = selected.map(
                      (language) => language.value
                    );
                    dispatch(setLanguages(languages));
                  }}
                />
              </FormGroup>
            </Form>
          </Col>
        </Row>
        <hr />
        {!loggedIn ? null : (
          <>
            <Row>
              <Col>
                <UserFilters />
              </Col>
            </Row>
            <hr />
          </>
        )}
        <Row>
          <Col>
            <Button
              type="submit"
              onClick={async (evt: React.MouseEvent): Promise<void> => {
                evt.preventDefault();
                navigate(getSearchURL());
                try {
                  await dispatchSearchThunk(thunkSearch());
                } catch (err) {
                  toast(err.message, {
                    type: 'error',
                  });
                }
              }}
            >
              Submit
            </Button>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Filters;
