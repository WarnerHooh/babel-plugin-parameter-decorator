"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _path = require("path");

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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

function _default(_ref) {
  var t = _ref.types;

  function decorateExpression(decorator, paramIndex, key, target) {
    return t.callExpression(decorator.expression, [target, key, paramIndex]);
  }

  function decorateMethod(decorator, paramIndex, methodName, className) {
    var key = t.StringLiteral(methodName);
    var target = t.Identifier("".concat(className, ".prototype"));
    return decorateExpression(decorator, paramIndex, key, target);
  }

  function decorateConstructor(decorator, paramIndex, className) {
    var key = t.Identifier('undefined');
    var target = t.Identifier(className);
    var expression = decorateExpression(decorator, paramIndex, key, target);
    var resultantDecoratorWithFallback = t.logicalExpression("||", expression, target);
    return t.assignmentExpression('=', target, resultantDecoratorWithFallback);
  }

  function decorateStatic(decorator, paramIndex, methodName, className) {
    var key = t.StringLiteral(methodName);
    var target = t.Identifier(className);
    return decorateExpression(decorator, paramIndex, key, target);
  }

  function decorate(decorator, paramIndex, path, className) {
    var isConstructor = path.node.kind === 'constructor';
    var isStatic = path.node["static"];
    var methodName = path.node.key.name;

    if (isStatic) {
      return decorateStatic(decorator, paramIndex, methodName, className);
    }

    if (isConstructor) {
      return decorateConstructor(decorator, paramIndex, className);
    }

    return decorateMethod(decorator, paramIndex, methodName, className);
  }

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
              return it.type === 'ClassDeclaration' || it.type === 'ExportDefaultDeclaration' && it.declaration.type === 'ClassDeclaration';
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

            var _iterator = _createForOfIteratorHelper(path.get("body")),
                _step;

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                var stmt = _step.value;

                if (stmt.node.type === 'ImportDeclaration') {
                  if (stmt.node.specifiers.length === 0) {
                    continue;
                  }

                  var _iterator2 = _createForOfIteratorHelper(stmt.node.specifiers),
                      _step2;

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

                    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                      _loop();
                    }
                  } catch (err) {
                    _iterator2.e(err);
                  } finally {
                    _iterator2.f();
                  }
                }
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
          })();
        }
      },
      ClassExpression: function ClassExpression(classPath) {
        var decorators = {
          _methods_: [],
          _constructor_: []
        };
        var clazz = t.isAssignmentExpression(classPath.parent) ? classPath.parent.left : classPath.node.id;
        classPath.traverse({
          ClassMethod: function ClassMethod(path) {
            var className = clazz.name;
            var isConstructor = path.node.kind === 'constructor';
            var expressions = (path.node.params || []).flatMap(function (param, idx) {
              var paramIndex = t.NumericLiteral(idx);
              var decorated = (param.decorators || []).map(function (decorator) {
                return decorate(decorator, paramIndex, path, className);
              });
              param.decorators = [];
              return decorated;
            });

            if (expressions.length > 0) {
              if (isConstructor) {
                decorators._constructor_.push(expressions);
              } else {
                decorators._methods_.push(expressions);
              }
            }
          }
        });
        [].concat((0, _toConsumableArray2["default"])(decorators._methods_), [decorators._constructor_]).forEach(function (decoratorsOfMethod) {
          decoratorsOfMethod.reverse().forEach(function (expressions) {
            classPath.parentPath.insertAfter(expressions);
          });
        });
      }
    }
  };
}

;