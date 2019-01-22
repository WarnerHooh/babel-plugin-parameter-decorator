# Babel Plugin Parameter Decorator

Function parameter decorator transform plugin for babel v7, just like typescript [parameter decorator](https://www.typescriptlang.org/docs/handbook/decorators.html#parameter-decorators)

```javascript
function validate(target, property, descriptor) {
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

class Greeter {
    constructor(message) {
        this.greeting = message;
    }

    @validate
    greet(@required('name') name) {
        return "Hello " + name + ", " + this.greeting;
    }
}
```

#### NOTE:

This package depends on `@babel/plugin-proposal-decorators`.

## Installation & Usage

`npm install @babel/plugin-proposal-decorators babel-plugin-parameter-decorator -D`

And the `.babelrc` looks like: 

```
    {
        "plugins": [
            ["@babel/plugin-proposal-decorators", { "legacy": true }],
            "babel-plugin-parameter-decorator"
        ]
    }
```