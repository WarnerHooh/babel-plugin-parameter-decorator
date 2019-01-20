module.exports = function ({types}) {
  return {
    visitor: {
      Function: function (path) {
        let functionName = '';

        if (path.node.id) {
          functionName = path.node.id.name;
        }

        (path.get('params') || [])
          .slice()
          .forEach(function (param) {
            const name = param.node.name;

            let resultantDecorator;

            (param.node.decorators || [])
              .slice()
              .forEach(function (decorator) {
                const classDeclaration = path.findParent(p => p.node.type === 'VariableDeclaration');
                const classDeclarator = path.findParent(p => p.node.type === 'VariableDeclarator');
                const className = classDeclarator.node.id.name;

                resultantDecorator = types.callExpression(
                  decorator.expression, [
                    types.Identifier(`${className}.prototype`),
                    types.StringLiteral(functionName),
                    types.NumericLiteral(param.key)
                  ]
                );

                const expression = types.expressionStatement(resultantDecorator);

                classDeclaration.insertAfter(expression);
              });

            if (resultantDecorator) {
              param.replaceWith(types.Identifier(name));
            }
          });

      }
    }
  }
};