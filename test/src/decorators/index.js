export function validate(target, property, descriptor) {
  const fn = descriptor.value;

  descriptor.value = function (...args) {
    const req_metadata = `meta_req_${property}`;
    (target[req_metadata] || []).forEach(function (metadata) {
      if (args[metadata.index] === undefined) {
        throw new Error(`${metadata.key} is required`);
      }
    });

    const opt_metadata = `meta_opt_${property}`;
    (target[opt_metadata] || []).forEach(function (metadata) {
      if (args[metadata.index] === undefined) {
        console.warn(`The ${metadata.index + 1}(th) optional argument is missing of method ${fn.name}`);
      }
    });

    return fn.apply(this, args);
  };

  return descriptor;
}

export function required(key) {
  return function (target, propertyKey, parameterIndex) {
    const metadata = `meta_req_${propertyKey}`;
    target[metadata] = [
      ...(target[metadata] || []),
      {
        index: parameterIndex,
        key
      }
    ]
  };
}

export function optional(target, propertyKey, parameterIndex) {
  const metadata = `meta_opt_${propertyKey}`;
  target[metadata] = [
    ...(target[metadata] || []),
    {
      index: parameterIndex,
    }
  ]
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
        if (Clazz && args[i] === null) {
          args[i] = Reflect.construct(Clazz, []);
        }
      }
      super(...args);
    }
  };
}
