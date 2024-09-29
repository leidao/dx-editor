/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-27 16:04:35
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-29 17:59:43
 */
import { IEditorMoveEvent } from "@leafer-in/interface"
import { EditTool, registerEditTool } from "leafer-editor"
import globalConfig from '../config'
@registerEditTool()
export default class CustomEditTool extends EditTool {
  public get tag() { return 'CustomEditTool' }
  onMove = (event: IEditorMoveEvent) => {
    const { editor } = this
    const { list, app } = editor
    // const { moveX, moveY, target } = event
    const { moveSize } = globalConfig
    const distance = app.getWorldPointByPage({ x: moveSize, y: 0 }, app.leafer, true).x
    let moveX = 0, moveY = 0
    if (event.editor?.dragging) {
      moveX = Math.round(event.moveX / distance) * distance
      moveY = Math.round(event.moveY / distance) * distance
    } else {
      moveX = event.moveX === 0 ? moveX : event.moveX > 0 ? distance : -distance
      moveY = event.moveY === 0 ? moveY : event.moveY > 0 ? distance : -distance
    }
    if (moveX === 0 && moveY === 0) return
    app.lockLayout()
    list.forEach(target => {
      target.moveWorld(moveX, moveY)
    })
    app.unlockLayout()
  }

  drag = () => {
  }
  end = () => {
  }
  onLoad() {

  }
  onUpdate() {
  }
  onUnload() {

  }

}
