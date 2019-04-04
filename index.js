import traverse from "babel-traverse";
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

          try {
            traverse(path.node, {
              enter(program) {
                const declaration = program.node.declaration;
                if (declaration && declaration.type === 'ClassDeclaration') {
                  declaration.body.body
                    .filter(function(node) {
                      return node.type === 'ClassMethod';
                    })
                    .forEach(function (body) {
                      (body.params || []).forEach(function (param) {
                        (param.decorators || []).forEach(function (decorator) {
                          decorators[decorator.expression.callee.name] = decorator;
                        })
                      });
                    })
                }
              }
            });
          } catch (e) {
          }

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

                      decorator.expression.arguments.forEach(arg => {
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
        }

        (path.get('params') || [])
          .slice()
          .forEach(function (param) {
            const name = param.node.type === 'TSParameterProperty' ? param.node.parameter.name : param.node.name;

            let resultantDecorator;

            (param.node.decorators || [])
              .slice()
              .forEach(function (decorator) {
                const classDeclaration = path.findParent(p => p.node.type === 'VariableDeclaration');
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
                } else {
                  resultantDecorator = types.callExpression(
                    decorator.expression, [
                      types.Identifier(`${className}.prototype`),
                      types.StringLiteral(functionName),
                      types.NumericLiteral(param.key)
                    ]
                  );
                }

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
