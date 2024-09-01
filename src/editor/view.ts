/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-08-20 14:50:58
 * @LastEditors: ldx
 * @LastEditTime: 2024-08-31 09:42:38
 */

import _ from 'lodash'
import { App, Rect } from 'leafer-editor'
// import { Ruler } from 'leafer-x-ruler'
import { Line, Image, DragEvent } from 'leafer-ui'
import { v4  } from 'uuid'
// import KeybordManager from './command/keybordManger'
// import CursorManager from './cursor/cursorManager'
import Manager from './manager/index'
import Ruler from './objects/ruler'

type Option = {
  container: HTMLDivElement
}
export class EditorView {
  domElement!: HTMLDivElement
  app!: App
  /** 管理器 */
  manager!: Manager
  /** 标尺 */
  ruler!:Ruler
  constructor(option: Option) {
    if (!option.container) return
    // 场景相关
    this.domElement = option.container

    this.app = new App({
      view: this.domElement,
      // 会自动创建 editor实例、tree层、sky层
      editor: {
        /** 锁定元素的宽高比 */
        lockRatio:true
      } 
    })
    this.ruler = new Ruler(this.app)

     // 管理器
     this.manager = new Manager(this)

  }

  /** 拖拽进入目标元素 */
  dragenter = (event: any) => {
    // 表示在当前位置放置拖拽元素将进行移动操作
    event.dataTransfer && (event.dataTransfer.dropEffect = 'move')
  }
  /** 拖拽离开目标元素 */
  dragleave = (event: any) => {
    // 表示在当前位置不允许放置拖拽元素，即拖放操作无效。
    event.dataTransfer && (event.dataTransfer.dropEffect = 'none')
  }
  /** 拖拽元素在目标元素上移动 */
  dragover = (event: any) => {
    // 如果默认行为没有被阻止,drop事件不会被触发
    event.preventDefault()
  }
  /** 拖拽元素在目标元素上松开鼠标 */
  drop = (event: any) => {
    const src = event.dataTransfer.getData('img');
    const coord = this.app.getPagePointByClient(event)
    const image = new Image({
      url: src,
      x: coord.x -35,
      y: coord.y -25,
      // offsetX: -35,
      // offsetY: -25,
      width: 70,
      height: 50,
      editable: true,
      name:'图元',
      id: v4(),
    })
    this.app.tree.add(image)
    this.app.tree.emit('add')
  }

  destroy() {
    this.app.destroy()
    this.manager.destroy()
   }

}
