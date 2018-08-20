class Watcher {
  constructor(vm, exp, cb) {
    this.vm = vm;
    this.exp = exp;
    this.cb = cb;
    this.value = this.get();
  }

  getVal(vm, exp) {
    exp = exp.split('.');
    return exp.reduce((p, n) => {
      return p[n];
    }, vm.$data);
  }

  get() {
    Dep.target = this;
    let value = this.getVal(this.vm, this.exp);
    Dep.target = null;
    return value;
  }

  update() {
    let newValue = this.getVal(this.vm, this.exp);
    let oldValue = this.value;
    if (newValue != oldValue) {
      this.cb(newValue, oldValue);
    }
  }
}