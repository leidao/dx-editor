/*
 * @Description: 操作图形
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-08-28 17:01:17
 */

import { EditorView } from '@/editor/editor'
import ToolBase from './toolBase'
export default class ToolDragCanvas extends ToolBase {
  readonly keyboard = 'h'
  readonly type = 'dragCanvas'
  constructor(editor: EditorView) {
    super(editor)
  }
  active() {
    this.app.config.move&&(this.app.config.move.drag = 'auto')
  }
  inactive() {
    this.app.config.move&&(this.app.config.move.drag = false)
  }
}
 
