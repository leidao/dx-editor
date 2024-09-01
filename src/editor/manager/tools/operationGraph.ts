/*
 * @Description: 操作图形
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-08-28 17:02:16
 */

import { EditorView } from '@/editor/view'
import ToolBase from './toolBase'
export default class ToolOperationGraph extends ToolBase {
  readonly keyboard = 'a'
  readonly type = 'operationGraph'
  constructor(view: EditorView) {
    super(view)
  }
  active() {
    this.app.editor.visible = true
    this.app.tree.hitChildren = true
  }
  inactive() {
    this.app.editor.visible = false
    this.app.tree.hitChildren = false
    this.app.editor.cancel()
  }
}
 
