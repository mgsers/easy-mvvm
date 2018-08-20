// 1，模板编译 2，数据劫持 3，观察数据变化

class MVVM {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;

    if (this.$el) {
      new Observer(this.$data);

      this.proxyData(this.$data);
      
      new Compile(this.$el, this);
    }
  }

  proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          return data[key];
        },
        set(newValue) {
          data[key] = newValue;
        }
      })
    })
  }
}