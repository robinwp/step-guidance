import { createdEL, debounce } from '../share/index';
import { Step } from '../interface/step';
import doublyLinkedList from '../share/doublylinkedlist/index';
import '../style/preview.less';

export default class preview {
  visible: boolean = false;
  el: HTMLElement;
  previewEL: HTMLElement;
  stepMap: doublyLinkedList<Step>;
  iterator: { next: Function, prev: Function };
  currentStep: { step: Step, done: boolean, isFirst: boolean };

  constructor(el?: HTMLElement) {
    this.el = el || document.body;
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
    this.iterator = this.stepMap.createIterator();
    const { value, done } = this.iterator.next();
    if (value) {
      console.log(done);
      this._createTooltip(value, done, true);
    }
  }

  _createEvent() {
    document.addEventListener('scroll', () => {
      if (this.currentStep) {
        this.previewEL.innerHTML = '';
        this._createTooltip(this.currentStep.step, this.currentStep.done, this.currentStep.isFirst, true);
      }
    }, true);

    window.addEventListener('resize', debounce(() => {
      if (this.currentStep) {
        this.previewEL.innerHTML = '';
        console.log(1);
        this._createTooltip(this.currentStep.step, this.currentStep.done, this.currentStep.isFirst, true);
      }
    }, 100)
      .bind(this));
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
        this.previewEL.innerHTML = '';
        const item = this.iterator.prev();
        console.log(item);
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
      this.previewEL.innerHTML = '';
      if (done) {
        this.close();
      } else {
        const item = this.iterator.next();
        this._createTooltip(item.value, item.done);
      }
    });
    footer.appendChild(next);
    return footer;
  }

  evalJS(javaScript: string) {
    return eval(javaScript);
  }

  async _createTooltip(step: Step, done: boolean, isFirst?: boolean, noscript?: boolean) {
    this.currentStep = { step, done, isFirst };
    if (step.javaScript && !noscript) {
      try {
        await this.evalJS(step.javaScript);
      } catch (e) {
        console.log(e);
        return;
      }
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
    // todo 计算出合适的释放位置
    arrow.style.top = `${ step.anchors.y }%`;
    arrow.style.left = `calc(${ step.anchors.x }% - 10px)`;
    warp.appendChild(arrow);

    warp.appendChild(this._createFooter(done, isFirst));
    const node = (document.evaluate(step.xpath, document, null, XPathResult.ANY_TYPE, null)
      .iterateNext() as HTMLElement);
    if (node) {
      const rect = node.getBoundingClientRect();
      const rectEl = createdEL({
        class: 'step-tooltip__rect',
      });
      rectEl.style.position = 'absolute';
      rectEl.style.top = rect.top - 4 + 'px';
      rectEl.style.left = rect.left - 4 + 'px';
      rectEl.style.width = rect.width + 8 + 'px';
      rectEl.style.height = rect.height + 8 + 'px';
      warp.style.left = rect.width / 2 - step.layout.width / 2 + 'px';
      warp.style.top = -(step.layout.height + 20) + 'px';
      rectEl.appendChild(warp);
      this.previewEL.appendChild(rectEl);
    }
  }
}
