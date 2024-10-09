/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-09 09:38:54
 * @LastEditors: ldx
 * @LastEditTime: 2024-08-27 14:46:37
 */

import { App } from 'leafer-ui'
import ToolBase from './toolBase'
import { EditorView } from '@/editor/view'
class ToolManager {
  toolMap = new Map<string, ToolBase>()
  /**
   * keyboard => tool type
   */
  keyboardMap = new Map<string, string>()
  /** 激活的tool */
  activeTool: ToolBase | null = null
  /** 切换选中toolbar */
  setSelectedName!: (toolName: string) => void
  constructor(public view: EditorView) {}
  /** 注册 */
  register(tool: ToolBase) {
    if (!tool.type) {
      throw new Error(`tool ${tool.type} 属性没有定义`)
    }
    if (this.toolMap.has(tool.type)) {
      console.warn(`tool ${tool.type} 已经被注册过`)
    }
    this.toolMap.set(tool.type, tool)
  }
  /** 取消注册 */
  unRegister(name: string) {
    this.toolMap.delete(name)
  }
 
  /** 设置工具激活 */
  setActiveTool(toolName: string) {
    const prevTool = this.activeTool
    if (prevTool?.enableSwitchTool || this.getActiveToolName() === toolName) {
      // 禁止切换tool
     return
   }
    const activeTool = (this.activeTool = this.toolMap.get(toolName) || null)
    if (!activeTool) {
      throw new Error(`没有 ${toolName} 对应的工具对象`)
    }
   
    if (prevTool) {
      prevTool.inactive()
    }
    activeTool.active()
  }
  getActiveToolName() {
    return this.activeTool?.type
  }
  destroy(){
    this.toolMap.clear()
  }
}
export default ToolManager
