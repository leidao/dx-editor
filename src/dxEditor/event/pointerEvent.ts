/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-10-22 15:18:03
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-23 15:47:29
 */
import { IEvent, IPointerEvent } from '@/dxCanvas/event'
type Type = 'down' | 'move' | 'up' | 'tap' | 'double_tap' | 'menu'
export class PointerEvent extends IEvent {

  static DOWN = 'pointer.down'
  static MOVE = 'pointer.move'
  static UP = 'pointer.up'

  static TAP = 'tap'
  static DOUBLE_TAP = 'double_tap'

  static MENU = 'pointer.menu'

 
  constructor(type: Type, event: IPointerEvent|MouseEvent) {
    super(type)
    this.origin = event
  }
}

export const MyPointerEvent = PointerEvent