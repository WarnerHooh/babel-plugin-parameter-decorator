"use strict";

// DEBUG
var generate = require('@babel/generator').default;

module.exports = function (_ref) {
  var types = _ref.types;
  return {
    visitor: {
      Function: function Function(path) {
        var functionName = '';

        if (path.node.id) {
          functionName = path.node.id.name;
        }

        (path.get('params') || []).slice().forEach(function (param) {
          //const name = param.node.name || (param.node.parameter && param.node.parameter.name);
          console.log(param.node.name, param.key);
          var resultantDecorator;
          (param.node.decorators || []).slice().forEach(function (decorator) {
            var classDeclaration = path.findParent(function (p) {
              return p.node.type === 'VariableDeclaration';
            });
            var classDeclarator = path.findParent(function (p) {
              return p.node.type === 'VariableDeclarator';
            });
            var className = classDeclarator.node.id.name;
            resultantDecorator = types.callExpression(decorator.expression, [types.Identifier("".concat(className, ".prototype")), types.StringLiteral(functionName), types.NumericLiteral(param.key)]);
            var expression = types.expressionStatement(resultantDecorator);
            classDeclaration.insertAfter(expression);
          });

          if (resultantDecorator) {
            //param.replaceWith(types.Identifier(name));
            // Delete the decorators because we have generated code to handle them.
            delete param.node.decorators; //param.replaceWith({...param.node, decorators: []})
          }
        });
      }
    }
  };
};