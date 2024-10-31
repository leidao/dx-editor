/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-14 16:15:05
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-31 16:16:05
 */

import { EditorView } from '@/dxEditor'

abstract class ToolBase {
  /** 类型 */
  type = 'base'
  constructor(public editor: EditorView) {}
  /** 激活 */
  abstract active(data?:any): void
  /** 失活 */
  abstract inactive(): void
  /** 禁止切换tool */
  // get enableSwitchTool(){
  //   return this.editor.selector.dragging 
  // }
}

export default ToolBase
