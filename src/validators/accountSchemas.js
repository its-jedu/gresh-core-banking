const { z } = require('zod');

exports.createAccountSchema = z.object({
  body: z.object({
    customer_id: z.string().uuid(),
    type: z.enum(['savings', 'current'])
  })
});
