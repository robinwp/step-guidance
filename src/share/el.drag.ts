/**
 * 处理拖拽指令
 * @param {HTMLElement} el 绑定拖拽指令的元素
 * @param {Function} moveingCallback 拖拽中的回调
 * @param {Function} moveEndCallback 拖拽结束后的回调
 * @param {boolean} parent 是否是父元素实现拖拽
 * @param {boolean} containment 限制拖拽区域为父元素。否则验证区域是window
 */
const handlerDragEvent = (el: HTMLElement, moveingCallback?: Function, moveEndCallback?: Function, parent?: boolean, containment?: boolean) => {
  const mousedown = (e) => {
    e.preventDefault();
    const disx = e.pageX - (parent ? el.parentElement.offsetLeft : el.offsetLeft);
    const disy = e.pageY - (parent ? el.parentElement.offsetTop : el.offsetTop);
    const maxTop = containment ? (el.parentElement.offsetHeight - el.offsetHeight) : (window.innerHeight - el.offsetHeight);
    const maxLeft = containment ? (el.parentElement.offsetWidth - el.offsetWidth) : (window.innerWidth - el.offsetWidth);
    const mousemove = (event) => {
      // 设置触发的是移动指令，控制不触发发点击事件
      event.preventDefault();
      let left = event.pageX - disx;
      if (left < 0) left = 0;
      if (left > maxLeft) left = maxLeft > 0 ? maxLeft : 0;
      let top = event.pageY - disy;
      if (top < 0) top = 0;
      if (top > maxTop) top = maxTop > 0 ? maxTop : 0;
      if (parent) {
        el.parentElement.style.left = `${ left }px`;
        el.parentElement.style.top = `${ top }px`;
      } else {
        el.style.left = `${ left }px`;
        el.style.top = `${ top }px`;
      }
      if (moveingCallback) moveingCallback(left, top);
    };
    document.addEventListener('mousemove', mousemove);
    const mouseup = (event) => {
      event.preventDefault();
      if (moveEndCallback) moveEndCallback();
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);
    };
    document.addEventListener('mouseup', mouseup);
  };
  el.addEventListener('mousedown', mousedown);
};

export default handlerDragEvent;
