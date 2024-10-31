/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-14 16:15:05
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-30 09:23:43
 */

import { EditorView } from '@/dxEditor'

abstract class ToolBase {
  /** 类型 */
  type = 'base'
  constructor(public editor: EditorView) {}
  /** 激活 */
  abstract active(): void
  /** 失活 */
  abstract inactive(): void
  /** 禁止切换tool */
  // get enableSwitchTool(){
  //   return this.editor.selector.dragging 
  // }
}

export default ToolBase
