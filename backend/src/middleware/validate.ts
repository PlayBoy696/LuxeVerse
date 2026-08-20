import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validate = (
  schema: ZodType
): RequestHandler => {
  return (req, _res, next) => {
    const structuredResult = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (structuredResult.success) {
      const parsed = structuredResult.data as {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      };

      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.params !== undefined) req.params = parsed.params as typeof req.params;
      if (parsed.query !== undefined) req.query = parsed.query as typeof req.query;

      next();
      return;
    }

    const legacyResult = schema.safeParse(req.body);

    if (legacyResult.success) {
      req.body = legacyResult.data;
      next();
      return;
    }

    next(structuredResult.error ?? legacyResult.error);
  };
};