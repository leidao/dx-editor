/*
 * @Description: 操作图形
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-09 16:22:20
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
    this.view.selector.hitChildren = true
    this.app.tree.hitChildren = true
  }
  inactive() {
    this.view.selector.hitChildren = false
    this.app.tree.hitChildren = false
    this.view.selector.cancel()
  }
}
