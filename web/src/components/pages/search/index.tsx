import React, { useEffect, useState } from 'react';
import BeatLoader from 'react-spinners/BeatLoader';
import { css } from '@emotion/core';
import {
  Container,
  Row,
  Col,
  Pagination,
  PaginationItem,
  PaginationLink,
} from 'reactstrap';
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
import { toast } from 'react-toastify';
import { SearchMessages } from 'locale/pages/search/searchMessages';
import SearchBar from './SearchBar';
import { SearchQuery } from 'lib/generated/datamodel';
import { useIntl } from 'react-intl';
import { setPage } from 'state/search/actions';
import { Dispatch } from 'redux';

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
  let dispatch: Dispatch<any>;
  if (!isSSR) {
    dispatchSearchThunk = useDispatch<AppThunkDispatch<SearchActionTypes>>();
    dispatch = useDispatch();
  }

  const intl = useIntl();

  const [numberFormatter] = useState(new Intl.NumberFormat(intl.locale));

  useEffect(() => {
    let foundSearchParams = processSearchParams(args.location.search);
    if (args.location.search.length > 0 && foundSearchParams && !searching) {
      dispatchSearchThunk(thunkSearch());
    }
    // on back button push run search again
    // hack to get typescript working:
    const history = createHistory((window as unknown) as HistorySource);
    return history.listen(async (listener) => {
      if (
        listener.action === 'POP' &&
        listener.location.pathname === '/search'
      ) {
        foundSearchParams = processSearchParams(args.location.search);
        if (!foundSearchParams) {
          return;
        }
        try {
          await dispatchSearchThunk(thunkSearch());
        } catch (err) {
          toast((err as Error).message, {
            type: 'error',
          });
        }
      }
    });
  }, []);
  const searchResult = useSelector<RootState, SearchQuery | null>(
    (state) => state.searchReducer.searchResults
  );
  const currentPage = useSelector<RootState, number>(
    (state) => state.searchReducer.page
  );
  const perpage = useSelector<RootState, number>(
    (state) => state.searchReducer.perpage
  );

  const hasSearched = isSSR
    ? undefined
    : useSelector<RootState, boolean>(
        (state) => state.searchReducer.hasSearched
      );
  const [showFilters, setShowFilters] = useState(true);
  const minFilterWidth = '9rem';
  return (
    <Container fluid="xl" className="my-4">
      <Row
        className="mb-2 py-2"
        style={{
          borderBottom: '2px solid var(--gray1)',
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
            onClick={(evt) => {
              evt.preventDefault();
              setShowFilters(!showFilters);
            }}
            type="button"
            className="button-link"
          >
            <FaSlidersH /> Filter
          </button>
        </Col>
        <SearchBar />
      </Row>

      <Row className="pt-1">
        {!showFilters ? null : (
          <Col md={3} id="filterColumn" className="px-0">
            <Filters />
          </Col>
        )}
        <Col>
          <Container>
            {searching ? (
              <BeatLoader
                css={loaderCSS}
                size={10}
                color="var(--red-stop)"
                loading={searching}
              />
            ) : !searchResult || searchResult.search.results.length === 0 ? (
              <>
                {hasSearched ? (
                  <p>no results found</p>
                ) : (
                  <p>try searching for something</p>
                )}
              </>
            ) : (
              <>
                {searchResult.search.results.map((file) => {
                  return (
                    <Row key={`file-${file._id}`}>
                      <Col className="mb-2">
                        <FileResultComponent
                          file={file}
                          previewSearchResults={file.results}
                        />
                      </Col>
                    </Row>
                  );
                })}
              </>
            )}
          </Container>
          {searching ||
          !searchResult ||
          searchResult.search.count === 0 ? null : (
            <Container>
              <p>
                {numberFormatter.format(
                  Math.max(
                    searchResult.search.results.length +
                      (currentPage - 1) * perpage,
                    1
                  )
                )}
                -
                {numberFormatter.format(
                  searchResult.search.results.length + currentPage * perpage
                )}
                {' / '}
                {numberFormatter.format(searchResult.search.count)}
              </p>
              <Pagination>
                <PaginationItem
                  onClick={async (evt) => {
                    evt.preventDefault();
                    if (currentPage === 0) {
                      return;
                    }
                    dispatch(setPage(currentPage - 1));
                    try {
                      await dispatchSearchThunk(thunkSearch());
                    } catch (err) {
                      toast((err as Error).message, {
                        type: 'error',
                      });
                    }
                  }}
                  disabled={currentPage === 0}
                >
                  <PaginationLink previous />
                </PaginationItem>
                <PaginationItem
                  onClick={async (evt) => {
                    evt.preventDefault();
                    if (
                      currentPage * perpage +
                        searchResult.search.results.length ===
                      searchResult.search.count
                    ) {
                      return;
                    }
                    dispatch(setPage(currentPage + 1));
                    try {
                      await dispatchSearchThunk(thunkSearch());
                    } catch (err) {
                      toast((err as Error).message, {
                        type: 'error',
                      });
                    }
                  }}
                  disabled={
                    currentPage * perpage +
                      searchResult.search.results.length ===
                    searchResult.search.count
                  }
                >
                  <PaginationLink next />
                </PaginationItem>
              </Pagination>
            </Container>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SearchPage;
