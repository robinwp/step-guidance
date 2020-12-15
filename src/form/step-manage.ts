import { Step } from '../interface/step';
import doublyLinkedList from '../share/doublylinkedlist/index';
import { createdEL, getNodeByXpath, getStepKey } from '../share/index';
import '../style/step-manage.less';
import Highlighter from '../core/highlighter';

enum ActionEnum {
  priview = 'priview',
  moveup = 'moveup',
  movedown = 'movedown',
  remove = 'remove'
}

enum DrapModelEnum {
  exchange = 0, // 交换模式， 如：1 2 3 4 5， 4和2换 则结果 1 4 3 2 5
  insert = 1, // 插入模式， 如 1 2 3 4 5， 4 插到2前面，则结果为  1 4 2 3 5
}

export default class StepManage {
  private stepMap: doublyLinkedList<Step>;
  private readonly cancelCb: Function;
  private readonly completeCb: Function;
  private body: HTMLElement;
  public el: HTMLElement;
  private highlighter: Highlighter;
  private currentPreviewXpath: string;
  private drapModel: DrapModelEnum = DrapModelEnum.insert;


  constructor(highlighter: Highlighter, completeCb?: Function, cancelCb?: Function) {
    this.highlighter = highlighter;
    this.cancelCb = cancelCb;
    this.completeCb = completeCb;
    this._create();

    window.addEventListener('resize', () => {
      if (this.currentPreviewXpath) {
        const target = (getNodeByXpath(this.currentPreviewXpath) as HTMLElement);
        if (target) {
          target.scrollIntoView({ block: 'center', inline: 'center' });
          this.highlighter.highlight(target, true);
        }
      }
    });
  }

  public update(stepMap?: doublyLinkedList<Step>) {
    this.body.innerHTML = '';
    if (stepMap) this.stepMap = stepMap.clone();
    if (!this.stepMap) return;
    const iterator = this.stepMap.createIterator();
    const result = iterator.next();
    let step = result.value;
    let done = result.done;
    let index = 0;
    while (step) {
      const key = getStepKey(step);
      const item = createdEL({
        class: `${ this.currentPreviewXpath === step.xpath ? 'active' : '' } step-manage__item`,
        draggable: true,
        props: {
          innerHTML: `<div class="step-manage__item-info">
                        <div>xpath: ${ step.xpath }</div>
                        <div>url: ${ step.url }</div>
                      </div>
                      <div class="step-manage__item-btn-group">
                        <span data-action="${ ActionEnum.priview }" data-key="${ encodeURIComponent(key) }" class="step-btn__link">${ this.currentPreviewXpath === step.xpath ? '取消预览' : '预览' }</span>
                        <span data-action="${ ActionEnum.remove }" data-key="${ encodeURIComponent(key) }" class="step-btn__link">删除</span>
                      </div>`,
        },
      }, 'li');
      //  <span style="display: ${ index === 0 ? 'none' : 'unset' }" data-action="${ ActionEnum.moveup }" data-key="${ key }" class="step-btn__link">上移</span>
      //  <span style="display: ${ done ? 'none' : 'unset' }" data-action="${ ActionEnum.movedown }" data-key="${ key }" class="step-btn__link">下移</span>
      item.addEventListener('dragover', (event: DragEvent) => {
        event.preventDefault();
      });
      item.addEventListener('drop', (event: DragEvent) => {
        // 进行拖拽处理
        const sourcekey = event.dataTransfer.getData('Text');
        if (sourcekey !== key) {
          if (this.drapModel === DrapModelEnum.exchange) {
            // 位置互换
            this.stepMap.exchangeItemByKey(sourcekey, key);
          } else {
            //
            const stepItem = this.stepMap.getValueByKey(sourcekey);
            this.stepMap.removeItemByKey(sourcekey);
            this.stepMap.addItemBeforeKey(key, sourcekey, stepItem);
          }
          this.update();
        }
      });
      item.addEventListener('dragstart', (event: DragEvent) => {
        event.dataTransfer.setData('Text', key);
      });
      this.body.appendChild(item);
      index++;
      const next = iterator.next();
      step = next.value;
      done = next.done;
    }
  }

