import { NextFunction } from 'express';
import { Response } from 'express';
import { Request } from 'express';
import { SelectQueryBuilder } from 'typeorm';
import { PaginationAwareObject, paginate, paginateRaw } from './helpers/pagination';
declare module 'typeorm' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface SelectQueryBuilder<Entity> {
    paginate<T>(perPage?: number | null): Promise<PaginationAwareObject<T>>;
    paginateRaw<T>(perPage?: number | null): Promise<PaginationAwareObject<T>>;
  }
}

/**
 * Boot the package by patching the SelectQueryBuilder
 *
 */
export function pagination<T>(req: Request, res: Response, next: NextFunction): void {
  (SelectQueryBuilder.prototype as any).paginate = async function (
    this: SelectQueryBuilder<T>,
    perPage?: number | null
  ): Promise<PaginationAwareObject<T>> {
    const currentPage = getPage(req);
    if (!perPage) {
      perPage = getPerPage(req);
    }
    // If not set, then get from request, default to 20
    else {
      perPage = getPerPage(req, perPage);
    } // If set, check if the request has per_page (which will override), or fallback to the set default
    return await paginate(this, currentPage, perPage);
  };
  (SelectQueryBuilder.prototype as any).paginateRaw = async function (
    this: SelectQueryBuilder<T>,
    perPage?: number | null
  ): Promise<PaginationAwareObject<T>> {
    const currentPage = getPage(req);
    const getAll = req.query.getAll === 'true';
    if (!perPage) {
      perPage = getPerPage(req);
    }
    // If not set, then get from request, default to 20
    else {
      perPage = getPerPage(req, perPage);
    } // If set, check if the request has per_page (which will override), or fallback to the set default
    return await paginateRaw(this, currentPage, perPage, getAll);
  };
  next();
}
export function getPerPage(req: Request, defaultPerPage = 20): number {
  return parseInt(req.query.perPage as string, 10) || defaultPerPage;
}
export function getPage(req: Request, defaultPage = 1): number {
  return parseInt(req.query.page as string, 10) || defaultPage;
}
