import { isNullOrUndefined } from '../index';

export default class EventEmitter {

  events: object;

  constructor() {
    this.events = Object.create(null);
  }

  once(type: string, fn: Function): EventEmitter {
    return this.addEventListener(type, fn, true);
  }

  on(type: string, fn: Function): EventEmitter {
    return this.addEventListener(type, fn, false);
  }

  addEventListener(type: string, fn: Function, once: boolean): EventEmitter {
    if (isNullOrUndefined(this.events[type])) {
      this.events[type] = [{
        fn,
        once: !!once,
      }];
      return this;
    }
    this.events[type].push({
      fn,
      once: !!once,
    });
    return this;
  }

  emit(type: string, ...data: any): boolean {
    const events = this.events[type];
    if (isNullOrUndefined(events)) {
      return false;
    }
    for (let item of events) {
      try {
        item.fn.apply(null, data);
        if (item.once) {
          this.off(type, item.fn);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return true;
  }

  off(type: string, fn: Function): EventEmitter {
    return this.removeEventListener(type, fn);
  }

  removeEventListener(type: string, fn: Function): EventEmitter {
    if (isNullOrUndefined(this.events[type])) {
      return this;
    }
    for (let i = 0, size = this.events[type].length; i < size; i++) {
      if (this.events[type][i].fn === fn) {
        this.events[type].splice(i, 1);
        break;
      }
    }
    if (this.events[type].length === 0) {
      delete this.events[type];
    }
    return this;
  }

  removeAllEventListener(type: string): EventEmitter {
    if (isNullOrUndefined(type)) {
      this.events = Object.create(null);
    } else if (!isNullOrUndefined(this.events[type])) {
      delete this.events[type];
    }
    return this;
  }
}

export const eventEmit = new EventEmitter();
