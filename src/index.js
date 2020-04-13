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
  const decoratorExpressionForConstructor = (decorator, param) => (className) => {
    const resultantDecorator = types.callExpression(
      decorator.expression, [
        types.Identifier(className),
        types.Identifier('undefined'),
        types.NumericLiteral(param.key)
      ]
    );
    const resultantDecoratorWithFallback = types.logicalExpression("||", resultantDecorator, types.Identifier(className));
    const assignment = types.assignmentExpression('=', types.Identifier(className), resultantDecoratorWithFallback);
    return types.expressionStatement(assignment);
  };

  const decoratorExpressionForMethod = (decorator, param) => (className, functionName) => {
    const resultantDecorator = types.callExpression(
      decorator.expression, [
        types.Identifier(`${className}.prototype`),
        types.StringLiteral(functionName),
        types.NumericLiteral(param.key)
      ]
    );

    return types.expressionStatement(resultantDecorator);
  };

  const findIdentifierAfterAssignment = (path) => {
    const assignment = path.findParent(p => p.node.type === 'AssignmentExpression');

    if (assignment.node.right.type === 'SequenceExpression') {
      return assignment.node.right.expressions[1].name;
    } else if (assignment.node.right.type === 'ClassExpression') {
      return assignment.node.left.name;
    }

    return null;
  };

  const getParamReplacement = (path) => {
    switch (path.node.type) {
      case 'ObjectPattern':
        return types.ObjectPattern(path.node.properties);
      case 'AssignmentPattern':
        return types.AssignmentPattern(path.node.left, path.node.right);
      case 'TSParameterProperty':
        return types.Identifier(path.node.parameter.name);
      default:
        return types.Identifier(path.node.name);
    }
  };

  return {
    visitor: {
      /**
       * For typescript compilation. Avoid import statement of param decorator functions being Elided.
       */
      Program(path, state) {
        const extension = extname(state.file.opts.filename);

        if (extension === '.ts' || extension === '.tsx') {
          const decorators = Object.create(null);

          path.node.body
            .filter(it => {
              const { type, declaration } = it;
              
              switch (type) {
                case "ClassDeclaration":
                  return true;
                
                case "ExportNamedDeclaration":
                case "ExportDefaultDeclaration":
                  return declaration && declaration.type === "ClassDeclaration";
                
                default:
                  return false;
              }
            })
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
            const decorators = (param.node.decorators || []);
            const transformable = decorators.length;

            decorators.slice()
              .forEach(function (decorator) {

                // For class support env
                if (path.type === 'ClassMethod') {
                  const parentNode = path.parentPath.parentPath;
                  const classDeclaration = path.findParent(p => p.type === 'ClassDeclaration');

                  let classIdentifier;

                  // without class decorator
                  if (classDeclaration) {
                    classIdentifier = classDeclaration.node.id.name;
                  // with class decorator
                  } else {
                    // Correct the temp identifier reference
                    parentNode.insertAfter(null);
                    classIdentifier = findIdentifierAfterAssignment(path);
                  }

                  if (functionName === 'constructor') {
                    const expression = decoratorExpressionForConstructor(decorator, param)(classIdentifier);
                    // TODO: the order of insertion
                    parentNode.insertAfter(expression);
                  } else {
                    const expression = decoratorExpressionForMethod(decorator, param)(classIdentifier, functionName);
                    // TODO: the order of insertion
                    parentNode.insertAfter(expression);
                  }
                } else {
                  const classDeclarator = path.findParent(p => p.node.type === 'VariableDeclarator');
                  const className = classDeclarator.node.id.name;

                  if (functionName === className) {
                    const expression = decoratorExpressionForConstructor(decorator, param)(className);
                    // TODO: the order of insertion
                    if (path.parentKey === 'body') {
                      path.insertAfter(expression);
                    // In case there is only a constructor method
                    } else {
                      const bodyParent = path.findParent(p => p.parentKey === 'body');
                      bodyParent.insertAfter(expression);
                    }
                  } else {
                    const classParent = path.findParent(p => p.node.type === 'CallExpression');
                    const expression = decoratorExpressionForMethod(decorator, param)(className, functionName);
                    // TODO: the order of insertion
                    classParent.insertAfter(expression);
                  }
                }
              });

            if (transformable) {
              const replacement = getParamReplacement(param);
              param.replaceWith(replacement);
            }
          });
      }
    }
  }
};
