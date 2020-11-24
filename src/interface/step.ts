export interface Anchors {
  x: number, // 0 - 100 之间
  y: number, // 0 - 100 之间
}

export interface Step {
  url: string, // 绑定路径
  xpath: string,
  content: string, // 内容
  layout?: { // 相对位置。相对于目标元素的
    width: number,
    height: number,
  },
  anchors?: Anchors, // 提示框 箭头的位置。x 为水平位置的比例，y为垂直位置的比例
  isHtml?: boolean, // 是否渲染html
  javaScript?: string, // 在渲染前执行脚本
}
