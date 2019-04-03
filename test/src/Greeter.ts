import {validate, required, Inject} from './decorators'
import User from 'User'

export default class Greeter {

  public count: number = this.user.number;

  constructor(private greeting: string, @Inject(User) private user: User) {
  }

  @validate
  greet(@required('name') name: string) {
    this.user.count();

    const greeting = 'how are you?';
    return "Hello " + name + ", " + (this.greeting || greeting);
  }

  @validate
  welcome(@required('firstName') firstName: string, @required('lastName') lastName: string) {
    this.user.count();

    return "Welcome " + lastName + "." + firstName;
  }
}
