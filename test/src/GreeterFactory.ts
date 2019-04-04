import Greeter from "./Greeter";
import Sentinel from "./Sentinel";

export class GreeterFactory {
  static build(greeting): Greeter {
    const sentinel = new Sentinel();
    return new Greeter(greeting, sentinel);
  }
}
