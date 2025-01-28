import { UnprocessableEntityException } from '@nestjs/common';

export function validationExceptionFactory(errors) {
  const errorsByField = errors?.reduce((acc, error) => {
    const { property, constraints } = error;
    acc[property] = acc[property] || [];
    acc[property].push(...Object.values(constraints || {})); // Combine constraints
    return acc;
  });
  return new UnprocessableEntityException({
    statusCode: 422,
    message: 'Validation Error',
    data: errorsByField,
  });
}
