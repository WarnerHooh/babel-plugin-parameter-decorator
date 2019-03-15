import {validate, required} from './decorators'

export default class Greeter {
    constructor(@required('name') private greeting: string) {
    }

    @validate
    greet(@required('name') name: string) {
        return "Hello " + name + ", " + this.greeting;
    }

    welcome(@required('firstName') firstName: string, @required('lastName') lastName: string) {
        return "Welcome " + lastName + "." + firstName;
    }
}