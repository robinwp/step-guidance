import LinkedNode from './linked.node';
import { isNullOrUndefined } from '../index';

/**
 * 双向链表
 * created by robinwp
 * email: 284595745@qq.com
 * version : 1.0
 */

export default class DoublyLinkedList<T> {
  size: number;
  queue: object;
  firstKey: string;
  lastKey: string;

  constructor() {
    this.size = 0;
    this.queue = Object.create(null);
    this.firstKey = null;
    this.lastKey = null;
  }

  /**
   * 队列是否为空
   * @returns {boolean}
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * 判断当前key是否是最后一个
   * @param key 节点的key
   * @returns {boolean}
   */
  isLast(key: string): boolean {
    return this.lastKey === key;
  }

  /**
   * 判断当前key是否是第一个
   * @param key 节点的key
   * @returns {boolean}
   */
  isFirst(key: string): boolean {
    return this.firstKey === key;
  }

  /**
   * 判断key是否存在
   * @param key 节点的key
   * @return {boolean}
   */
  isExist(key: string): boolean {
    if (!key) return false;
    return !isNullOrUndefined(this.queue[key]);
  }

  /**
   * 添加节点都最后
   * @param key 要添加的节点的key
   * @param value 要添加节点的值
   * @return {boolean}
   */
  addLastItem(key: string, value: T): boolean {
    if (this.isExist(key)) {
      console.warn('当前节点存在，请使用updateItemByKey，更新节点');
      return false;
    } else {
      if (this.isEmpty()) {
        this.firstKey = key;
      }
      if (this.isExist(this.lastKey)) {
        this.queue[this.lastKey].setNextKey(key);
      }
      this.queue[key] = new LinkedNode(key, value, null, this.lastKey);
      this.lastKey = key;
      this.size++;
      return true;
    }
  }

  /**
   * 添加节点到最前面
   * @param key 要添加的节点的key
   * @param value 要添加节点的值
   * @return {boolean}
   */
  addFirstItem(key: string, value: T): boolean {
    if (this.isExist(key)) {
      console.warn('当前节点存在，请使用updateItemByKey，更新节点');
      return false;
    } else {
      if (this.isEmpty()) {
        this.lastKey = key;
      }
      if (this.isExist(this.firstKey)) {
        this.queue[this.firstKey].setBeforeKey(key);
      }
      this.queue[key] = new LinkedNode(key, value, this.firstKey, null);
      this.firstKey = key;
      this.size++;
      return true;
    }
  }

  /**
   * 添加节点到某一个key节点后面
   * @param key 要添加到此节点之后的key
   * @param itemKey 要添加的节点的key
   * @param itemValue 要添加节点的值
   * @return {boolean}
   */
  addItemAfterKey(key: string, itemKey: string, itemValue: T): boolean {
    if (!this.isExist(key)) {
      console.warn('当前节点不存在');
      return false;
    }
    if (this.isExist(itemKey)) {
      console.warn('当前节点存在，请使用updateItemByKey，更新节点');
      return false;
    } else {
      if (this.isLast(key)) {
        this.addLastItem(itemKey, itemValue);
      } else {
        const node = this.queue[key];
        const nextKey = node.getNextKey();
        this.queue[itemKey] = new LinkedNode(itemKey, itemValue, nextKey, key);
        const nextNode = this.queue[nextKey];
        nextNode.setBeforeKey(itemKey);
        node.setNextKey(itemKey);
        this.size++;
      }
      return true;
    }
  }

  /**
   * 添加节点到某一个key节点前面
   * @param key 要添加到此节点之前的key
   * @param itemKey 要添加的节点的key
   * @param itemValue 要添加节点的值
   * @return {boolean}
   */
  addItemBeforeKey(key: string, itemKey: string, itemValue: T): boolean {
    if (!this.isExist(key)) {
      console.warn('当前节点不存在');
      return false;
    }
    if (this.isExist(itemKey)) {
      console.warn('要添加的节点已存在，请使用updateItemByKey，更新节点');
      return false;
    } else {
      if (this.isFirst(key)) {
        this.addFirstItem(itemKey, itemValue);
      } else {
        const node = this.queue[key];
        const beforeKey = node.getBeforeKey();
        this.queue[itemKey] = new LinkedNode(itemKey, itemValue, key, beforeKey);
        const beforeNode = this.queue[beforeKey];
        node.setBeforeKey(itemKey);
        beforeNode.setNextKey(itemKey);
        this.size++;
      }
      return true;
    }
  }

