import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsMatchingCredentials(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsMatchingCredentials',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const { email, password } = args.object as any;

          return email !== password;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Username and password must not match!';
        },
      },
    });
  };
}
