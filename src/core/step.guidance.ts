import '../style/index.less';
import '../style/mian.less';
import handlerDragEvent from '../share/el.drag';
import Highlighter from './highlighter';
import { createdEL, debounce, readXPath } from '../share/index';
import drawer from '../form/drawer';
import editStep from '../form/edit-step';
import { Step } from '../interface/step';
import doublyLinkedList from '../share/doublylinkedlist/index';
import previewCom from './preview';

enum StepGuidanceEnum {
  preview = 1,
  edit = 2
}

class StepGuidance {
  model: StepGuidanceEnum;
  preview: HTMLElement;
  edit: HTMLElement;
  highlighter: Highlighter;
  moveing: boolean = false;
  addBtn: HTMLElement;
  currentEl: HTMLElement; // 当前选中的元素
  disableSelectNode: boolean = false;
  drawer: drawer;
  form: editStep;
  stepMap: doublyLinkedList<Step> = new doublyLinkedList<Step>();
  previewCom: previewCom;

  constructor() {
    this.model = StepGuidanceEnum.preview;
    this.previewCom = new previewCom();

    this._initHighlighter();

    this._initEvent();

    this._initDrawer();

    this._created();
  }

  _initHighlighter() {
    this.addBtn = createdEL({
      style: 'cursor: pointer',
      props: {
        innerText: '加',
      },
    }, 'span');
    this.addBtn.addEventListener('click', () => {
      this.addNode();
    });
    this.highlighter = new Highlighter([this.addBtn]);
  }

  _initEvent() {
    document.addEventListener('scroll', () => {
      if (this.disableSelectNode || this.model !== StepGuidanceEnum.edit) return;
      this.highlighter.unHighlight();
    }, true);
    window.addEventListener('resize', debounce(() => {
      if (this.model !== StepGuidanceEnum.edit) return;
      if (this.currentEl) this.highlighter.highlight(this.currentEl);
    }, 100)
      .bind(this));
  }

  _initDrawer() {
    this.form = new editStep({
      xpath: '',
      content: '',
      url: location.pathname,
    }, (event: MouseEvent, step: Step) => {
      const key = `${ step.url }%stepMapKey%${ step.xpath }`;
      if (this.stepMap.isExist(key)) {
        this.stepMap.updateItemByKey(key, step);
      } else {
        this.stepMap.addLastItem(key, step);
      }
      console.log(this.stepMap);
      this.highlighter.unHighlight();
      this.drawer.close();
      this.disableSelectNode = false;
    }, () => {
      this.highlighter.unHighlight();
      this.drawer.close();
      this.disableSelectNode = false;
    });
    this.drawer = new drawer(null, this.form.el);
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
        this.previewCom.close();
        document.addEventListener('mousemove', this._selectNode);
        break;
      case StepGuidanceEnum.preview:
        this.preview.classList.add('active');
        this.edit.classList.remove('active');
        this.highlighter.unHighlight();
        this.drawer.close();
        this.disableSelectNode = false;
        document.removeEventListener('mousemove', this._selectNode);
        this.previewCom.show(this.stepMap);
        break;
      default:
    }
  }

  addNode(el?: HTMLElement) {
    el = el || this.currentEl;
    if (el) {
      this.disableSelectNode = true;
      const xpath = readXPath(el);
      const url = location.pathname;
      const key = `${ url }%stepMapKey%${ xpath }`;
      const step = this.stepMap.getValueByKey(key);
      this.form.update(step || {
        xpath,
        content: '',
        url,
      });
      this.drawer.show();
    }
  }

  _created() {
    const control = createdEL({
      class: 'step-guidance-control',
    });

    this.preview = createdEL({
      class: 'step-guidance-preview',
      props: {
        innerText: '预览模式',
      },
    });

    this.edit = createdEL({
      class: 'step-guidance-edit',
      props: {
        innerText: '编辑模式',
      },
    });

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
