import { createdEL, debounce, getNodeByXpath, getStepKey } from '../share/index';
import { CurrentStep, DirectionEnum, Step, StepIterator } from '../interface/step';
import doublyLinkedList from '../share/doublylinkedlist/index';
import '../style/preview.less';
import EventEmitter, { eventEmit } from '../share/eventemit/event-emitter';

function checkPosition(step: Step, rect: DOMRect): DirectionEnum {
  if (rect.y + rect.height <= 0 || rect.x + rect.width <= 0) {
    return DirectionEnum.hidden;
  }
  const widthNoOverflow = rect.width >= step.layout.width || rect.x - (step.layout.width - rect.width) / 2 > 0;
  const heightNoOverflow = rect.height >= step.layout.height || rect.y - (step.layout.height - rect.height) / 2 > 0;
  if (rect.y - step.layout.height - step.layout.offset > 0 && widthNoOverflow) {
    return DirectionEnum.top;
  } else if (rect.y + rect.height + step.layout.height + step.layout.offset < window.innerHeight && widthNoOverflow) {
    return DirectionEnum.bottom;
  } else if (rect.x - step.layout.width - step.layout.offset > 0 && heightNoOverflow) {
    return DirectionEnum.left;
  } else if (rect.x + rect.width + step.layout.width + step.layout.offset < window.innerWidth && heightNoOverflow) {
    return DirectionEnum.right;
  }
  return DirectionEnum.inner;
}

function calcPosition(rectEl: HTMLElement, warp: HTMLElement, arrow: HTMLElement, rect: DOMRect, step: Step) {
  // 高亮出选中的元素
  rectEl.style.position = 'absolute';
  rectEl.style.top = rect.top - 4 + 'px';
  rectEl.style.left = rect.left - 4 + 'px';
  rectEl.style.width = rect.width + 8 + 'px';
  rectEl.style.height = rect.height + 8 + 'px';

  // 步骤提示的位置
  // 优先级 上 > 下 > 左 > 右 > 元素内部
  const position = checkPosition(step, rect);
  switch (position) {
    case DirectionEnum.bottom:
      warp.style.left = rect.width / 2 - step.layout.width / 2 + 'px';
      warp.style.top = rect.height + step.layout.offset + 8 + 'px';
      // 箭头
      arrow.style.transform = 'rotate(180deg)';
      arrow.style.top = '-10px';
      arrow.style.left = 'calc(50% - 10px)';
      break;
    case DirectionEnum.top:
      warp.style.left = rect.width / 2 - step.layout.width / 2 + 'px';
      warp.style.top = -(step.layout.height + step.layout.offset) + 'px';
      // 箭头
      arrow.style.top = '100%';
      arrow.style.transform = 'rotate(0deg)';
      arrow.style.left = 'calc(50% - 10px)';
      break;
    case DirectionEnum.left:
      warp.style.left = -(step.layout.width + step.layout.offset) + 'px';
      warp.style.top = rect.height / 2 - step.layout.height / 2 + 'px';
      // 箭头
      arrow.style.right = '-14px';
      arrow.style.transform = 'rotate(270deg)';
      arrow.style.top = 'calc(50% - 3px)';
      break;
    case DirectionEnum.right:
      warp.style.left = rect.width + step.layout.offset + 8 + 'px';
      warp.style.top = rect.height / 2 - step.layout.height / 2 + 'px';
      // 箭头
      arrow.style.left = '-14px';
      arrow.style.transform = 'rotate(90deg)';
      arrow.style.top = 'calc(50% - 3px)';
      break;
    case DirectionEnum.inner:
      warp.style.left = rect.width / 2 - step.layout.width / 2 + 'px';
      warp.style.top = step.layout.offset + 8 + 'px';
      // warp.style.boxShadow = '0 2px 12px 0 rgba(0, 0, 0, 0.1)';
      // 箭头
      arrow.style.transform = 'rotate(180deg)';
      arrow.style.top = '-10px';
      arrow.style.left = 'calc(50% - 10px)';
      break;
    case DirectionEnum.hidden:
    default:
      warp.style.display = 'none';
      rectEl.style.width = '0px';
      rectEl.style.height = '0px';
  }
}

export default class preview {
  visible: boolean = false;
  el: HTMLElement;
  previewEL: HTMLElement;
  stepMap: doublyLinkedList<Step>;
  iterator: StepIterator<Step>;
  currentStep: CurrentStep;
  currentStepKey: string;
  context: any;
  event: EventEmitter = eventEmit;
  _timer: number = null;
  router: any;

  constructor(el?: HTMLElement, context?: any, router?: any, currentStepKey?: string) {
    this.el = el || document.body;
    this.context = context;
    this.currentStepKey = currentStepKey;
    this.router = router;
    this._createEvent();
    this._create();
  }

  public close() {
    this.currentStep = null;
    this.currentStepKey = null;
    this.previewEL.innerHTML = '';
    this.previewEL.style.display = 'none';
    this.iterator = null;
    this.visible = false;
  }

  public show(stepMap: doublyLinkedList<Step>) {
    this.visible = true;
    this.stepMap = stepMap;
    this.previewEL.style.display = 'block';
    if (this.currentStepKey) {
      this.iterator = this.stepMap.createIterator(this.currentStepKey);
    } else {
      this.iterator = this.stepMap.createIterator();
    }
    const { value, done } = this.iterator.next();
    if (value) {
      this._createTooltip(value, done, this.stepMap.isFirst(getStepKey(value)));
    } else {
      this.close();
      alert('没有添加任何步骤哦');
    }
  }

