// Parses req.body with a zod schema; a failure throws a ZodError that the
// central error handler turns into a 400 with per-field messages.
export const validate = (schema) => (req, res, next) => {
  req.body = schema.parse(req.body);
  next();
};
