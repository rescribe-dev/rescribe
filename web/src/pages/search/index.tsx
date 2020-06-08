import React, { useEffect, useState } from 'react';
import BeatLoader from 'react-spinners/BeatLoader';
import { css } from '@emotion/core';
import { Container, Row, Col } from 'reactstrap';
import { PageProps } from 'gatsby';

import './index.scss';
import '../../assets/styles/global.scss';

import SEO from '../../components/seo';
import { SearchQuery } from '../../lib/generated/datamodel';
import Filters from '../../components/search/filters';
import { FileResultComponent } from '../../components/search/fileResult';
import Layout from '../../layouts';
import { useSelector, useDispatch } from 'react-redux';
import { isSSR } from '../../utils/checkSSR';
import { RootState } from '../../state';
import { processSearchParams } from '../../state/search/helpers';
import { SearchActionTypes } from '../../state/search/types';
import { AppThunkDispatch } from '../../state/thunk';
import { thunkSearch } from '../../state/search/thunks';
import { FiSliders } from 'react-icons/fi';

const loaderCSS = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SearchPageDataType extends PageProps {}

const SearchPage = (args: SearchPageDataType) => {
  const searching = isSSR
    ? undefined
    : useSelector<RootState, boolean>((state) => state.searchReducer.searching);
  let dispatchSearchThunk: AppThunkDispatch<SearchActionTypes>;
  if (!isSSR) {
    dispatchSearchThunk = useDispatch<AppThunkDispatch<SearchActionTypes>>();
  }
  const foundSearchParams = processSearchParams(args.location.search);
  useEffect(() => {
    // only run on component mount
    if (args.location.search.length > 0 && foundSearchParams && !searching) {
      dispatchSearchThunk(thunkSearch());
    }
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
  return (
    <Layout location={args.location}>
      <SEO title="Search" />
      <Container
        fluid="xl"
        className='search-page-container'
      >
        <Row>
          <Col
            xs={3}
            className='search-page-col-div'
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
              className='search-page-row-div'
            >
              <Filters />
            </Col>
          )}
          <Col>
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
              <Container>
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
              </Container>
            )}
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default SearchPage;
