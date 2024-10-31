/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-11-15 12:18:35
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-29 12:45:16
 */

import { IEvent } from "./IEvent"

export type IEventListenerId = {
  type: string,
  current: EventDispatcher,
  listener: EventListener
}

/* 事件监听器的类型 */
export type EventListener = (event: IEvent) => void

/* 事件调度器 */
export class EventDispatcher {
  // 监听器集合
  _listeners: Map<string, any[]> = new Map()

  /* 监听事件 */
  addEventListener(type: string, handler: EventListener) {
    const handlers = this._listeners.get(type);
    if (handlers) {
      handlers.push(handler);
    } else {
      this._listeners.set(type, [handler]);
    }
  }

  /* 判断目标对象的某个状态是否被某个监听器监听 */
  hasEventListener(type: string, listener: EventListener) {
    const listeners = this._listeners
    return listeners.get(type)?.indexOf(listener) !== -1
  }

  /* 取消事件监听 */
  removeEventListener(type: string, handler: EventListener) {
    const handlers = this._listeners.get(type);
    if (handlers) {
      if (handler) {
        handlers.splice(handlers.indexOf(handler) >>> 0, 1);
      } else {
        this._listeners.set(type, []);
      }
    }
  }

  removeAllListeners(){
    this._listeners.clear()
  }

  /* 触发事件 */
  dispatchEvent(type: string, evt: IEvent) {
    let handlers = this._listeners.get(type);
    if (handlers) handlers.slice().map((handler) => handler(evt!))

    handlers = this._listeners.get('*');
    if (handlers) handlers.slice().map((handler) => handler(type, evt!))
  }

  on(type: string, listener: EventListener): IEventListenerId {
    this.addEventListener(type, listener)
    return { type, current: this, listener }
  }

  off(id: IEventListenerId | IEventListenerId[]): void {
    if (!id) return
    const list = id instanceof Array ? id : [id]
    list.forEach(item => item.current.removeEventListener(item.type, item.listener))
    list.length = 0
  }
}
