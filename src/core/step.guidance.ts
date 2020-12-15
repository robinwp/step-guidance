import '../style/index.less';
import '../style/mian.less';
import handlerDragEvent from '../share/el.drag';
import Highlighter from './highlighter';
import { createdEL, debounce, generateStepKey, getStepKey, readXPath } from '../share/index';
import Drawer from '../form/drawer';
import editStep from '../form/edit-step';
import { Step } from '../interface/step';
import doublyLinkedList from '../share/doublylinkedlist/index';
import previewCom from './preview';
import StepManage from '../form/step-manage';
import { eventEmit } from '../share/eventemit/event-emitter';

enum StepGuidanceEnum {
  preview = 1,
  edit = 2,
  manage = 3,
}

class StepGuidance {
  private model: StepGuidanceEnum;
  private previewBtn: HTMLElement;
  private editBtn: HTMLElement;
  private manageBtn: HTMLElement;
  private highlighter: Highlighter;
  private moveing: boolean = false;
  private addBtn: HTMLElement;
  private currentEl: HTMLElement; // 当前选中的元素
  private disableSelectNode: boolean = false;
  private editDrawer: Drawer;
  private manageDrawer: Drawer;
  private form: editStep;
  private currentStepKey: string = null;
  private stepMap: doublyLinkedList<Step> = new doublyLinkedList<Step>();
  private previewCom: previewCom;
  private stepManageCom: StepManage;
  private readonly context: any; // 执行js时的可操作对象，比如可以吧网站的vue对象传入，在执行js时，就可以使用app.$router.push 进行页面跳转

  constructor(context?: any, router?: any) {
    this.context = context;

    this._initHighlighter();

    this._initEvent();

    this._initEditDrawer();

    this._initManageDrawer();

    this._created();

    this.loadData();

    this.previewCom = new previewCom(null, this.context, router, this.currentStepKey);
    if (this.currentStepKey) {
      this.preview();
    }
  }

