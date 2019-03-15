import {validate, required, Optional} from './decorators'

export default class Greeter {
    constructor(@Optional() private greeting: string) {
    }

    @validate
    greet(@required('name') name: string) {
        return "Hello " + name + ", " + this.greeting;
    }

    @validate
    welcome(@required('firstName') firstName: string, @required('lastName') lastName: string) {
        return "Welcome " + lastName + "." + firstName;
    }
}