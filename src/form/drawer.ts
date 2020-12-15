import { createdEL } from '../share/index';
import '../style/drawer.less';

export default class Drawer {
  private visible: boolean;
  private drawer: HTMLElement;
  private el: HTMLElement;
  private bodyOverflow: string;

  constructor(el?: HTMLElement, content?: HTMLElement) {
    this.visible = false;
    this.el = el || document.body;
    this._create(content);
  }

  private _create(content?: HTMLElement) {
    // const drawer = document.createElement('div');
    this.drawer = createdEL({
      class: 'step-drawer',
      style: 'display: none',
    });
    // drawer.className = 'step-drawer';
    // drawer.style.display = 'none';
    // this.drawer = drawer;

    const warper = createdEL({
      class: 'step-drawer__warper',
    });
    // warper.className = 'step-drawer__warper';

    const body = createdEL({
      class: 'step-drawer__body',
    });
    // body.className = 'step-drawer__body';

    if (content) body.appendChild(content);
    warper.appendChild(body);
    this.drawer.appendChild(warper);
    this.el.appendChild(this.drawer);
  }

  public show() {
    this.visible = true;
    this.bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.drawer.style.display = 'block';
  }

  public close() {
    document.body.style.overflow = this.bodyOverflow;
    this.visible = false;
    this.drawer.style.display = 'none';
  }

  public destroy() {
    this.el.removeChild(this.drawer);
    this.el = null;
    this.drawer = null;
  }
}
