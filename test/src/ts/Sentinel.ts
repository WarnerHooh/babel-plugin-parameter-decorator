export interface Counter {
  number: number
}

export default class Sentinel {
  public counter:Counter = { number: 0 };

  count() {
    this.counter.number++;
  }
}
