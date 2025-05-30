import { useToast } from './useToast';

type FieldValues = Record<string, string>;
type ErrorMessages = Record<string, string>;

interface ValidationOptions {
  fields: string[];
  values: FieldValues;
  labels?: Record<string, string>;
}

export const useFormValidation = () => {
  const { showToast } = useToast();

  const validate = ({
    fields,
    values,
    labels = {},
  }: ValidationOptions): {
    errors: ErrorMessages;
    isValid: boolean;
  } => {
    const errors: ErrorMessages = {};

    fields.forEach((field) => {
      if (!values[field]?.trim()) {
        errors[field] = `${labels[field] || field} is required`;
      }
    });

    if (Object.keys(errors).length > 0) {
      showToast('Please fill in all required fields', 'error');
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
    };
  };

  return { validate };
};
