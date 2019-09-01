import { extname } from 'path';

function isInType(path) {
  switch (path.parent.type) {
    case "TSTypeReference":
    case "TSQualifiedName":
    case "TSExpressionWithTypeArguments":
    case "TSTypeQuery":
      return true;

    default:
      return false;
  }
}

module.exports = function ({ types }) {
  return {
    visitor: {
      /**
       * For typescript compilation. Avoid import statement of param decorator functions being Elided.
       */
      Program(path, state) {
        const extension = extname(state.file.opts.filename);

        if (extension === '.ts') {
          const decorators = Object.create(null);

          path.node.body
            .filter(it => it.type === 'ClassDeclaration' || (it.type === 'ExportDefaultDeclaration' && it.declaration.type === 'ClassDeclaration'))
            .map(it => {
              return it.type === 'ClassDeclaration' ? it : it.declaration;
            })
            .forEach(clazz => {
              clazz.body.body.forEach(function (body) {

                (body.params || []).forEach(function (param) {
                  (param.decorators || []).forEach(function (decorator) {
                    if (decorator.expression.callee) {
                      decorators[decorator.expression.callee.name] = decorator;
                    } else {
                      decorators[decorator.expression.name] = decorator;
                    }
                  });
                });
              })
            });

          for (const stmt of path.get("body")) {
            if (stmt.node.type === 'ImportDeclaration') {

              if (stmt.node.specifiers.length === 0) {
                continue;
              }

              for (const specifier of stmt.node.specifiers) {
                const binding = stmt.scope.getBinding(specifier.local.name);

                if (!binding.referencePaths.length) {
                  if (decorators[specifier.local.name]) {
                    binding.referencePaths.push({
                      parent: decorators[specifier.local.name]
                    });
                  }
                } else {
                  const allTypeRefs = binding.referencePaths.reduce((prev, next) => prev || isInType(next), false);
                  if (allTypeRefs) {
                    Object.keys(decorators).forEach(k => {
                      const decorator = decorators[k];

                      (decorator.expression.arguments || []).forEach(arg => {
                        if (arg.name === specifier.local.name) {
                          binding.referencePaths.push({
                            parent: decorator.expression
                          });
                        }
                      })
                    })
                  }
                }
              }
            }
          }
        }
      },
      Function: function (path) {
        let functionName = '';

        if (path.node.id) {
          functionName = path.node.id.name;
        } else if (path.node.key) {
          functionName = path.node.key.name;
        }

        (path.get('params') || [])
          .slice()
          .forEach(function (param) {
            const name = param.node.type === 'TSParameterProperty' ? param.node.parameter.name : param.node.name;

            let resultantDecorator;

            (param.node.decorators || [])
              .slice()
              .forEach(function (decorator) {
                const classDeclarator = path.findParent(p => p.node.type === 'VariableDeclarator');
                const className = classDeclarator.node.id.name;

                if (functionName === className) {
                  resultantDecorator = types.callExpression(
                    decorator.expression, [
                      types.Identifier(className),
                      types.Identifier('undefined'),
                      types.NumericLiteral(param.key)
                    ]
                  );
                  const assignment = types.assignmentExpression('=', types.Identifier(className), resultantDecorator);
                  const expression = types.expressionStatement(assignment);
                  // TODO: the order of insertion
                  path.insertAfter(expression);
                } else {
                  const classParent = path.findParent(function (p) {
                    return p.node.type === 'CallExpression';
                  });
                  resultantDecorator = types.callExpression(
                    decorator.expression, [
                      types.Identifier(`${className}.prototype`),
                      types.StringLiteral(functionName),
                      types.NumericLiteral(param.key)
                    ]
                  );

                  const expression = types.expressionStatement(resultantDecorator);
                  // TODO: the order of insertion
                  classParent.insertAfter(expression);
                }

              });

            if (resultantDecorator) {
              param.replaceWith(types.Identifier(name));
            }
          });

      }
    }
  }
};
