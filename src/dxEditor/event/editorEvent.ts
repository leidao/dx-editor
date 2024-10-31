/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-10-22 15:18:03
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-29 12:05:06
 */
import { IEvent } from '@/dxCanvas/event'
import { PointerEvent, DragEvent } from './index'
import { Object2D } from '@/dxCanvas'
import { Queue } from '../history/historyManager'
type Type =
  'hover' | 'hoverLeave' | 'hoverEnter' | 'select' | 'unselect' |
  'add' | 'update' | 'remove' | 'before_paste' | 'paste' | 'shear' | 'copy' |
  'openInnerEdit' | 'closeInnerEdit' | 'drag' | 'end' | 'start' |
  'redo' | 'undo'

export class EditorEvent extends IEvent {

  static SELECT = 'editor.select'
  static HOVER = 'editor.hover'

  static ADD = 'editor.add'
  static UPDATE = 'editor.update'
  static REMOVE = 'editor.remove'

  static START = 'editor.start'
  static DRAG = 'editor.drag'
  static END = 'editor.end'

  static BEFORE_PASTE = 'editor.before_paste'
  static PASTE_CHANGE = 'editor.paste_change'

  static OPENINNEREDIT = 'editor.openInnerEdit'
  static CLOSEINNEREDIT = 'editor.closeInnerEdit'

  static HISTORY_CHANGE = 'editor.history_change'

  constructor(type: Type, data: { target?: Object2D | Object2D[], origin?: PointerEvent | DragEvent | null } = {}) {
    super(type)
    Object.assign(this, data)
  }
}
