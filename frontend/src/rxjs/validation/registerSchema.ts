import { z } from 'zod';

export const registerSchema = z
  .object({
    username: z
      .string()
      .nonempty('Username is required')
      .min(3, 'Username must be at least 3 characters long')
      .max(20, 'Username must be at most 20 characters long')
      .regex(/^[a-zA-Z0-9._-]+$/, {
        message:
          'Username can only contain letters, numbers, dots, underscores, and hyphens',
      }),

    email: z
      .email({ message: 'Invalid email format' })
      .regex(/^[a-zA-Z0-9@._-]+$/, { message: 'Invalid characters in email' })
      .transform((val) => val.trim()),

    password: z
      .string()
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
      .string()
      .nonempty('Confirmation password is required'),

    role: z
      .enum(['brand', 'influencer', 'admin', 'superuser'])
      .refine((val) => val !== undefined, {
        message:
          'Role must be one of the following: brand, influencer, admin, superuser',
      }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: "custom",
        message: 'Confirmation password must match the password',
      });
    }

    if (data.username && data.password && data.username === data.password) {
      ctx.addIssue({
        path: ['password'],
        code: "custom",
        message: 'Username and password must not match!',
      });
    }
  });
