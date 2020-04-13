import {validate, required, optional, Inject, Factory} from '../decorators'
import Sentinel, {Counter} from './Sentinel'
import { UserRepo } from './UserRepo';

@Factory
export class Greeter {

  private counter: Counter = this.sentinel.counter;

  constructor(
    private greeting: string,
    @Inject(Sentinel) private sentinel: Sentinel,
    @Inject(UserRepo) private userRepo: UserRepo
  ) {}

  @validate
  greet(@required('name') name: string, @optional emoj) {
    this.sentinel.count();

    const greeting = 'how are you?';
    return "Hello " + name + ", " + (this.greeting || greeting);
  }

  @validate
  talk(@optional name: string = 'friend') {
    return "Nice talk to you " + name + ".";
  }

  @validate
  welcome(@required('firstName') firstName: string, @required('lastName') lastName: string) {
    this.sentinel.count();

    return "Welcome " + lastName + "." + firstName;
  }

  @validate
  meet(@required('guest') { name: nickname, title }) {
    this.sentinel.count();

    return "Nice to meet you " + title + ' ' + nickname + '.';
  }

  count() {
    return this.counter.number;
  }
}

export default Greeter;

function myFunctionToBeExported() {}

export {
  myFunctionToBeExported
}
