// If we don't test using a `.ts` file we get:
//
// { SyntaxError: /xxx/babel-plugin-parameter-decorator/test/src/index.js: Unexpected reserved word 'private' (37:26)
//

import {required, validate} from './decorator'

const Query = () => () => {}
const Ctx = () => () => {}
const Context = {}
const PetModel = {}
const Pet = {}

export default class Greeter {

  greeting: string
  firstName: string
  lastName: string

  constructor(@required('message') message) {
    this.greeting = message;
  }

  @validate
  greet(@required('name') name) {
    return "Hello " + name + ", " + this.greeting;
  }

  @validate
  welcome(@required('firstName') firstName, @required('lastName') lastName) {
    return "Welcome " + lastName + "." + firstName;
  }

  @Query(returns => [Pet])
  public pets(@Ctx() { requestId }: Context): Promise<PetModel[]> {
    this.log.info(`{${requestId}} Find all users`)
    return this.petService.find()
  }

}
