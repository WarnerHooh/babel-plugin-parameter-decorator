# Babel Plugin Parameter Decorator

[![](https://travis-ci.com/WarnerHooh/babel-plugin-parameter-decorator.svg?branch=master)](https://travis-ci.com/WarnerHooh/babel-plugin-parameter-decorator)
[![](https://badge.fury.io/js/babel-plugin-parameter-decorator.svg)](https://badge.fury.io/js/babel-plugin-parameter-decorator)
[![](https://img.shields.io/npm/dt/babel-plugin-parameter-decorator.svg)](https://www.npmjs.com/package/babel-plugin-parameter-decorator)
[![](https://img.shields.io/npm/dm/babel-plugin-parameter-decorator.svg)](https://www.npmjs.com/package/babel-plugin-parameter-decorator)

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

By default, `@babel/preset-typescript` will remove imports only referenced in Decorators.
Since this is prone to break Decorators, make sure [disable it by setting `onlyRemoveTypeImports` to true](https://babeljs.io/docs/en/babel-preset-typescript#onlyremovetypeimports):

```
{
  ...
  "presets": [
    [
      "@babel/preset-typescript",
      { "onlyRemoveTypeImports": true }
    ]
  ]
  ...
}
```

## Additional

If you'd like to compile typescript files by babel, the file extensions `.ts` or `.tsx` expected, or we will get runtime error! 

🎊 Hopefully this plugin would get along with typescript `private/public` keywords in `constructor`. For [example](https://github.com/WarnerHooh/babel-plugin-parameter-decorator/blob/dev/test/src/ts/Greeter.ts),

```typescript
@Factory
class Greeter {
  
  private counter: Counter = this.sentinel.counter;
  
  constructor(private greeting: string, @Inject(Sentinel) private sentinel: Sentinel) {
  }

  @validate
  greet(@required('name') name: string) {
    return "Hello " + name + ", " + this.greeting;
  }
  
  count() {
    return this.counter.number;
  }
}
```
And your `.babelrc` looks like:

```
{
  "presets": [
    "@babel/preset-env",
    "@babel/preset-typescript"
  ],
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose" : true }],
    "babel-plugin-parameter-decorator"
  ]
}
```
