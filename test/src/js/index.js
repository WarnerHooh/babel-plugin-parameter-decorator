import {validate, required, optional} from '../decorators'

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
  talk(@optional name = 'friend') {
    return "Nice talk to you " + name + ".";
  }

  @validate
  welcome(@required('firstName') firstName, @required('lastName') lastName) {
    return "Welcome " + lastName + "." + firstName;
  }

  @validate
  meet(@required('guest') { name: nickname, title }) {
    return "Nice to meet you " + title + ' ' + nickname + '.';
  }
}
