import {validate, required} from '../decorators'

export default class Greeter {
  constructor(message) {
    this.greeting = message;
  }

  @validate
  greet(@required('name') name) {
    const greeting = 'how are you?';
    return "Hello " + name + ", " + (this.greeting || greeting);
  }

  @validate
  welcome(@required('firstName') firstName, @required('lastName') lastName) {
    return "Welcome " + lastName + "." + firstName;
  }
}
