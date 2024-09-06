/*
 * @Description: 绘制线段
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-06 16:26:13
 */
import { v4 } from 'uuid'
import { EditorView } from '@/editor/view'
import ToolBase from './toolBase'
import { DragEvent, Keyboard, Line, Point } from 'leafer-editor'

export const updateLinePoints = (line: Line, point: { x: number, y: number }, direction: number) => {
  const { x = 0, y = 0 } = line
  let currentX = point.x, currentY = point.y
  if (direction === 4) {
    let toPointX = currentX - x
    let toPointY = currentY - y
    /** 是否按住了shift健 */
    if (Keyboard.isHold('ShiftLeft') || Keyboard.isHold('ShiftRight')) {
      // 极轴锁定
      const angle = new Point(x, y).getAngle(new Point(currentX, currentY))
      const width = new Point(currentX, currentY).getDistance(new Point(x, y))
      if (angle > -22.5 && angle < 22.5) {
        toPointY = 0
      } else if (angle > 22.5 && angle < 67.5) {
        const radian = 45 * Math.PI / 180;
        const oppositeSide = width * Math.sin(radian)
        toPointX = oppositeSide
        toPointY = oppositeSide
      } else if (angle > 67.5 && angle < 112.5) {
        toPointX = 0
      } else if (angle > 112.5 && angle < 157.5) {
        const radian = 135 * Math.PI / 180;
        const oppositeSide = width * Math.sin(radian)
        toPointX = -oppositeSide
        toPointY = oppositeSide
      } else if (angle > 157.5 || angle < -157.5) {
        toPointY = 0
      } else if (angle > -157.5 && angle < -112.5) {
        const radian = -135 * Math.PI / 180;
        const oppositeSide = width * Math.sin(radian)
        toPointX = oppositeSide
        toPointY = oppositeSide
      } else if (angle > -112.5 && angle < -67.5) {
        toPointX = 0
      } else if (angle > -67.5 && angle < 22.5) {
        const radian = -45 * Math.PI / 180;
        const oppositeSide = width * Math.sin(radian)
        toPointX = -oppositeSide
        toPointY = oppositeSide
      }
    }
    line.toPoint = { x: toPointX, y: toPointY }
  } else if (direction === 6) {
    const { x: lastPointX, y: lastPointY } = line.toPoint
    /** 是否按住了shift健 */
    if (Keyboard.isHold('ShiftLeft') || Keyboard.isHold('ShiftRight')) {
      // 极轴锁定
      const angle = new Point(x + lastPointX, y + lastPointY).getAngle(new Point(currentX, currentY))
      const width = new Point(currentX, currentY).getDistance(new Point(x + lastPointX, y + lastPointY))
      // console.log('angle', angle);
      if (angle > -22.5 && angle < 22.5) {
        currentY = y + lastPointY
      } else if (angle > 22.5 && angle < 67.5) {
        const radian = 45 * Math.PI / 180;
        const oppositeSide = width * Math.sin(radian)
        currentX = x + lastPointX + oppositeSide
        currentY = y + lastPointY + oppositeSide
      } else if (angle > 67.5 && angle < 112.5) {
        currentX = x + lastPointX
      } else if (angle > 112.5 && angle < 157.5) {
        const radian = 135 * Math.PI / 180;
        const oppositeSide = width * Math.sin(radian)
        currentX = x + lastPointX - oppositeSide
        currentY = y + lastPointY + oppositeSide
      } else if (angle > 157.5 || angle < -157.5) {
        currentY = y + lastPointY
      } else if (angle > -157.5 && angle < -112.5) {
        const radian = -135 * Math.PI / 180;
        const oppositeSide = width * Math.sin(radian)
        currentX = x + lastPointX + oppositeSide
        currentY = y + lastPointY + oppositeSide
      } else if (angle > -112.5 && angle < -67.5) {
        currentX = x + lastPointX
      } else if (angle > -67.5 && angle < 22.5) {
        const radian = -45 * Math.PI / 180;
        const oppositeSide = width * Math.sin(radian)
        currentX = x + lastPointX - oppositeSide
        currentY = y + lastPointY + oppositeSide
      }
    }
    let toPointX = x + lastPointX - currentX
    let toPointY = y + lastPointY - currentY
    line.x = currentX
    line.y = currentY
    line.toPoint = { x: toPointX, y: toPointY }
  }



}
export default class ToolDrawLine extends ToolBase {
  readonly keyboard = 'l'
  readonly type = 'drawLine'
  line!: Line
  constructor(view: EditorView) {
    super(view)
  }

  start = (e: DragEvent) => {
    const { x, y } = this.app.getPagePoint({ x: e.x, y: e.y })
    this.line = new Line({
      editable: true,
      strokeWidth: 2,
      stroke: '#ff0000',
      x, y,
      name: '线段',
      id: v4()
    })
    this.app.tree.add(this.line)
  }

  drag = (e: DragEvent) => {
    if (this.line) {
      console.log('this.app.getPagePointByClient', this.app.getPagePointByClient);

      const { x, y } = this.app.getPagePointByClient(e.origin as any)
      updateLinePoints(this.line, { x, y }, 4)
    }
  }
  end = () => {
    this.app.tree.emit('add')
  }
  active() {
    this.app.editor.visible = false
    this.app.tree.hitChildren = false
    this.app.on(DragEvent.START, this.start)
    this.app.on(DragEvent.DRAG, this.drag)
    this.app.on(DragEvent.END, this.end)
  }
  inactive() {
    this.app.editor.visible = true
    this.app.tree.hitChildren = true
    this.app.off(DragEvent.START, this.start)
    this.app.off(DragEvent.DRAG, this.drag)
    this.app.off(DragEvent.END, this.end)
  }

}

