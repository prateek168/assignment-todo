import { Request, Response, NextFunction, RequestHandler } from 'express';

export function asyncHandler(fn: Function): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
} 