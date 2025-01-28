import { SelectQueryBuilder } from 'typeorm';

export const paginate = async function <T>(
  builder: SelectQueryBuilder<T>,
  page: number,
  perPage: number
): Promise<PaginationAwareObject<T>> {
  const skip = (page - 1) * perPage;
  const total = builder;
  const count = await total.getCount();
  const calculeLastPage = count % perPage;
  const lastPage = calculeLastPage === 0 ? count / perPage : Math.trunc(count / perPage) + 1;
  const res = await builder.skip(skip).take(perPage).getMany();
  return {
    from: skip <= count ? skip + 1 : null,
    to: count > skip + perPage ? skip + perPage : count,
    perPage: perPage,
    total: count,
    currentPage: page,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: count > skip + perPage ? page + 1 : null,
    lastPage: lastPage,
    data: res || [],
  };
};
export const paginateRaw = async function <T>(
  builder: SelectQueryBuilder<T>,
  page: number,
  perPage: number,
  getAll?: boolean
): Promise<PaginationAwareObject<T>> {
  const total = builder;
  if (getAll) {
    perPage = await total.getCount();
  }
  const skip = (page - 1) * perPage;
  const count = await total.getCount();
  const calculeLastPage = count % perPage;
  const lastPage = calculeLastPage === 0 ? count / perPage : Math.trunc(count / perPage) + 1;
  const res = await builder.offset(skip).limit(perPage).getRawMany();
  return {
    from: skip <= count ? skip + 1 : null,
    to: count > skip + perPage ? skip + perPage : count,
    perPage: perPage,
    total: count,
    currentPage: page,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: count > skip + perPage ? page + 1 : null,
    lastPage: lastPage,
    data: res || [],
  };
};

export interface PaginationAwareObject<T> {
  from: number;
  to: number;
  perPage: number;
  total: number;
  currentPage: number;
  prevPage?: number | null;
  nextPage?: number | null;
  lastPage: number | null;
  data: T[];
}
