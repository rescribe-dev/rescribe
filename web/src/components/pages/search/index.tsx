import React, { useEffect, useState } from 'react';
import BeatLoader from 'react-spinners/BeatLoader';
import { css } from '@emotion/core';
import { Container, Row, Col } from 'reactstrap';
import { PageProps } from 'gatsby';

import './index.scss';

import Filters from './Filters';
import { FileResultComponent } from './FileResult';
import { useSelector, useDispatch } from 'react-redux';
import { isSSR } from 'utils/checkSSR';
import { RootState } from 'state';
import { processSearchParams } from 'state/search/helpers';
import { SearchActionTypes } from 'state/search/types';
import { AppThunkDispatch } from 'state/thunk';
import { thunkSearch } from 'state/search/thunks';
import { FaSlidersH } from 'react-icons/fa';
import { createHistory, HistorySource } from '@reach/router';
import sleep from 'shared/sleep';
import { toast } from 'react-toastify';
import { SearchMessages } from 'locale/pages/search/searchMessages';
import SearchBar from './SearchBar';
import { SearchQuery } from 'lib/generated/datamodel';

const loaderCSS = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SearchPageDataProps extends PageProps {}

interface SearchProps extends SearchPageDataProps {
  messages: SearchMessages;
}

const SearchPage = (args: SearchProps): JSX.Element => {
  const searching = isSSR
    ? undefined
    : useSelector<RootState, boolean>((state) => state.searchReducer.searching);
  let dispatchSearchThunk: AppThunkDispatch<SearchActionTypes>;
  if (!isSSR) {
    dispatchSearchThunk = useDispatch<AppThunkDispatch<SearchActionTypes>>();
  }
  let foundSearchParams = processSearchParams(args.location.search);
  useEffect(() => {
    // only run on component mount
    if (args.location.search.length > 0 && foundSearchParams && !searching) {
      dispatchSearchThunk(thunkSearch());
    }
    // on back button push run search again
    // hack to get typescript working:
    const history = createHistory((window as unknown) as HistorySource);
    return history.listen(async (listener) => {
      foundSearchParams = processSearchParams(args.location.search);
      await sleep(50);
      if (
        foundSearchParams &&
        listener.action === 'POP' &&
        listener.location.pathname === '/search'
      ) {
        try {
          await dispatchSearchThunk(thunkSearch());
        } catch (err) {
          toast(err.message, {
            type: 'error',
          });
        }
      }
    });
  }, []);
  const searchResult = isSSR
    ? undefined
    : useSelector<RootState, SearchQuery | null>(
        (state) => state.searchReducer.searchResults
      );
  // const searchResult = [
  //   {
  //     repoUrl: 'jschmidtnj/rescribe/api/login.go',
  //     repoCode:
  //       'async create() \n{\n\tawait dataBase.crateUser({name: "hello"})\n}',
  //     repoName: 'reScribe',
  //     repoLang: 'TypeScript',
  //     repoDes:
  //       'On mobile this will go below the search result, or disappear entirely to be replaced by only the link to the full repository',
  //     selected: true,
  //   },
  //   {
  //     repoUrl: 'jschmidtnj/rescribe/api/login.go',
  //     repoCode: "console.log('hello')",
  //     repoName: 'reScribe',
  //     repoLang: 'TypeScript',
  //     repoDes:
  //       'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." This is the readme (or the text from the beginning of the readme) of the selected text’s repo. On mobile this will go below the search result, or disappear entirely to be replaced by only the link to the full repostiory',
  //     selected: false,
  //   },
  // ];
  const hasSearched = isSSR
    ? undefined
    : useSelector<RootState, boolean>(
        (state) => state.searchReducer.hasSearched
      );
  const [showFilters, setShowFilters] = useState(true);
  const minFilterWidth = '9rem';
  return (
    <Container
      fluid="xl"
      style={{
        marginTop: '2rem',
      }}
    >
      <Row
        style={{
          paddingTop: '1rem',
          paddingBottom: '1rem',
          borderTop: '3px solid var(--teal-blue)',
          borderBottom: '3px solid var(--teal-blue)',
        }}
      >
        <Col
          xs={1}
          style={{
            minWidth: minFilterWidth,
            borderRight: '1px solid rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            top: '50%',
            verticalAlign: 'middle',
          }}
        >
          <button
            onClick={async (evt: React.MouseEvent): Promise<void> => {
              evt.preventDefault();
              setShowFilters(!showFilters);
            }}
            className="button-link"
          >
            <FaSlidersH /> Filter
          </button>
        </Col>
        <SearchBar />
      </Row>

      <Col>{/*This is where the preview goes*/}</Col>

      <Row
        style={{
          paddingTop: '1rem',
        }}
      >
        {!showFilters ? null : (
          <Col
            xs={3}
            id="filterColumn"
            style={{
              minWidth: minFilterWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.2)',
              paddingRight: 0,
            }}
          >
            <Filters />
          </Col>
        )}
        <Col>
          <Container
            style={{
              marginTop: '2rem',
            }}
          >
            {searching ? (
              <BeatLoader
                css={loaderCSS}
                size={10}
                color="var(--red-stop)"
                loading={searching}
              />
            ) : !searchResult || searchResult.search.length === 0 ? (
              <>
                {hasSearched ? (
                  <p>no results found</p>
                ) : (
                  <p>try searching for something</p>
                )}
              </>
            ) : (
              <>
                {searchResult.search.map((file) => {
                  const fileResults = [...file.results];
                  if (file.fileResult && file.fileResult.results.length > 0) {
                    const names = file.fileResult.results
                      .map((resultData) => resultData.name)
                      .join(', ');
                    const type = file.fileResult.results[0].type;
                    fileResults.unshift({
                      name: names,
                      type,
                      preview: file.fileResult.preview,
                    });
                  }
                  return (
                    <FileResultComponent
                      key={`file-${file._id}`}
                      file={file}
                      previewSearchResults={fileResults}
                    />
                  );
                })}
              </>
            )}
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default SearchPage;
