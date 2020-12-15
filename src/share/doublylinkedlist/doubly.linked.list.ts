import LinkedNode from './linked.node';
import { StepIterator } from '../../interface/step';


/**
 * 双向链表
 * created by robinwp
 * email: 284595745@qq.com
 * version : 1.0
 */

export default class DoublyLinkedList<T> {
  private readonly queue: Map<string, LinkedNode<T>>;
  private firstKey: string;
  private lastKey: string;

  constructor() {
    this.queue = new Map<string, LinkedNode<T>>();
    this.firstKey = null;
    this.lastKey = null;
  }

  /**
   * 队列是否为空
   * @returns {boolean}
   */
  isEmpty(): boolean {
    return this.queue.size === 0;
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
   * 获取最后一个的key值
   * @return {string}
   */
  getLastKey(): string {
    return this.lastKey;
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
   * 获取第一个的key值
   * @return {string}
   */
  getFirstKey(): string {
    return this.firstKey;
  }

  /**
   * 判断key是否存在
   * @param key 节点的key
   * @return {boolean}
   */
  isExist(key: string): boolean {
    if (!key) return false;
    return this.queue.has(key);
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
        this._getLinkedNodeByKey(this.lastKey)
          .setNextKey(key);
      }
      this.queue.set(key, new LinkedNode(key, value, null, this.lastKey));
      this.lastKey = key;
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
        this._getLinkedNodeByKey(this.firstKey)
          .setBeforeKey(key);
      }
      this.queue.set(key, new LinkedNode(key, value, this.firstKey, null));
      this.firstKey = key;
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
        const node = this._getLinkedNodeByKey(key);
        const nextKey = node.getNextKey();
        this.queue.set(itemKey, new LinkedNode(itemKey, itemValue, nextKey, key));
        const nextNode = this._getLinkedNodeByKey(nextKey);
        nextNode.setBeforeKey(itemKey);
        node.setNextKey(itemKey);
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
        const node = this._getLinkedNodeByKey(key);
        const beforeKey = node.getBeforeKey();
        this.queue.set(itemKey, new LinkedNode(itemKey, itemValue, key, beforeKey));
        const beforeNode = this._getLinkedNodeByKey(beforeKey);
        node.setBeforeKey(itemKey);
        beforeNode.setNextKey(itemKey);
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
      const node = this._getLinkedNodeByKey(key);
      const nextKey = node.getNextKey();
      const beforeKey = node.getBeforeKey();
      if (this.isFirst(key)) {
        const nextNode = this._getLinkedNodeByKey(nextKey);
        nextNode.setBeforeKey(null);
        this.firstKey = nextKey;
      } else if (this.isLast(key)) {
        const beforeNode = this._getLinkedNodeByKey(beforeKey);
        beforeNode.setNextKey(null);
        this.lastKey = beforeKey;
      } else {
        const nextNode = this._getLinkedNodeByKey(nextKey);
        const beforeNode = this._getLinkedNodeByKey(beforeKey);
        beforeNode.setNextKey(nextKey);
        nextNode.setBeforeKey(beforeKey);
      }
      this.queue.delete(key);
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
      this._getLinkedNodeByKey(key)
        .setValue(value);
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
    const linkedNode = this._getLinkedNodeByKey(key);
    if (linkedNode)
      return linkedNode.getValue();
    else return null;
  }

  _getLinkedNodeByKey(key: string): LinkedNode<T> {
    return this.queue.get(key);
  }

  /**
   * 获取链表大小
   * @return {number}
   */
  getSize(): number {
    return this.queue.size;
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
    return Array.from(this.queue.keys());
  }

