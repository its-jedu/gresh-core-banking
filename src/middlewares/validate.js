const { ZodError } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      req.validated = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(422).json({ error: err.errors.map(e => e.message) });
      }
      next(err);
    }
  };
}

module.exports = validate;
