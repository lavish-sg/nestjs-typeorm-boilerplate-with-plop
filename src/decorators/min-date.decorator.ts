import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function minDateField(
  dateField: (object: any) => Date,
  validationOptions?: ValidationOptions
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'minDateField',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const relatedValue = dateField(args.object);
          const relatedDate = new Date(relatedValue);
          const valueDate = new Date(value);
          return valueDate >= relatedDate;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must not be before bidDue`;
        },
      },
    });
  };
}
