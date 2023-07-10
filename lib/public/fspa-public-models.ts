export class Value<T> {
  parentRef: any;
  constructor(public value: T = null) {}

  setParent(p: any) {
    this.parentRef = p;
  }

  toString() {
    return this.value;
  }

  setValue(nValue: T) {
    this.value = nValue;
    if (this.parentRef) {
      this.parentRef.render();
    }
  }
}

export function fromValue<T>(value: T) {
  return new Value<T>(value);
}
