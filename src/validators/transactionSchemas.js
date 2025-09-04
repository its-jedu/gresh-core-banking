const { z } = require('zod');

exports.depositSchema = z.object({
  body: z.object({
    account_number: z.string().min(10),
    amount: z.number().positive(),
    reference: z.string().min(3)
  })
});

exports.withdrawSchema = z.object({
  body: z.object({
    account_number: z.string().min(10),
    amount: z.number().positive(),
    reference: z.string().min(3)
  })
});

exports.transferSchema = z.object({
  body: z.object({
    source_account: z.string().min(10),
    destination_account: z.string().min(10),
    amount: z.number().positive(),
    reference: z.string().min(3)
  })
});