  /**
   * 根据key删除
   * @param key 节点的key
   * @return {boolean}
   */
  removeItemByKey(key: string): boolean {
    if (this.isExist(key)) {
      const node = this.queue[key];
      const nextKey = node.getNextKey();
      const beforeKey = node.getBeforeKey();
      if (this.isFirst(key)) {
        const nextNode = this.queue[nextKey];
        nextNode.setBeforeKey(null);
        this.firstKey = nextKey;
      } else if (this.isLast(key)) {
        const beforeNode = this.queue[beforeKey];
        beforeNode.setNextKey(null);
        this.lastKey = beforeKey;
      } else {
        const nextNode = this.queue[nextKey];
        const beforeNode = this.queue[beforeKey];
        beforeNode.setNextKey(nextKey);
        nextNode.setBeforeKey(beforeKey);
      }
      delete this.queue[key];
      this.size--;
      return true;
    }
    return false;
  }

  /**
   * 更新某一个节点的内容
   * @param key 节点的key
   * @param value 节点的值
   * @return {boolean}
   */
  updateItemByKey(key: string, value: T): boolean {
    if (this.isExist(key)) {
      this.queue[key].setValue(value);
      return true;
    }
    return false;
  }

  /**
   * 根据key 获取值
   * @param key 节点的key
   * @return {*}
   */
  getValueByKey(key: string): T {
    if (this.isExist(key)) {
      return this.queue[key].getValue();
    }
    return null;
  }

  /**
   * 获取链表大小
   * @return {number}
   */
  getSize(): number {
    return this.size;
  }

  /**
   * 获取第一个节点
   */
  getFisrtItem(): T {
    return this.getValueByKey(this.firstKey);
  }

  /**
   * 获取最后一个节点
   */
  getLastItem(): T {
    return this.getValueByKey(this.lastKey);
  }

  /**
   * 获取所有节点的key值
   * @return {string[]}
   */
  getKeys(): string[] {
    return Object.keys(this.queue);
  }

  /**
   * 创建一个正向的迭代器
   * @param {string} key 开始迭代的节点key, 默认是 第一个节点
   * @return {next: (function(): {value: *, done: boolean}), prev:(function():{value: *, done: boolean})}
   */
  createIterator(key?: string) {
    key = key ? key : this.firstKey;
    let prevekey = null;
    return {
      next: () => {
        if (!key) {
          return {
            done: true,
            value: null,
          };
        }
        const value = this.getValueByKey(key);
        const done = this.isLast(key);
        prevekey = key;
        key = this.queue[key].getNextKey();
        return {
          value,
          done,
        };
      },
      prev: () => {
        if (!prevekey) {
          return {
            done: true,
            value: null,
          };
        }
        const beforeKey = this.queue[prevekey].getBeforeKey();
        key = prevekey;
        prevekey = beforeKey;
        if (beforeKey) {
          const value = this.getValueByKey(beforeKey);
          const done = this.isFirst(beforeKey);
          return {
            value,
            done,
          };
        } else {
          return {
            done: true,
            value: null,
          };
        }

      },
    };
  }

  //
  // /**
  //  * 创建一个倒序的迭代器
  //  * @param key 开始迭代的节点key, 默认是 最后一个节点
  //  * @param total 迭代的次数。 小于或者等于 0 代表不限制迭代次数。
  //  * @return {{next: (function(): {value: *, done: boolean})}}
  //  */
  // createReverseIterator(key, total = -1) {
  //   if (typeof total !== 'number') {
  //     throw TypeError('total 必须是数字');
  //   }
  //   if (this.isEmpty()) {
  //     throw RangeError('链表中不存在任何节点');
  //   }
  //   key = key ? key : this.lastKey;
  //   if (!this.isExist(key)) {
  //     throw RangeError('找不到key所对应的节点');
  //   }
  //   return {
  //     next: () => {
  //       if (!key) {
  //         // 迭代结束后，还在继续迭代
  //         return {
  //           done: true,
  //           value: null,
  //         };
  //       }
  //       const value = this.getValueByKey(key);
  //       total -= 1;
  //       const done = this.isFirst(key) || total === 0;
  //       key = this.queue[key].getBeforeKey();
  //       return {
  //         value,
  //         done,
  //       };
  //     },
  //   };
  // }
}
