import { z, ZodType } from 'zod';
import { useToast } from './useToast';

type ZodIssue = z.ZodError['issues'][number];

export type ErrorMessages = Record<string, string>;

export function useFormValidation() {
  const { showToast } = useToast();

  function validateWithSchema<T>(
    schema: ZodType<T>,
    values: unknown,
  ): {
    errors: Record<string, string>;
    isValid: boolean;
  } {
    const result = schema.safeParse(values);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err: ZodIssue) => {
        const field = err.path[0]?.toString() || 'form';
        errors[field] = err.message;
      });

      showToast('Please correct the highlighted errors.', 'error');

      return { errors, isValid: false };
    }

    return { errors: {}, isValid: true };
  }

  return { validateWithSchema };
}
