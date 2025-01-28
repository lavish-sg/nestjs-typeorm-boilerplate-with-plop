import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function NotEqualsProperty(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'notEqualsProperty',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value !== relatedValue; // for checking if the current password and new password are not the same
        },
      },
    });
  };
}
