import { RequestParams } from '@elastic/elasticsearch';

interface PageArgs {
  perpage?: number;
  page?: number;
}

export const checkPaginationArgs = (args: PageArgs): void => {
  if ((args.perpage === undefined) !== (args.page === undefined)) {
    throw new Error('per page and page should be defined or not defined');
  }
};

export const setPaginationArgs = (args: PageArgs, searchParams: RequestParams.Search): void => {
  if (args.perpage && args.page) {
    searchParams.from = args.page;
    searchParams.size = args.perpage;
  }
};