  private _handleClick(e: MouseEvent) {
    const el = (e.target as HTMLElement);
    let key = el.dataset['key'];
    const action = el.dataset['action'];
    if (action && key) {
      key = decodeURIComponent(key);
      switch (action) {
        case ActionEnum.priview:
          const xpath = this.stepMap.getValueByKey(key).xpath;
          if (this.currentPreviewXpath === xpath) {
            this.highlighter.unHighlight();
            this.currentPreviewXpath = null;
            break;
          }
          const target = (getNodeByXpath(xpath) as HTMLElement);
          if (target) {
            this.currentPreviewXpath = xpath;
            target.scrollIntoView({ block: 'center', inline: 'center' });
            this.highlighter.highlight(target, true);
          } else {
            alert('当前页面找不到这个元素');
            this.currentPreviewXpath = null;
          }
          break;
        case ActionEnum.remove:
          this.stepMap.removeItemByKey(key);
          break;
        case ActionEnum.movedown:
          this.stepMap.movedownByKey(key);
          break;
        case ActionEnum.moveup:
          this.stepMap.moveupByKey(key);
          break;
        default:
      }
      this.update();
    }
  }

  private _create() {
    const warp = createdEL({
      class: 'step-manage__warp',
    });

    const drapModel = createdEL({
      class: 'step-manage__drap-model',
      props: {
        innerHTML: '<label class="step-manage__laebl">拖拽模式：</label>',
      },
    });

    const radioInser = createdEL({
      class: 'step-radio active',
      props: {
        innerHTML: '<span class="step-radio__input"></span><span class="step-radio__label">插入模式</span>',
      },
    }, 'label');

    const radioExchange = createdEL({
      class: 'step-radio',
      props: {
        innerHTML: '<span class="step-radio__input"></span><span class="step-radio__label">交换模式</span>',
      },
    }, 'label');
    radioInser.addEventListener('click', () => {
      if (this.drapModel !== DrapModelEnum.insert) {
        this.drapModel = DrapModelEnum.insert;
        radioExchange.classList.remove('active');
        radioInser.classList.add('active');
      }
    });
    radioExchange.addEventListener('click', () => {
      if (this.drapModel !== DrapModelEnum.exchange) {
        this.drapModel = DrapModelEnum.exchange;
        radioInser.classList.remove('active');
        radioExchange.classList.add('active');
      }
    });

    drapModel.appendChild(radioInser);
    drapModel.appendChild(radioExchange);

    this.body = createdEL({
      class: 'step-manage__body',
    }, 'ul');

    this.body.addEventListener('click', (e: MouseEvent) => {
      this._handleClick(e);
    });

    const footer = createdEL({
      class: 'step-manage__footer',
    });

    const completeBtn = createdEL({
      props: {
        innerText: '确定',
      },
      class: 'step-btn step-btn__main',
    }, 'button');

    completeBtn.addEventListener('click', (e: MouseEvent) => {
      if (this.completeCb) {
        this.currentPreviewXpath = null;
        this.completeCb(e, this.stepMap);
      }
    });
    const cancelBtn = createdEL({
      props: {
        innerText: '取消',
      },
      class: 'step-btn',
    }, 'button');
    cancelBtn.addEventListener('click', (e: MouseEvent) => {
      if (this.cancelCb) {
        this.currentPreviewXpath = null;
        this.cancelCb(e);
      }
    });
    footer.appendChild(completeBtn);
    footer.appendChild(cancelBtn);
    warp.appendChild(drapModel);
    warp.appendChild(this.body);
    warp.appendChild(footer);
    this.el = warp;
  }

}
