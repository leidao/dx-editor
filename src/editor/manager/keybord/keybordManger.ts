/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-09 18:58:58
 * @LastEditors: ldx
 * @LastEditTime: 2024-08-30 20:11:22
 */
import { EditorView } from '@/editor/view'
import { KeyboardCode } from './keybord-code'
import { Keyboard, KeyEvent } from 'leafer-ui'
import Hotkeys from './hotkeys'
import { IKeyEvent, IUIEvent } from '@leafer-ui/interface'

type CommandMap = {
  name: string
  keyboard: string[] | string

  action: (event: KeyboardEvent, view: EditorView) => void
}

export default class KeybordManager {
  hotkeys!: Hotkeys
  // [key: string]: any
  KeybordMap = new Map<string, CommandMap>() // 存放所有的命令

  constructor(private view: EditorView) {
    // 监听键盘事件
    this.listen()
    // 注册默认快捷键
    this.initKeybord()
  }
  /** 注册默认快捷键 */
  initKeybord() {
    const hotkeys = new Hotkeys(this.view)
    // 删除选中
    this.register({
      name: 'deleteSelected',
      keyboard: ['backspace', 'delete'],
      action: hotkeys.deleteSelected
    })
    // 全选
    this.register({
      name: 'selectAll',
      keyboard: ['ctrl+a'],
      action: hotkeys.selectAll
    })
   
    this.hotkeys = hotkeys
  }
  /** 注册快捷键 */
  register(command: CommandMap) {
    const name = command.name
    if (this.KeybordMap.has(name)) {
      throw new Error(`快捷键命令 ${name} 已经被使用过，请换一个名称`)
    }
    this.KeybordMap.set(command.name, command)
    // this[command.name] = command.execute
  }

  /** 取消注册 */
  unRegister(name: string) {
    this.KeybordMap.delete(name)
  }

  onKeydown = (event: IKeyEvent) => {
    if (
      event.origin?.target instanceof HTMLInputElement ||
      event.origin?.target instanceof HTMLTextAreaElement
    ) {
      // event.stop && event.stop()
      // event.stopDefault && event.stopDefault()
      return
    }

    const { key, shiftKey, altKey, ctrlKey, metaKey } = event

    const keyString: string[] = []
    if (ctrlKey || metaKey) keyString.push('ctrl')
    if (shiftKey) keyString.push('shift')
    if (altKey) keyString.push('alt')
    const keyCode = key?.toLocaleLowerCase()
    if (keyCode) {
      if (!keyString.includes(keyCode)) {
        keyString.push(keyCode)
      }
    }

    const keyNames = keyString.join('+')
    console.log('keyNames', keyNames)

    // 执行对应键盘命令
    this.KeybordMap.forEach(({ keyboard, action }) => {
      if (!keyboard) {
        return
      }
      const keys = Array.isArray(keyboard) ? keyboard : [keyboard]
      if (keys.indexOf(keyNames) > -1) {
        event.origin?.stopPropagation()
        // event.preventDefault()
        action(event.origin as KeyboardEvent, this.view)
      }
    })
  }

  // 初始化事件
  listen() {
    this.view.app.on(KeyEvent.DOWN, this.onKeydown)
  }
  // 销毁事件
  destroy() {
    this.view.app.off(KeyEvent.DOWN, this.onKeydown)
  }
}
