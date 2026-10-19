import HttpError from '../utils/httpError.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new HttpError(400, 'Input tidak valid.', result.error.issues.map((issue) => ({
        field: issue.path.join('.'), message: issue.message,
      }))));
    }
    if (source === 'query') req.validatedQuery = result.data;
    else req[source] = result.data;
    return next();
  };
}
