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

export const hasPagination = (args: PageArgs): boolean => {
  return (args.perpage !== undefined) && (args.page !== undefined);
};

export const setPaginationArgs = (args: PageArgs, searchParams: RequestParams.Search): void => {
  if (hasPagination(args)) {
    searchParams.from = args.page;
    searchParams.size = args.perpage;
  }
};
