import { Step } from '../interface/step';

/**
 * 防抖
 * @param {Function} fn
 * @param { number } time
 * @return {function(...[*]=)}
 */
export function debounce(fn: Function, time?: number): Function {
  let timer = null;
  return function(...args) {
    const context = this;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function() {
      fn.apply(context, args);
    }, time || 200);
  };
}

/**
 * 获取元素的xpath
 * @param {HTMLElement} element
 * @return { string }
 */
export function readXPath(element: HTMLElement): string {
  if (element.id !== '') {//判断id属性，如果这个元素有id，则显 示//*[@id="xPath"]  形式内容
    return '//*[@id=\"' + element.id + '\"]';
  }
  //这里需要需要主要字符串转译问题，可参考js 动态生成html时字符串和变量转译（注意引号的作用）
  if (element == document.body) {//递归到body处，结束递归
    return '/html/' + element.tagName.toLowerCase();
  }
  let ix = 1,//在nodelist中的位置，且每次点击初始化
    siblings = element.parentNode.childNodes;//同级的子元素

  for (let i = 0, l = siblings.length; i < l; i++) {
    let sibling = siblings[i];
    //如果这个元素是siblings数组中的元素，则执行递归操作
    if (sibling === element) {
      // @ts-ignore
      return readXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix) + ']';
      // @ts-ignore
    } else if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
      //如果不符合，判断是否是element元素，并且是否是相同元素，如果是相同的就开始累加
      ix++;
    }
  }
}

/**
 * 设置元素的属性
 * @param {HTMLElement} el
 * @param {object} attrs
 * @return {void}
 */
export function setAttrs(el: HTMLElement, attrs: object): void {
  const keys = Object.keys(attrs);
  keys.forEach((key) => {
    if (key === 'props') {
      Object.keys(attrs[key])
        .forEach(prosKey => {
          el[prosKey] = attrs[key][prosKey];
        });
    } else {
      el.setAttribute(key, attrs[key]);
    }
  });
}

/**
 * 创建元素
 * @param {object} attrs
 * @param {string?} elName
 * @return {HTMLElement}
 */
export function createdEL(attrs: object, elName?: string): HTMLElement {
  const el = document.createElement(elName || 'div');
  setAttrs(el, attrs);
  return el;
}

/**
 * 获取step的默认配置
 * @return {Step}
 */
export function getDefaultStep(): Step {
  return {
    url: location.pathname,
    // anchors: {
    //   x: 50,
    //   y: 100,
    // },
    content: '',
    isHtml: false,
    xpath: '',
    layout: {
      width: 300,
      height: 100,
      offset: 20,
    },
  };
}

export const isNullOrUndefined = (obj: any) => obj === null || obj === undefined;

export const isObj = (obj: any) => typeof obj === 'object' && obj !== null;

export const isArray = (obj: any) => {
  if (Array.isArray) {
    return Array.isArray(obj);
  }
  return Object.prototype.toString.call(obj) === '[object Array]';
};

/**
 * 深度克隆
 *
 * 支持克隆循环引用
 * 不支持克隆 function、Data、RegExp等
 * @param {*} obj
 * @param {WeakMap<*, *>} map
 * @return {*}
 */
export const deepClone = function(obj: any, map: WeakMap<any, any> = new WeakMap()): any {
  if (!isObj(obj)) return obj;
  if (map.has(obj)) return map.get(obj);
  const o = isArray(obj) ? [] : {};
  map.set(obj, o);
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      o[key] = deepClone(obj[key], map);
    }
  }
  return o;
};
