import '../style/mian.less';
import handlerDragEvent from '../share/el.drag';
import Highlighter from './highlighter';
import { createdEL, debounce, readXPath } from '../share/index';
import drawer from '../form/drawer';

enum StepGuidanceEnum {
  preview = 1,
  edit = 2
}

class StepGuidance {
  model: StepGuidanceEnum;
  preview: HTMLElement;
  edit: HTMLElement;
  highlighter: Highlighter;
  moveing: boolean;
  addBtn: HTMLElement;
  currentEl: HTMLElement; // 当前选中的元素
  disableSelectNode: boolean;
  drawer: drawer;

  constructor() {
    this.model = StepGuidanceEnum.preview;
    this.moveing = false;
    this.disableSelectNode = false;
    this.addBtn = createdEL({
      style: 'cursor: pointer',
    }, 'span');
    this.addBtn.innerText = '加';
    this.addBtn.addEventListener('click', () => {
      this.addNode();
    });
    this.highlighter = new Highlighter([this.addBtn]);
    document.addEventListener('scroll', () => {
      if (this.disableSelectNode || this.model !== StepGuidanceEnum.edit) return;
      this.highlighter.unHighlight();
    }, true);
    this.drawer = new drawer();
  }

  addNode(el?: HTMLElement) {
    el = el || this.currentEl;
    if (el) {
      //
      this.disableSelectNode = true;
      const path = readXPath(el);
      this.drawer.show();
    }
  }

  _selectNode = debounce((event: MouseEvent) => {
    if (this.disableSelectNode) return;
    // @ts-ignore
    if (event.target.dataset.spanName === 'highlight-add' || /step-guidance/.test(event.target.className)) return;
    // @ts-ignore
    this.currentEl = event.target;
    this.highlighter.highlight(this.currentEl);
  }, 100)
    .bind(this);

  toggleModel(modal: StepGuidanceEnum) {
    if (this.model === modal) return;
    this.model = modal;
    switch (this.model) {
      case StepGuidanceEnum.edit:
        this.edit.classList.add('active');
        this.preview.classList.remove('active');
        document.addEventListener('mousemove', this._selectNode);
        break;
      case StepGuidanceEnum.preview:
        this.preview.classList.add('active');
        this.edit.classList.remove('active');
        this.highlighter.unHighlight();
        this.drawer.close();
        this.disableSelectNode = false;
        document.removeEventListener('mousemove', this._selectNode);
        break;
      default:
    }
  }

  created() {
    const control = document.createElement('div');
    control.className = 'step-guidance-control';

    this.preview = document.createElement('div');
    this.preview.className = 'step-guidance-preview';
    this.preview.innerText = '预览模式';

    this.edit = document.createElement('div');
    this.edit.className = 'step-guidance-edit';
    this.edit.innerText = '编辑模式';

    if (this.model === StepGuidanceEnum.preview) {
      this.preview.classList.add('active');
    } else if (this.model === StepGuidanceEnum.edit) {
      this.edit.classList.add('active');
    }

    this.preview.addEventListener('click', () => {
      if (!this.moveing) this.toggleModel(StepGuidanceEnum.preview);
    });
    this.edit.addEventListener('click', () => {
      if (!this.moveing) this.toggleModel(StepGuidanceEnum.edit);
    });
    control.appendChild(this.preview);
    control.appendChild(this.edit);

    handlerDragEvent(control, () => {
      this.moveing = true;
    }, () => {
      setTimeout(() => {
        this.moveing = false;
      });
    });
    document.body.appendChild(control);
  }

}

export default StepGuidance;