  private _createEvent() {
    document.addEventListener('scroll', () => {
      if (this.currentStep) {
        this._createTooltip(this.currentStep.step, this.currentStep.done, this.currentStep.isFirst, true);
      }
    }, true);

    window.addEventListener('resize', debounce(() => {
      if (this.currentStep) {
        this._createTooltip(this.currentStep.step, this.currentStep.done, this.currentStep.isFirst, true);
      }
    }, 100)
      .bind(this));

    this.event.on('updated', () => {
      if (this.currentStep && this._timer) {
        this._createTooltip(this.currentStep.step, this.currentStep.done, this.currentStep.isFirst, true);
      }
    });
  }

  private _create() {
    this.previewEL = createdEL({
      class: 'step-preview',
      style: `display: none`,
    });
    this.el.appendChild(this.previewEL);
  }

  private _createFooter(done: boolean, isFirst?: boolean) {
    const footer = createdEL({
      class: 'step-tooltip__footer',
    });
    const btnGroup = createdEL();
    if (!isFirst) {
      const prev = createdEL({
        class: 'step-btn step-btn__main step-btn__small',
        props: {
          innerText: '上一步',
        },
      });
      prev.addEventListener('click', () => {
        const item = this.iterator.prev();
        this._createTooltip(item.value, false, item.done);
      });
      btnGroup.appendChild(prev);
    }
    const next = createdEL({
      class: 'step-btn step-btn__main step-btn__small',
      props: {
        innerText: done ? '完成' : '下一步',
      },
    });
    next.addEventListener('click', () => {
      this._next(done);
    });
    btnGroup.appendChild(next);

    const close = createdEL({
      class: 'step-btn__link',
      props: {
        innerText: '关闭',
      },
    });
    close.addEventListener('click', () => {
      this.close();
    });
    footer.appendChild(btnGroup);
    footer.appendChild(close);
    return footer;
  }

  private _next(done) {
    if (done) {
      this.close();
    } else {
      const item = this.iterator.next();
      this._createTooltip(item.value, item.done);
    }
  }

  private async _evalJS(xpath: string, javaScript: string) {
    const fn = new Function('xpath', 'context', javaScript);
    return await fn(xpath, this.context);
  }

  private async _changeRouter(step: Step): Promise<any> {
    if (step.url === location.pathname) return Promise.resolve();
    if (this.router && this.router.push) {
      return this.router.push(step.url);
    } else {
      window.localStorage.setItem('step-guidance-current-key', getStepKey(this.currentStep.step));
      this.close();
      setTimeout(() => {
        location.assign(step.url);
      });
      return Promise.reject(false);
    }
  }

  private async _createTooltip(step: Step, done: boolean, isFirst?: boolean, noscript?: boolean) {
    this._removeTimeoutError();
    this.currentStep = { step, done, isFirst };
    this.previewEL.style.background = 'rgba(0, 0, 0, 0.5)';
    this.previewEL.innerHTML = '';
    if (!noscript) {
      try {
        await this._changeRouter(step);
      } catch (e) {
        if (e !== false) {
          alert('路由跳转出错');
          console.error(e);
        }
        this.close();
        return;
      }
    }
    if (step.javaScript && !noscript) {
      try {
        await this._evalJS(step.xpath, step.javaScript);
      } catch (e) {
        alert('执行脚本出错');
        console.error(e);
        this.close();
        return;
      }
    }
    const node = (getNodeByXpath(step.xpath) as HTMLElement);
    if (!node) {
      // 没有找到节点进行等待
      this._createdTimeoutError(step.xpath);
      return;
    }
    if (getComputedStyle(node).display === 'none') {
      // 节点不显示进行等待
      this._createdTimeoutError(step.xpath);
      return;
    }
    const warp = createdEL({
      class: 'step-tooltip__warp',
      style: `width: ${ step.layout.width }px;height: ${ step.layout.height }px;`,
    });
    const content = createdEL({
      class: 'step-tooltip__body',
    });
    if (step.isHtml) {
      content.innerHTML = step.content;
    } else {
      content.innerText = step.content;
    }

    warp.appendChild(content);

    const arrow = createdEL({
      class: 'step-tooltip__arrow',
    });
    warp.appendChild(arrow);

    warp.appendChild(this._createFooter(done, isFirst));
    !noscript && node.scrollIntoView({ block: 'center', inline: 'center' });
    const rect = node.getBoundingClientRect();
    const rectEl = createdEL({
      class: 'step-tooltip__rect',
    });
    calcPosition(rectEl, warp, arrow, rect, step);
    rectEl.appendChild(warp);
    this.previewEL.style.background = 'unset';
    this.previewEL.appendChild(rectEl);
  }

  private _removeTimeoutError() {
    clearTimeout(this._timer);
    this._timer = null;
  }

  private _createdTimeoutError(xpath: string, time?: number) {
    this._timer = setTimeout(() => {
      alert(`xpath为${ xpath }的元素不存在或被隐藏，请检查`);
    }, time || 10000);
  }
}
