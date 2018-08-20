let util = {
  getVal(vm, exp) {
    exp = exp.split('.');
    return exp.reduce((p, n) => {
      return p[n];
    }, vm.$data);
  },
  setVal(vm, exp, value) {
    exp = exp.split('.');
    return exp.reduce((p, n, currentIndex) => {
      if (currentIndex === exp.length - 1) {
        return p[n] = value;
      }
      return p[n];
    }, vm.$data);
  },
  getTextVal(vm, exp) {
    return exp.replace(/\{\{([^}]+)\}\}/g, (...args) => {
      return this.getVal(vm, args[1]);
    });
  },
  text(node, vm, exp) {
    let updateFn = this.updater['textUpdater'];
    let value = this.getTextVal(vm, exp);
    // observe wait update
    // new Watcher(vm, exp, (newValue) => {
    //   updateFn && updateFn(node, this.getVal(vm, exp));
    // });
    exp.replace(/\{\{([^}]+)\}\}/g, (...args) => {
      new Watcher(vm, args[1], (newValue) => {
        updateFn && updateFn(node, this.getTextVal(vm, exp));
      })
    });
    updateFn && updateFn(node, value);
  },
  model(node, vm, exp) {
    let updateFn = this.updater['modelUpdater'];
    // observe wait update
    new Watcher(vm, exp, (newValue) => {
      updateFn && updateFn(node, this.getVal(vm, exp));
    });
    node.addEventListener('input', e => {
      let newValue = e.target.value;
      this.setVal(vm, exp, newValue);
    })
    updateFn && updateFn(node, this.getVal(vm, exp));
  },
  updater: {
    textUpdater(node, value) {
      node.textContent = value;
    },
    modelUpdater(node, value) {
      node.value = value;
    }
  }
}


class Compile {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;

    if (this.el) {
      // fragment
      let fragment = this.node2fragment(this.el);
      this.compile(fragment);
      this.el.appendChild(fragment);
    }
  }

  isElementNode(node) {
    return node.nodeType === 1;
  }

  isDirective(name) {
    return name.includes('v-');
  }

  compile(fragment) {
    let childNodes = fragment.childNodes;
    [...childNodes].forEach(node => {
      if (this.isElementNode(node)) {

        this.compileElement(node);
        this.compile(node);
      } else {
        this.compileText(node);
      }
    })
  }

  compileElement(node) {
    let attrs = node.attributes;
    [...attrs].forEach(attr => {
      let attrName = attr.name;
      if (this.isDirective(attrName)) {
        let exp = attr.value;
        let type = attrName.slice(2);
        util[type](node, this.vm, exp);
      }
    })
  }

  compileText(node) {
    let text = node.textContent;
    let reg = /\{\{([^}]+)\}\}/g
    if (reg.test(text)) {
      util['text'](node, this.vm, text);
    }
  }

  node2fragment(el) {
    let fragment = document.createDocumentFragment();
    let firstChild;
    while(firstChild = el.firstChild) {
      fragment.appendChild(firstChild);
    }
    return fragment;
  }
}

