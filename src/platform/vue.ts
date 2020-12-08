import { debounce } from '../share/index';
import { eventEmit } from '../share/eventemit/event-emitter';

class Install {
  static installed: boolean = false;
  static _Vue: any;

  static updated = debounce(function() {
    eventEmit.emit('updated');
  });

  static install(Vue) {
    if (Install.installed && Install._Vue === Vue) return;
    Install.installed = true;
    Install._Vue = Vue;

    Vue.mixin({
      updated() {
        this.$nextTick(function() {
          Install.updated(this);
        });
      },
    });
  }

}

export default Install;

