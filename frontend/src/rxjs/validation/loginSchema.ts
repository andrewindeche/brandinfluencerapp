import { z } from 'zod';

export const loginSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required' })
      .nonempty('Email is required')
      .email('Invalid email format')
      .regex(/^[a-zA-Z0-9@._-]+$/, 'Invalid characters in email')
      .transform((val) => val.trim()),

    password: z
      .string({ required_error: 'Password is required' })
      .nonempty('Password is required')
      .min(8, 'Password must be at least 8 characters long')
      .regex(/^(?=.*[A-Z])(?=.*\d).+$/, {
        message:
          'Password must contain at least one uppercase letter and one number',
      })
      .refine(
        (val) => !['password', '123456', 'qwerty'].includes(val.toLowerCase()),
        { message: 'Password is too common' },
      ),

    username: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.username && data.password && data.username === data.password) {
      ctx.addIssue({
        path: ['password'],
        code: z.ZodIssueCode.custom,
        message: 'Username and password must not match!',
      });
    }
  });
