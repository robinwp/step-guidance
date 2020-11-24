/**
 * 节点
 */
export default class LinkedNode<T> {
  key: string;
  value: T;
  nextKey: string;
  beforeKey: string;

  constructor(key: string, value: T, nextKey?: string, beforeKey?: string) {
    this.key = key;
    this.value = value;
    this.nextKey = nextKey || null;
    this.beforeKey = beforeKey || null;
  }

  /**
   * 是否有下一个元素
   * @returns {boolean}
   */
  hasNext(): boolean {
    return !!this.nextKey;
  }

  /**
   * 是否有上一个元素
   * @returns {boolean}
   */
  hasBefore(): boolean {
    return !!this.beforeKey;
  }

  // get set 方法

  getNextKey(): string {
    return this.nextKey;
  }

  getBeforeKey(): string {
    return this.beforeKey;
  }

  getValue(): T {
    return this.value;
  }

  getKey(): string {
    return this.key;
  }

  setNextKey(key: string) {
    this.nextKey = key;
  }

  setBeforeKey(key: string) {
    this.beforeKey = key;
  }

  setValue(value: T) {
    this.value = value;
  }

  setKey(key: string) {
    this.key = key;
  }
}
