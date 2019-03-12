// If we don't test using a `.ts` file we get:
//
// { SyntaxError: /xxx/babel-plugin-parameter-decorator/test/src/index.js: Unexpected reserved word 'private' (37:26)
//

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
}

function required(key) {
  return function (target, propertyKey, parameterIndex) {
    const metadata = `meta_${propertyKey}`;
    target[metadata] = [
      ...(target[metadata] || []),
      {
        index: parameterIndex,
        key
      }
    ]
  };
}

function validate(target, property, descriptor) {
  console.log({target, property, descriptor})
  const fn = descriptor.value;

  descriptor.value = function (...args) {
    const metadata = `meta_${property}`;
    target[metadata].forEach(function (metadata) {
      if (args[metadata.index] === undefined) {
        throw new Error(`${metadata.key} is required`);
      }
    });

    return fn.apply(this, args);
  };

  return descriptor;
}