  private _initHighlighter() {
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

  private _initEvent() {
    document.addEventListener('scroll', () => {
      if (this.disableSelectNode || this.model !== StepGuidanceEnum.edit) return;
      this.highlighter.unHighlight();
    }, true);
    window.addEventListener('resize', debounce(() => {
      if (this.model !== StepGuidanceEnum.edit) return;
      if (this.currentEl) this.highlighter.highlight(this.currentEl);
    }, 100)
      .bind(this));
    // if (!StepGuidance.isVue) {
    // @ts-ignore
    const observer = new MutationObserver(debounce(function() {
      eventEmit.emit('updated');
    }));
    observer.observe(window.document.body, {
      attributes: false, childList: true, subtree: true,
    });
    // }
  }

  private _initEditDrawer() {
    this.form = new editStep({
      xpath: '',
      content: '',
      url: location.pathname,
    }, (event: MouseEvent, step: Step) => {
      const key = getStepKey(step);
      if (this.stepMap.isExist(key)) {
        this.stepMap.updateItemByKey(key, step);
      } else {
        this.stepMap.addLastItem(key, step);
      }
      this.highlighter.unHighlight();
      this.editDrawer.close();
      this.disableSelectNode = false;
    }, () => {
      this.highlighter.unHighlight();
      this.editDrawer.close();
      this.disableSelectNode = false;
    });
    this.editDrawer = new Drawer(null, this.form.el);
  }

  private _initManageDrawer() {
    const close = () => {
      this.manageDrawer.close();
      this.manageBtn.classList.remove('active');
      this.highlighter.unHighlight();
      this.model = null;
    };
    this.stepManageCom = new StepManage(this.highlighter, (event: MouseEvent, stepMap: doublyLinkedList<Step>) => {
      this.stepMap = stepMap;
      close();
    }, () => {
      close();
    });
    this.manageDrawer = new Drawer(null, this.stepManageCom.el);
  }

  private _created() {
    const control = createdEL({
      class: 'step-guidance-control',
    });

    this.previewBtn = createdEL({
      class: 'step-guidance-btn step-guidance-left',
      props: {
        innerText: '预览',
      },
    });

    this.editBtn = createdEL({
      class: 'step-guidance-btn step-guidance-mid',
      props: {
        innerText: '编辑',
      },
    });

    this.manageBtn = createdEL({
      class: 'step-guidance-btn step-guidance-mid',
      props: {
        innerText: '步骤管理',
      },
    });

    const save = createdEL({
      class: 'step-guidance-btn step-guidance-right',
      props: {
        innerText: '保存',
      },
    });
    save.addEventListener('click', () => {
      if (!this.moveing) this.save();
    });

    this.previewBtn.addEventListener('click', () => {
      if (!this.moveing && this.model !== StepGuidanceEnum.preview) this.toggleModel(StepGuidanceEnum.preview);
    });
    this.editBtn.addEventListener('click', () => {
      if (!this.moveing && this.model !== StepGuidanceEnum.edit) this.toggleModel(StepGuidanceEnum.edit);
    });
    this.manageBtn.addEventListener('click', () => {
      if (!this.moveing && this.model !== StepGuidanceEnum.manage) this.toggleModel(StepGuidanceEnum.manage);
    });


    control.appendChild(this.previewBtn);
    control.appendChild(this.editBtn);
    control.appendChild(this.manageBtn);
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

  private _selectNode = debounce((event: MouseEvent) => {
    if (this.disableSelectNode) return;
    const currentEL = (event.target as HTMLElement);
    if (currentEL.dataset.spanName === 'highlight-add' || /step-guidance/.test(currentEL.className)) return;
    this.currentEl = currentEL;
    this.highlighter.highlight(this.currentEl);
  }, 100)
    .bind(this);

  public toggleModel(modal: StepGuidanceEnum) {
    this.model = modal;
    this.previewBtn.classList.remove('active');
    document.removeEventListener('mousemove', this._selectNode);
    this.editBtn.classList.remove('active');
    this.highlighter.unHighlight();
    this.editDrawer.close();
    this.manageDrawer.close();
    this.disableSelectNode = false;
    this.manageBtn.classList.remove('active');

    switch (this.model) {
      case StepGuidanceEnum.edit:
        this.editBtn.classList.add('active');
        document.addEventListener('mousemove', this._selectNode);
        this.previewCom.close();
        break;
      case StepGuidanceEnum.preview:
        this.previewBtn.classList.add('active');
        this.previewCom.show(this.stepMap);
        break;
      case StepGuidanceEnum.manage:
        this.manageBtn.classList.add('active');
        this.stepManageCom.update(this.stepMap);
        this.manageDrawer.show();
        this.previewCom.close();
        break;
      default:
    }
  }

  public addNode(el?: HTMLElement) {
    el = el || this.currentEl;
    if (el) {
      this.disableSelectNode = true;
      const xpath = readXPath(el);
      const url = location.pathname;
      const key = generateStepKey(url, xpath);
      const step = this.stepMap.getValueByKey(key);
      this.form.update(step || {
        xpath,
        content: '',
        url,
      });
      this.editDrawer.show();
    }
  }

  public save() {
    const len = this.stepMap.getSize();
    if (len > 0) {
      localStorage.setItem('step-guidance-map', this.stepMap.toJSON());
      alert(`保存了${ len }条步骤`);
    } else {
      alert('没有添加任何步骤');
    }
  }

  public loadData() {
    try {
      const data = JSON.parse(localStorage.getItem('step-guidance-map'));
      if (data) {
        this.stepMap.addLastItemByList(data.firstKey, data.queue);
      }
    } catch (e) {
      this.stepMap = new doublyLinkedList<Step>();
    }

    this.currentStepKey = localStorage.getItem('step-guidance-current-key') || null;
    localStorage.removeItem('step-guidance-current-key');
  }

  public preview() {
    this.toggleModel(StepGuidanceEnum.preview);
  }
}

export default StepGuidance;
