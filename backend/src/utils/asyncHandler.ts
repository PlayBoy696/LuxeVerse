import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import type { ParamsDictionary } from "express-serve-static-core";

type AsyncHandler<P = ParamsDictionary> = (
  req: Request<P>,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler = <P = ParamsDictionary>(
  handler: AsyncHandler<P>
): RequestHandler<P> => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};