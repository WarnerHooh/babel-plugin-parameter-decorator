import {validate, required, Inject, Factory} from './decorators'
import Sentinel, {Counter} from './Sentinel'

@Factory
class Greeter {

  public counter: Counter = this.sentinel.counter;

  constructor(private greeting: string, @Inject(Sentinel) private sentinel: Sentinel) {
  }

  @validate
  greet(@required('name') name: string) {
    this.sentinel.count();

    const greeting = 'how are you?';
    return "Hello " + name + ", " + (this.greeting || greeting);
  }

  @validate
  welcome(@required('firstName') firstName: string, @required('lastName') lastName: string) {
    this.sentinel.count();

    return "Welcome " + lastName + "." + firstName;
  }
}

export default Greeter;
