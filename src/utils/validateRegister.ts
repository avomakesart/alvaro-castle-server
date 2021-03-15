import { UsernamePasswordInput } from '../resolvers/UsernamePasswordInput';

export const validateRegister = (options: UsernamePasswordInput) => {
  if (options.firstName.length <= 2) {
    return [
      {
        field: 'firstName',
        message: 'Length must be greater than 2',
      },
    ];
  }

  if (options.firstName.length < 0) {
    return [
      {
        field: 'firstName',
        message: 'First name should not be empty.',
      },
    ];
  }

  if (options.lastName.length <= 2) {
    return [
      {
        field: 'lastName',
        message: 'Length must be greater than 2',
      },
    ];
  }

  if (options.lastName.length < 0) {
    return [
      {
        field: 'lastName',
        message: 'Last name should not be empty.',
      },
    ];
  }

  if (!options.email.includes('@')) {
    return [
      {
        field: 'email',
        message: 'invalid email',
      },
    ];
  }

  if (options.username.length <= 2) {
    return [
      {
        field: 'username',
        message: 'length must be greater than 2',
      },
    ];
  }

  if (options.username.includes('@')) {
    return [
      {
        field: 'username',
        message: 'cannot include an @',
      },
    ];
  }

  if (options.password.length <= 2) {
    return [
      {
        field: 'password',
        message: 'length must be greater than 2',
      },
    ];
  }

  return null;
};
