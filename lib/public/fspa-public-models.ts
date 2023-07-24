export class Value<T> {
  fspaParentRef: any;
  constructor(public value: T = null) {}

  setParent(p: any) {
    this.fspaParentRef = p;
  }

  toString() {
    return this.value;
  }

  change(nValue: T) {
    this.value = nValue;
    if (this.fspaParentRef) {
      this.fspaParentRef.render();
    }
  }
}

export function value<T>(value: T) {
  return new Value<T>(value);
}
interface Constructor<T> {
  new (): T;
}

export function service<T>(classType: Constructor<T>): T {
  let instance =
    window["FSPACore"].services[
      classType.prototype.constructor.$fspaServiceToken
    ];
  if (!instance) {
    window["FSPACore"].services[
      classType.prototype.constructor.$fspaServiceToken
    ] = instance = new classType();
  }

  return instance;
}
