/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-09 09:38:54
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-27 14:34:14
 */

import ToolManager from './tools/toolManager'
import KeybordManger from './keybord/keybordManger'
import { EditorView } from '../editor'
import HistoryManager from './history/historyManager'
export default class Manager {
  tools: ToolManager
  keybord: KeybordManger
  history: HistoryManager
  constructor(public editor: EditorView) {
    this.tools = new ToolManager(editor)
    this.keybord = new KeybordManger(editor)
    this.history = new HistoryManager(editor)
  }

  destroy() {
    this.tools.destroy()
    this.keybord.destroy()
    this.history.destroy()
  }
}
