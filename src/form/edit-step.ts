import '../style/edit-step.less';
import { createdEL, getDefaultStep } from '../share/index';
import { Step } from '../interface/step';


export default class EditStep {
  el: HTMLElement;
  step: Step;
  xpath: HTMLInputElement;
  content: HTMLTextAreaElement;
  completeCb: Function;
  cancelCb: Function;
  javaScript: HTMLTextAreaElement;
  switch: HTMLElement;

  constructor(step: Step, completeCb?: Function, cancelCb?: Function) {
    this.step = Object.assign({}, getDefaultStep(), step);
    this.cancelCb = cancelCb;
    this.completeCb = completeCb;
    this._create();
  }

  update(step: Step) {
    this.step = Object.assign({}, getDefaultStep(), step);
    this.xpath.value = this.step.xpath || '';
    this.content.value = this.step.content || '';
    this.javaScript.value = this.step.javaScript || '';
    if (this.step.isHtml) {
      this.switch.className = 'step-switch active';
    } else {
      this.switch.className = 'step-switch';
    }
  }

  _create() {

    const warp = createdEL({
      class: 'step-edit__warp',
    });


    const body = createdEL({
      class: 'step-edit__body',
    });
    warp.appendChild(body);

    body.appendChild(createdEL({
      class: 'step-edit__label',
      props: {
        innerText: 'xpath',
      },
    }, 'p'));

    this.xpath = (createdEL({
      class: 'step-edit__input',
      readonly: true,
      props: {
        value: this.step.xpath,
      },
    }, 'input') as HTMLInputElement);

    body.appendChild(this.xpath);

    const switchwarp = createdEL({
      class: 'step-edit__label',
    }, 'p');

    switchwarp.appendChild(createdEL({
      class: 'step-edit__label-text',
      props: {
        innerText: '是否渲染成HTML',
      },
    }, 'span'));
    const className = this.step.isHtml ? 'step-switch active' : 'step-switch';
    this.switch = createdEL({
      class: className,
    }, 'span');

    this.switch.addEventListener('click', () => {
      this.step.isHtml = !this.step.isHtml;
      if (this.step.isHtml) {
        this.switch.className = 'step-switch active';
      } else {
        this.switch.className = 'step-switch';
      }
    });
    switchwarp.appendChild(this.switch);

    body.appendChild(switchwarp);

    body.appendChild(createdEL({
      class: 'step-edit__label',
      props: {
        innerText: '显示内容',
      },
    }, 'p'));
    this.content = (createdEL({
      class: 'step-edit__textarea',
      placeholder: '请输入显示内容',
    }, 'textarea') as HTMLTextAreaElement);
    this.content.addEventListener('input', () => {
      this.step.content = this.content.value;
    });
    body.appendChild(this.content);
    // todo 位置信息
    body.appendChild(createdEL({
      class: 'step-edit__label',
      props: {
        innerText: '渲染前执行脚本',
      },
    }, 'p'));
    this.javaScript = (createdEL({
      class: 'step-edit__textarea',
      placeholder: '请输入javascript执行脚本',
    }, 'textarea') as HTMLTextAreaElement);
    this.javaScript.addEventListener('input', () => {
      this.step.javaScript = this.javaScript.value;
    });
    body.appendChild(this.javaScript);

    const footer = createdEL({
      class: 'step-edit__footer',
    });

    const completeBtn = createdEL({
      props: {
        innerText: '确定',
      },
      class: 'step-btn step-btn__main',
    }, 'button');
    completeBtn.addEventListener('click', (e: MouseEvent) => {
      if (this.completeCb) this.completeCb(e, this.step);
    });
    const cancelBtn = createdEL({
      props: {
        innerText: '取消',
      },
      class: 'step-btn',
    }, 'button');
    cancelBtn.addEventListener('click', (e: MouseEvent) => {
      if (this.cancelCb) this.cancelCb(e);
    });
    footer.appendChild(completeBtn);
    footer.appendChild(cancelBtn);
    warp.appendChild(footer);

    this.el = warp;
  }

}