  /**
   * 创建一个正向的迭代器
   * 本来是要写一个迭代器的，但是由于要实现上一步和下一步，就只好先这样了
   * @param {string} [key] 开始迭代的节点key, 默认是 第一个节点
   * @return {{next(): {done: boolean; value: null}; prev(): {done: boolean; value: null}}}
   */
  createIterator(key?: string): StepIterator<T> {
    key = key ? key : this.firstKey;
    let prevekey = key;
    if (!this.isExist(key)) {
      return {
        next() {
          return {
            done: true,
            value: null,
          };
        },
        prev() {
          return {
            done: true,
            value: null,
          };
        },
      };
    }
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
        key = this._getLinkedNodeByKey(key)
          .getNextKey();
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
        const beforeKey = this._getLinkedNodeByKey(prevekey)
          .getBeforeKey();
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

  /**
   * 批量添加数据
   * @param {string} key
   * @param {*} queueObject
   */
  addLastItemByList(key: string, queueObject: any) {
    if (queueObject && typeof queueObject === 'object' && Object.prototype.hasOwnProperty.call(queueObject, key)) {
      this.addLastItem(key, queueObject[key].value);
      const nextKey = queueObject[key].nextKey;
      if (nextKey) {
        this.addLastItemByList(nextKey, queueObject);
      }
    }
  }

  /**
   * 将双向链表转成json字符串
   * @return {string} JSON 字符串
   */
  toJSON(): string {
    const queue = Object.create(null);
    this.queue.forEach((value: LinkedNode<T>, key: string) => {
      queue[key] = value;
    });
    return JSON.stringify({
      queue,
      firstKey: this.firstKey,
      lastKey: this.lastKey,
    });
  }

  /**
   * 克隆一个新对象
   */
  clone(): DoublyLinkedList<T> {
    const data = JSON.parse(this.toJSON());
    const cloneList = new DoublyLinkedList<T>();
    cloneList.addLastItemByList(data.firstKey, data.queue);
    return cloneList;
  }

  /**
   * 将节点上移一个位置
   * @param {string} key
   */
  moveupByKey(key: string) {
    if (this.isFirst(key)) return;
    if (this.isExist(key)) {
      const sourceNode = this._getLinkedNodeByKey(key);
      const nextKey = sourceNode.getNextKey();
      const beforeKey = sourceNode.getBeforeKey();

      const targetNode = this._getLinkedNodeByKey(beforeKey);
      const targetbeforeKey = targetNode.getBeforeKey();

      targetNode.setBeforeKey(key);
      targetNode.setNextKey(nextKey);

      sourceNode.setBeforeKey(targetbeforeKey);
      sourceNode.setNextKey(beforeKey);

      if (this.isFirst(beforeKey)) {
        this.firstKey = key;
      } else if (targetbeforeKey) {
        this._getLinkedNodeByKey(targetbeforeKey)
          .setNextKey(key);
      }
      if (this.isLast(key)) {
        this.lastKey = beforeKey;
      } else if (nextKey) {
        this._getLinkedNodeByKey(nextKey)
          .setBeforeKey(beforeKey);
      }
    }
  }

  /**
   * 将节点下移一个位置
   * @param {string} key
   */
  movedownByKey(key: string) {
    if (this.isLast(key)) return;
    if (this.isExist(key)) {
      const sourceNode = this._getLinkedNodeByKey(key);
      const beforeKey = sourceNode.getBeforeKey();
      const nextNodeKey = sourceNode.getNextKey();

      const targetNode = this._getLinkedNodeByKey(nextNodeKey);
      const nextKey = targetNode.getNextKey();


      targetNode.setBeforeKey(beforeKey);
      targetNode.setNextKey(key);

      sourceNode.setBeforeKey(nextNodeKey);
      sourceNode.setNextKey(nextKey);

      if (this.isLast(nextNodeKey)) {
        this.lastKey = key;
      } else if (nextKey) {
        this._getLinkedNodeByKey(nextKey)
          .setBeforeKey(key);
      }

      if (this.isFirst(key)) {
        this.firstKey = nextNodeKey;
      } else if (beforeKey) {
        this._getLinkedNodeByKey(beforeKey)
          .setNextKey(nextNodeKey);
      }
    }
  }

  /**
   * 交换位置
   * @param {string} sourceKey
   * @param {string} targetKey
   */
  exchangeItemByKey(sourceKey: string, targetKey: string) {
    if (this.isExist(sourceKey) && this.isExist(targetKey)) {
      const sourceNode = this._getLinkedNodeByKey(sourceKey);
      const sourceBeforeKey = sourceNode.getBeforeKey();
      const sourceNextKey = sourceNode.getNextKey();

      const targetNode = this._getLinkedNodeByKey(targetKey);
      const targetBeforeKey = targetNode.getBeforeKey();
      const targetNextKey = targetNode.getNextKey();

      if (sourceNextKey === targetKey) {
        // 相邻的两个互换位置 source 在前 target在后
        // 将 source 节点下移一个位置
        this.movedownByKey(sourceKey);
      } else if (sourceBeforeKey === targetKey) {
        // 相邻的两个互换位置 target在前 source 在后
        // 将 source 节点上移一个位置
        this.moveupByKey(sourceKey);
      } else {
        sourceNode.setBeforeKey(targetBeforeKey);
        sourceNode.setNextKey(targetNextKey);
        targetNode.setBeforeKey(sourceBeforeKey);
        targetNode.setNextKey(sourceNextKey);

        if (this.isFirst(sourceKey)) {
          this.firstKey = targetKey;
        } else if (this.isFirst(targetKey)) {
          this.firstKey = sourceKey;
        }

        if (this.isLast(sourceKey)) {
          this.lastKey = targetKey;
        } else if (this.isLast(targetKey)) {
          this.lastKey = sourceKey;
        }

        if (sourceBeforeKey) {
          const item = this._getLinkedNodeByKey(sourceBeforeKey);
          if (item) {
            item.setNextKey(targetKey);
          }
        }
        if (targetNextKey) {
          const item = this._getLinkedNodeByKey(targetNextKey);
          if (item) {
            item.setBeforeKey(sourceKey);
          }
        }

        if (targetBeforeKey) {
          const item = this._getLinkedNodeByKey(targetBeforeKey);
          if (item) {
            item.setNextKey(sourceKey);
          }
        }
        if (sourceNextKey) {
          const item = this._getLinkedNodeByKey(sourceNextKey);
          if (item) {
            item.setBeforeKey(targetKey);
          }
        }
      }
    }
  }
}
