import Greeter from "./Greeter";

export class GreeterFactory {
  static build(greeting): Greeter {
    return new Greeter(greeting, null);
  }
}
