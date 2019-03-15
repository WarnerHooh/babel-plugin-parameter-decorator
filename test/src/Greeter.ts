import {validate, required, Optional} from './decorators'

export default class Greeter {
    constructor(@Optional() private greeting: string) {
    }

    @validate
    greet(@required('name') name: string) {
        const greeting = 'how are you?';
        return "Hello " + name + ", " + (this.greeting || greeting);
    }

    @validate
    welcome(@required('firstName') firstName: string, @required('lastName') lastName: string) {
        return "Welcome " + lastName + "." + firstName;
    }
}