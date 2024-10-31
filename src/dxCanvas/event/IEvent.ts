
/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-10-15 22:02:32
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-29 12:32:02
 */

import { Object2D } from "../objects/Object2D"

export type IPointerEvent = PointerEvent
export type IDragEvent = DragEvent
export type IKeyboardEvent = KeyboardEvent

export class IEvent {
  /** 自定义属性 */
  [key:string]:any
  target?: Object2D
  origin?: Event
  moveX = 0
  moveY = 0
  constructor(public type: string = '') { }
}

