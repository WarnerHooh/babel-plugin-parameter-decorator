"use strict";

var _path = require("path");

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

module.exports = function (_ref) {
  var types = _ref.types;

  var decoratorExpressionForConstructor = function decoratorExpressionForConstructor(decorator, param) {
    return function (className) {
      var resultantDecorator = types.callExpression(decorator.expression, [types.Identifier(className), types.Identifier('undefined'), types.NumericLiteral(param.key)]);
      var resultantDecoratorWithFallback = types.logicalExpression("||", resultantDecorator, types.Identifier(className));
      var assignment = types.assignmentExpression('=', types.Identifier(className), resultantDecoratorWithFallback);
      return types.expressionStatement(assignment);
    };
  };

  var decoratorExpressionForMethod = function decoratorExpressionForMethod(decorator, param) {
    return function (className, functionName) {
      var resultantDecorator = types.callExpression(decorator.expression, [types.Identifier("".concat(className, ".prototype")), types.StringLiteral(functionName), types.NumericLiteral(param.key)]);
      return types.expressionStatement(resultantDecorator);
    };
  };

  var findIdentifierAfterAssignment = function findIdentifierAfterAssignment(path) {
    var assignment = path.findParent(function (p) {
      return p.node.type === 'AssignmentExpression';
    });

    if (assignment.node.right.type === 'SequenceExpression') {
      return assignment.node.right.expressions[1].name;
    } else if (assignment.node.right.type === 'ClassExpression') {
      return assignment.node.left.name;
    }

    return null;
  };

  var getParamReplacement = function getParamReplacement(path) {
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
      Program: function Program(path, state) {
        var extension = (0, _path.extname)(state.file.opts.filename);

        if (extension === '.ts' || extension === '.tsx') {
          (function () {
            var decorators = Object.create(null);
            path.node.body.filter(function (it) {
              var type = it.type,
                  declaration = it.declaration;

              switch (type) {
                case "ClassDeclaration":
                  return true;

                case "ExportNamedDeclaration":
                case "ExportDefaultDeclaration":
                  return declaration && declaration.type === "ClassDeclaration";

                default:
                  return false;
              }
            }).map(function (it) {
              return it.type === 'ClassDeclaration' ? it : it.declaration;
            }).forEach(function (clazz) {
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
              });
            });
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = path.get("body")[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var stmt = _step.value;

                if (stmt.node.type === 'ImportDeclaration') {
                  if (stmt.node.specifiers.length === 0) {
                    continue;
                  }

                  var _iteratorNormalCompletion2 = true;
                  var _didIteratorError2 = false;
                  var _iteratorError2 = undefined;

                  try {
                    var _loop = function _loop() {
                      var specifier = _step2.value;
                      var binding = stmt.scope.getBinding(specifier.local.name);

                      if (!binding.referencePaths.length) {
                        if (decorators[specifier.local.name]) {
                          binding.referencePaths.push({
                            parent: decorators[specifier.local.name]
                          });
                        }
                      } else {
                        var allTypeRefs = binding.referencePaths.reduce(function (prev, next) {
                          return prev || isInType(next);
                        }, false);

                        if (allTypeRefs) {
                          Object.keys(decorators).forEach(function (k) {
                            var decorator = decorators[k];
                            (decorator.expression.arguments || []).forEach(function (arg) {
                              if (arg.name === specifier.local.name) {
                                binding.referencePaths.push({
                                  parent: decorator.expression
                                });
                              }
                            });
                          });
                        }
                      }
                    };

                    for (var _iterator2 = stmt.node.specifiers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                      _loop();
                    }
                  } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                        _iterator2["return"]();
                      }
                    } finally {
                      if (_didIteratorError2) {
                        throw _iteratorError2;
                      }
                    }
                  }
                }
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                  _iterator["return"]();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }
          })();
        }
      },
      Function: function Function(path) {
        var functionName = '';

        if (path.node.id) {
          functionName = path.node.id.name;
        } else if (path.node.key) {
          functionName = path.node.key.name;
        }

        (path.get('params') || []).slice().forEach(function (param) {
          var decorators = param.node.decorators || [];
          var transformable = decorators.length;
          decorators.slice().forEach(function (decorator) {
            // For class support env
            if (path.type === 'ClassMethod') {
              var parentNode = path.parentPath.parentPath;
              var classDeclaration = path.findParent(function (p) {
                return p.type === 'ClassDeclaration';
              });
              var classIdentifier; // without class decorator

              if (classDeclaration) {
                classIdentifier = classDeclaration.node.id.name; // with class decorator
              } else {
                // Correct the temp identifier reference
                parentNode.insertAfter(null);
                classIdentifier = findIdentifierAfterAssignment(path);
              }

              if (functionName === 'constructor') {
                var expression = decoratorExpressionForConstructor(decorator, param)(classIdentifier); // TODO: the order of insertion

                parentNode.insertAfter(expression);
              } else {
                var _expression = decoratorExpressionForMethod(decorator, param)(classIdentifier, functionName); // TODO: the order of insertion


                parentNode.insertAfter(_expression);
              }
            } else {
              var classDeclarator = path.findParent(function (p) {
                return p.node.type === 'VariableDeclarator';
              });
              var className = classDeclarator.node.id.name;

              if (functionName === className) {
                var _expression2 = decoratorExpressionForConstructor(decorator, param)(className); // TODO: the order of insertion


                if (path.parentKey === 'body') {
                  path.insertAfter(_expression2); // In case there is only a constructor method
                } else {
                  var bodyParent = path.findParent(function (p) {
                    return p.parentKey === 'body';
                  });
                  bodyParent.insertAfter(_expression2);
                }
              } else {
                var classParent = path.findParent(function (p) {
                  return p.node.type === 'CallExpression';
                });

                var _expression3 = decoratorExpressionForMethod(decorator, param)(className, functionName); // TODO: the order of insertion


                classParent.insertAfter(_expression3);
              }
            }
          });

          if (transformable) {
            var replacement = getParamReplacement(param);
            param.replaceWith(replacement);
          }
        });
      }
    }
  };
};