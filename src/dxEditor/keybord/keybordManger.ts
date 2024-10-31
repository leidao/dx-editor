/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-09 18:58:58
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-30 14:01:10
 */
import { EditorView } from '@/dxEditor'
import Hotkeys from './hotkeys'
import { KeyEvent } from '@/dxEditor/event'
import { IKeyboardEvent } from '@/dxCanvas/event'

type CommandMap = {
  name: string
  keyboard: string[] | string
  action: (event: KeyboardEvent, editor: EditorView) => void
}
/** 获取按键名称 */
export const getkeyName = (event: IKeyboardEvent): string => {
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
  return keyString.join('+')
}

export default class KeybordManager {
  hotkeys!: Hotkeys
  // [key: string]: any
  KeybordMap = new Map<string, CommandMap>() // 存放所有的命令

  constructor(private editor: EditorView) {
    // 监听键盘事件
    this.listen()
    // 注册默认快捷键
    this.initKeybord()
  }
  /** 注册默认快捷键 */
  initKeybord() {
    const hotkeys = new Hotkeys(this.editor)
    // 全选
    this.register({
      name: '全选',
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

  onKeydown = (event: KeyEvent) => {
    if (
      event.origin?.target instanceof HTMLInputElement ||
      event.origin?.target instanceof HTMLTextAreaElement 
    ) {
      return
    }
    if(this.editor.selector.editing) return

    const keyNames = getkeyName(event.origin as IKeyboardEvent)

    // console.log('event',keyNames);

    // 执行对应键盘命令
    this.KeybordMap.forEach(({ keyboard, action }) => {
      if (!keyboard) {
        return
      }
      const keys = Array.isArray(keyboard) ? keyboard : [keyboard]
      if (keys.indexOf(keyNames) > -1) {
        event.origin?.stopPropagation()
        event.origin?.preventDefault()
        action(event.origin as KeyboardEvent, this.editor)
      }
    })
  }

  // 初始化事件
  listen() {
    this.editor.addEventListener(KeyEvent.HOLD, this.onKeydown)
  }
  // 销毁事件
  destroy() {
    this.editor.removeEventListener(KeyEvent.HOLD, this.onKeydown)
  }
}
