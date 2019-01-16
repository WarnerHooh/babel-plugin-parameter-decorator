import {Bar, Baz, Foo} from "./decorator";

export default class Demo{
  hello(@Foo('foo')@Bar('bar') param1, @Baz('baz') param2) {
  }
}

const demo = new Demo();
demo.hello(11, 22);
