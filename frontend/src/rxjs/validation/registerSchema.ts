import { z } from 'zod';

export const registerSchema = z
  .object({
    username: z
      .string({ required_error: 'Username is required' })
      .nonempty('Username is required')
      .min(3, 'Username must be at least 3 characters long')
      .max(20, 'Username must be at most 20 characters long')
      .regex(/^[a-zA-Z0-9._-]+$/, {
        message:
          'Username can only contain letters, numbers, dots, underscores, and hyphens',
      }),

    email: z
      .string({ required_error: 'Email is required' })
      .nonempty('Email is required')
      .email('Invalid email address')
      .regex(/^[a-zA-Z0-9@._-]+$/, 'Invalid characters in email')
      .transform((val) => val.trim()),

    password: z
      .string({ required_error: 'Password is required' })
      .nonempty('Password is required')
      .min(8, 'Password must be at least 8 characters long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
      )
      .refine(
        (val) => !['password', '123456', 'qwerty'].includes(val.toLowerCase()),
        { message: 'Password is too common' },
      ),

    confirmPassword: z
      .string({ required_error: 'Confirmation password is required' })
      .nonempty('Confirmation password is required'),

    role: z.enum(['brand', 'influencer', 'admin', 'superuser'], {
      required_error: 'Role is required',
      invalid_type_error:
        'Role must be one of the following: brand, influencer, admin, superuser',
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: z.ZodIssueCode.custom,
        message: 'Confirmation password must match the password',
      });
    }

    if (data.username && data.password && data.username === data.password) {
      ctx.addIssue({
        path: ['password'],
        code: z.ZodIssueCode.custom,
        message: 'Username and password must not match!',
      });
    }
  });
