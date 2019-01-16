function decoratorBuilder(type) {
  return function (key) {
    return function (target, methodName, paramIndex) {
      console.log(`---- @${type} ----`);
      console.log('key: ', key);
      console.log('target: ', target);
      console.log('methodName: ', methodName);
      console.log('paramIndex: ', paramIndex);
      console.log('paramIndex: ', paramIndex);
    };
  };
}

export const Foo = decoratorBuilder('Foo');
export const Bar = decoratorBuilder('Bar');
export const Baz = decoratorBuilder('Baz');