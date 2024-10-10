/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-14 16:15:05
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-10 09:31:57
 */

import { EditorView } from '@/editor/view'
import { App } from 'leafer-ui'

abstract class ToolBase {
  /** 快捷键 */
  keyboard = ''
  /** 类型 */
  type = 'base'
  app:App
  constructor(public view: EditorView) { 
    this.app = view.app
  }
  /** 激活 */
  abstract active(): void
  /** 失活 */
  abstract inactive(): void
  /** 禁止切换tool */
  get enableSwitchTool(){
    return this.view.selector.dragging 
  }
}

export default ToolBase
