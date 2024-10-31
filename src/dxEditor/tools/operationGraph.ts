/*
 * @Description: 操作图形
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-24 11:22:06
 */

import { EditorView } from '@/dxEditor'
import ToolBase from './toolBase'
export default class ToolOperationGraph extends ToolBase {
  readonly type = 'operationGraph'
  constructor(editor: EditorView) {
    super(editor)
  }
  active() {
    this.editor.selector.hittable = true
    this.editor.cursor.setCursor('auto')
  }
  inactive() {
    this.editor.selector.hittable = false
    // this.editor.selector.cancel()
  }
}
