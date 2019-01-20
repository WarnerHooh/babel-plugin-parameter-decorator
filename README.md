# Babel Plugin Parameter Decorator

Function parameter decorator transform plugin for babel v7, just like typescript [parameter decorator](https://www.typescriptlang.org/docs/handbook/decorators.html#parameter-decorators)

```javascript
function required(target, propertyKey, parameterIndex) {
  
}
```

#### NOTE:

This package depends on `@babel/plugin-proposal-decorators`.

## Installation & Usage

`npm install  @babel/plugin-proposal-decorators babel-plugin-parameter-decorator -D`

And the `.babelrc` looks like: 

```
    {
        "plugins": [
            ["@babel/plugin-proposal-decorators", { "legacy": true }],
            "babel-plugin-parameter-decorator"
        ]
    }
```