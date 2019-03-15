export function validate(target, property, descriptor) {
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

export function required(key) {
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

export function Optional() {
  return function (target, propertyKey, parameterIndex) {
  };
}