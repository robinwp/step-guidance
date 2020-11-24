import { createdEL } from '../share/index';

export default class EditStep {
  el: HTMLElement;

  constructor(el: HTMLElement) {
    this.el = el;
  }

  _create() {

    createdEL({});

  }

}
