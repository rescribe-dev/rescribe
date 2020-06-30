import React, { useEffect, useState } from 'react';
import BeatLoader from 'react-spinners/BeatLoader';
import { css } from '@emotion/core';
import { Container, Row, Col } from 'reactstrap';
import { PageProps } from 'gatsby';

import './index.scss';

import { SearchQuery } from 'lib/generated/datamodel';
import Filters from './filters';
import { FileResultComponent } from './fileResult';
import { useSelector, useDispatch } from 'react-redux';
import { isSSR } from 'utils/checkSSR';
import { RootState } from 'state';
import { processSearchParams } from 'state/search/helpers';
import { SearchActionTypes } from 'state/search/types';
import { AppThunkDispatch } from 'state/thunk';
import { thunkSearch } from 'state/search/thunks';
import { FiSliders } from 'react-icons/fi';
import { createHistory, HistorySource } from '@reach/router';
import sleep from 'utils/sleep';
import { toast } from 'react-toastify';
import { SearchMessages } from 'locale/pages/search/searchMessages';

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
  const hasSearched = isSSR
    ? undefined
    : useSelector<RootState, boolean>(
        (state) => state.searchReducer.hasSearched
      );
  const [showFilters, setShowFilters] = useState(true);
  const minFilterWidth = '12rem';
  return (
    <Container
      fluid="xl"
      style={{
        marginTop: '2rem',
      }}
    >
      <Row>
        <Col
          xs={3}
          style={{
            minWidth: minFilterWidth,
            paddingBottom: '1rem',
            borderRight: '1px solid rgba(0, 0, 0, 0.2)',
          }}
        >
          <button
            onClick={async (evt: React.MouseEvent): Promise<void> => {
              evt.preventDefault();
              setShowFilters(!showFilters);
            }}
            className="button-link"
          >
            <FiSliders /> Filters
          </button>
        </Col>
        <Col>{/* showing 1-40 of 1200 results */}</Col>
      </Row>
      <Row>
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
                color={'red'}
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
