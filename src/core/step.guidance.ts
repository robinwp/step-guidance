import '../style/index.less';
import '../style/mian.less';
import handlerDragEvent from '../share/el.drag';
import Highlighter from './highlighter';
import { createdEL, debounce, readXPath } from '../share/index';
import drawer from '../form/drawer';
import editStep from '../form/edit-step';
import { CurrentStep, Step } from '../interface/step';
import doublyLinkedList from '../share/doublylinkedlist/index';
import previewCom from './preview';
import DoublyLinkedList from '../share/doublylinkedlist/index';

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
  currentStep: CurrentStep = null;
  stepMap: doublyLinkedList<Step> = new doublyLinkedList<Step>();
  previewCom: previewCom;
  app: any; // 执行js时的可操作对象，比如可以吧网站的vue对象传入，在执行js时，就可以使用app.$router.push 进行页面跳转
  static isVue: boolean = false;

  constructor(app) {
    // this.model = StepGuidanceEnum.preview;
    this.app = app;

    this._initHighlighter();

    this._initEvent();

    this._initDrawer();

    this._created();

    this.loadData();

    this.previewCom = new previewCom(null, this.app, this.currentStep);
    this.previewCom.isVue = StepGuidance.isVue;
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

  _created() {
    const control = createdEL({
      class: 'step-guidance-control',
    });

    this.preview = createdEL({
      class: 'step-guidance-btn step-guidance-left',
      props: {
        innerText: '预览',
      },
    });

    this.edit = createdEL({
      class: 'step-guidance-btn step-guidance-mid',
      props: {
        innerText: '编辑',
      },
    });

    const save = createdEL({
      class: 'step-guidance-btn step-guidance-right',
      props: {
        innerText: '保存',
      },
    });


    if (this.model === StepGuidanceEnum.preview) {
      this.preview.classList.add('active');
    } else if (this.model === StepGuidanceEnum.edit) {
      this.edit.classList.add('active');
    }

    this.preview.addEventListener('click', () => {
      if (!this.moveing && this.model !== StepGuidanceEnum.preview) this.toggleModel(StepGuidanceEnum.preview);
    });
    this.edit.addEventListener('click', () => {
      if (!this.moveing && this.model !== StepGuidanceEnum.edit) this.toggleModel(StepGuidanceEnum.edit);
    });

    save.addEventListener('click', () => {
      if (!this.moveing) this.save();
    });
    control.appendChild(this.preview);
    control.appendChild(this.edit);
    control.appendChild(save);

    handlerDragEvent(control, () => {
      this.moveing = true;
    }, () => {
      setTimeout(() => {
        this.moveing = false;
      });
    });
    document.body.appendChild(control);
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

  save() {
    const len = this.stepMap.getSize();
    if (len > 0) {
      localStorage.setItem('step-guidance-map', JSON.stringify(this.stepMap));
      alert(`保存了${ len }条步骤`);
    } else {
      alert('没有添加任何步骤');
    }
  }

  loadData() {
    try {
      const data = (JSON.parse(localStorage.getItem('step-guidance-map')) as DoublyLinkedList<Step>);
      if (data) {
        this.stepMap.addLastItemByList(data.firstKey, data.queue);
      }
    } catch (e) {
      this.stepMap = new doublyLinkedList<Step>();
    }

    try {
      this.currentStep = (JSON.parse(localStorage.getItem('step-guidance-current')) as CurrentStep);
    } catch (e) {
      this.currentStep = null;
    }
  }

  start() {
    this.toggleModel(StepGuidanceEnum.preview);
  }
}

export default StepGuidance;
