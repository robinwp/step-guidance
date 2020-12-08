import { createdEL, debounce } from '../share/index';
import { CurrentStep, DirectionEnum, Step } from '../interface/step';
import doublyLinkedList from '../share/doublylinkedlist/index';
import '../style/preview.less';
import EventEmitter, { eventEmit } from '../share/eventemit/event-emitter';

export default class preview {
  visible: boolean = false;
  el: HTMLElement;
  previewEL: HTMLElement;
  stepMap: doublyLinkedList<Step>;
  iterator: { next: Function, prev: Function };
  currentStep: CurrentStep;
  app: any;
  isVue: boolean = true;
  event: EventEmitter = eventEmit;
  _timer: number = null;

  constructor(el?: HTMLElement, app?: any, currentStep?: CurrentStep) {
    this.el = el || document.body;
    this.app = app;
    this.currentStep = currentStep;
    this._createEvent();
    this._create();
  }

  close() {
    this.currentStep = null;
    this.previewEL.innerHTML = '';
    this.previewEL.style.display = 'none';
    this.visible = false;
  }

  show(stepMap: doublyLinkedList<Step>) {
    this.visible = true;
    this.stepMap = stepMap;
    this.previewEL.style.display = 'block';
    if (this.currentStep) {
      this._createTooltip(this.currentStep.step, this.currentStep.done, this.currentStep.isFirst);
      return;
    }
    this.iterator = this.stepMap.createIterator();
    const { value, done } = this.iterator.next();
    if (value) {
      this._createTooltip(value, done, true);
    } else {
      this.close();
      alert('没有添加任何步骤哦');
    }
  }

  _createEvent() {
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
      if (this.currentStep) {
        this._createTooltip(this.currentStep.step, this.currentStep.done, this.currentStep.isFirst, true);
      }
    });
  }

  _create() {
    this.previewEL = createdEL({
      class: 'step-preview',
      style: `display: none`,
    });
    this.el.appendChild(this.previewEL);
  }

  _createFooter(done: boolean, isFirst?: boolean) {
    const footer = createdEL({
      class: 'step-tooltip__footer',
    });
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
      footer.appendChild(prev);
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
    footer.appendChild(next);
    return footer;
  }

  _next(done) {
    if (done) {
      this.close();
    } else {
      const item = this.iterator.next();
      this._createTooltip(item.value, item.done);
    }
  }

  async _evalJS(xpath: string, javaScript: string) {
    const fn = new Function('xpath', 'app', javaScript);
    return await fn(xpath, this.app);
  }

  async _changeRouter(step: Step): Promise<any> {
    if (step.url === location.pathname) return Promise.resolve();
    if (this.app && this.isVue && this.app.$router && this.app.$router) {
      await this.app.$router.push(step.url);
    } else {
      window.location.href = step.url;
      return Promise.resolve();
    }
  }

  async _createTooltip(step: Step, done: boolean, isFirst?: boolean, noscript?: boolean) {
    this._removeTimeoutError();
    this.currentStep = { step, done, isFirst };
    this.previewEL.style.background = 'rgba(0, 0, 0, 0.5)';
    this.previewEL.innerHTML = '';
    if (!noscript) {
      try {
        await this._changeRouter(step);
        console.log('跳转完成');
      } catch (e) {
        alert('路由跳转出错');
        console.log(e);
        this.close();
        return;
      }
    }
    if (step.javaScript && !noscript) {
      try {
        await this._evalJS(step.xpath, step.javaScript);
      } catch (e) {
        alert('执行脚本出错');
        console.log(e);
        this.close();
        return;
      }
    }
    const node = (document.evaluate(step.xpath, document, null, XPathResult.ANY_TYPE, null)
      .iterateNext() as HTMLElement);
    if (!node) {
      this._createdTimeoutError(step.xpath);
      // 没有找到节点进行等待
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
    !noscript && node.scrollIntoView({ block: 'end', inline: 'center' });
    const rect = node.getBoundingClientRect();
    const rectEl = createdEL({
      class: 'step-tooltip__rect',
    });
    this._calcPosition(rectEl, warp, arrow, rect, step);
    rectEl.appendChild(warp);
    this.previewEL.style.background = 'unset';
    this.previewEL.appendChild(rectEl);
  }

  _calcPosition(rectEl: HTMLElement, warp: HTMLElement, arrow: HTMLElement, rect: DOMRect, step: Step) {
    // 高亮出选中的元素
    rectEl.style.position = 'absolute';
    rectEl.style.top = rect.top - 4 + 'px';
    rectEl.style.left = rect.left - 4 + 'px';
    rectEl.style.width = rect.width + 8 + 'px';
    rectEl.style.height = rect.height + 8 + 'px';

    // 步骤提示的位置
    // 优先级 上 > 下 > 左 > 右 > 元素内部
    const position = this._checkPosition(step, rect);
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
        arrow.style.right = '-12px';
        arrow.style.transform = 'rotate(270deg)';
        arrow.style.top = 'calc(50% - 3px)';
        break;
      case DirectionEnum.right:
        warp.style.left = rect.width + step.layout.offset + 8 + 'px';
        warp.style.top = rect.height / 2 - step.layout.height / 2 + 'px';
        // 箭头
        arrow.style.left = '-12px';
        arrow.style.transform = 'rotate(90deg)';
        arrow.style.top = 'calc(50% - 3px)';
        break;
      case DirectionEnum.inner:
        warp.style.left = rect.width / 2 - step.layout.width / 2 + 'px';
        warp.style.top = step.layout.offset + 8 + 'px';
        warp.style.boxShadow = '0 2px 12px 0 rgba(0, 0, 0, 0.1)';
        // 箭头
        arrow.style.display = 'none';
        // arrow.style.transform = 'rotate(180deg)';
        // arrow.style.top = '-10px';
        // arrow.style.left = 'calc(50% - 10px)';
        break;
      default:
        warp.style.display = 'none';
    }


  }

  _checkPosition(step: Step, rect: DOMRect): DirectionEnum {
    if (rect.y + rect.height < 0 || rect.x + rect.width < 0) {
      return DirectionEnum.hidden;
    }
    if (rect.y - step.layout.height - step.layout.offset > 0) {
      return DirectionEnum.top;
    } else if (rect.y + rect.height + step.layout.height + step.layout.offset < window.innerHeight) {
      return DirectionEnum.bottom;
    } else if (rect.x - step.layout.width - step.layout.offset > 0) {
      return DirectionEnum.left;
    } else if (rect.x + rect.width + step.layout.width + step.layout.offset < window.innerWidth) {
      return DirectionEnum.right;
    }
    return DirectionEnum.inner;
  }

  _removeTimeoutError() {
    clearTimeout(this._timer);
    this._timer = null;
  }

  _createdTimeoutError(xpath: string, time?: number) {
    this._timer = setTimeout(() => {
      alert(`xpath为${ xpath }的元素不存在，请检查`);
    }, time || 15000);
  }
}
