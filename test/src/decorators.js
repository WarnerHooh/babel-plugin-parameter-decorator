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

export function Inject(Clazz) {
  return function (target, unusedKey, parameterIndex) {
    const metadata = `meta_ctr_inject`;
    target[metadata] = target[metadata] || [];
    target[metadata][parameterIndex] = Clazz;

    return target;
  };
}

export function Factory(target) {
  const metadata = `meta_ctr_inject`;

  return class extends target {
    constructor(...args) {
      const metaInject = target[metadata] || [];
      for (let i = 0; i < metaInject.length; i++) {
        const Clazz = metaInject[i];
        if (Clazz) {
          args.splice(i, 0, Reflect.construct(Clazz, []));
        }
      }
      super(...args);
    }
  };
}
