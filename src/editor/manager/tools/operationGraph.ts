/*
 * @Description: 操作图形
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-24 16:54:01
 */

import { EditorView } from '@/editor/view'
import ToolBase from './toolBase'
import { Line, DragEvent, Bounds, Group, UI, registerUI, Ellipse, Direction9, PointerEvent } from 'leafer-editor';
import { EditorScaleEvent, EditTool, LineEditTool, registerEditTool } from '@leafer-in/editor'
import { IEditorMoveEvent } from '@leafer-in/interface'
import _ from 'lodash';
import { AABB, getMaxMin } from '@/editor/utils';
import { updateAuxiliaryLine, updateLinePoints, leafList, calculatedAdsorptionEffect } from './common';
const { left, right } = Direction9
@registerEditTool()
export class CustomLineEditTool extends LineEditTool {
  lastTarget!: any
  public bounds = new Bounds()
  public group = new Group({ name: '辅助线' })
  public get tag() { return 'CustomLineEditTool' } // 2. 定义全局唯一的 tag 名称
  onScaleWithDrag = _.throttle((event: EditorScaleEvent) => {
    const line = event.target as Line
    leafList.reset()
    if (!line) return
    leafList.add(line)
    /** 吸附的点位坐标 */
    const { adsorbPoint, lastTarget } = calculatedAdsorptionEffect(event.drag as any, this.editor.app, event.direction)
    this.lastTarget = lastTarget
    const { x, y } = adsorbPoint ? adsorbPoint : line.leafer?.getPagePointByClient(event.drag.origin as any)!
    updateLinePoints(line, { x, y }, event.direction)
  }, 16)

  onMove = _.throttle((event: IEditorMoveEvent) => {
    const { editor } = this
    const { list, app } = editor

    app.lockLayout()
    if (event.editor?.dragging) {
      // 清空辅助线，这样也能排除可视区域内的辅助线不为对比图形
      this.group.clear()
      this.editBox.visible = false
      const { lines, moveX, moveY } = updateAuxiliaryLine(editor, event)
      list.forEach(target => {
        target.moveWorld(moveX, moveY)
      })
      // 返回辅助线
      this.group.addMany(...lines.map(points => new Line({
        strokeWidthFixed: true,
        stroke: '#ff0000',
        name: '辅助线',
        points
      })))
      this.group.set({ x: 0, y: 0 })
    } else {
      const { moveX, moveY } = event
      list.forEach(target => {
        target.moveWorld(moveX, moveY)
      })
    }
    app.unlockLayout()
  }, 16)
  end = () => {
    this.group.clear()
    this.lastTarget && (this.lastTarget.opacity = 0)
  }

  onLoad() {
    this.editor.app.sky?.add(this.group)
    this.editor.on(DragEvent.END, this.end)
  }
  onUnload() {
    this.group.clear()
    this.editor.off(DragEvent.END, this.end)
  }
}
@registerEditTool()
export class CustomEditTool extends EditTool {
  /** 是否拖动 */
  isDrag = false
  public bounds = new Bounds()
  public group = new Group({ name: '辅助线' })
  public get tag() { return 'CustomEditTool' }
  onMove = _.throttle((event: IEditorMoveEvent) => {
    const { editor } = this
    const { list, app } = editor
    const { moveX, moveY, target } = event
    // app.lockLayout()
    /** 手动控制移动 */
    if (event.editor?.dragging) {
      // 清空辅助线，这样也能排除可视区域内的辅助线不为对比图形
      this.group.clear()
      this.editBox.visible = false
      const { lines, moveX, moveY } = updateAuxiliaryLine(editor, event)
      list.forEach(target => {
        target.moveWorld(moveX, moveY)
      })
      // 返回辅助线
      this.group.addMany(...lines.map(points => new Line({
        strokeWidthFixed: true,
        stroke: '#ff0000',
        name: '辅助线',
        points
      })))
      this.group.set({ x: 0, y: 0 })
      if (target instanceof Group && target.name === '图元') {
        target.children.forEach(item => {
          if (item instanceof Ellipse && item.name === '图元_圆点') {
            const { lineId, direction } = item.data
            if (!lineId) return
            const circleWorldPoint = item.getWorldPointByLocal({ x: item.x || 0, y: item.y || 0 })
            const adsorbPoint = item.getPagePoint(circleWorldPoint)
            const line = app?.findOne(lineId) as Line
            if (!line) return
            const { toPoint: { x: lastPointX, y: lastPointY }, x = 0, y = 0 } = line
            if (direction === left) {
              line.x = adsorbPoint.x
              line.y = adsorbPoint.y
              line.toPoint = { x: x + lastPointX - adsorbPoint.x, y: y + lastPointY - adsorbPoint.y }
            } else if (direction === right) {
              line.toPoint = { x: adsorbPoint.x - x, y: adsorbPoint.y - y }
            }
          }
        })
      }

    } else {
      /** 输入框或者键盘上下键控制移动 */
      list.forEach(target => {
        target.moveWorld(moveX, moveY)
      })
    }
    // app.unlockLayout()
  }, 16)

  drag = () => {
    this.isDrag = true
  }
  end = () => {
    this.isDrag = false
    this.group.clear()
    this.editBox.visible = true
  }
  onLoad() {
    this.isDrag = false
    this.editor.app.sky?.add(this.group)
    this.editor.on(DragEvent.DRAG, this.drag)
    this.editor.on(DragEvent.END, this.end)
  }
  onUpdate() {
    this.editBox.visible = !this.isDrag
  }
  onUnload() {
    this.group.clear()
    this.editor.off(DragEvent.DRAG, this.drag)
    this.editor.off(DragEvent.END, this.end)
  }

}


export default class ToolOperationGraph extends ToolBase {
  readonly keyboard = 'a'
  readonly type = 'operationGraph'

  constructor(view: EditorView) {
    super(view)
    Line.setEditOuter('CustomLineEditTool')
    UI.setEditOuter('CustomEditTool')
  }


  active() {
    this.app.editor.visible = true
    this.app.tree.hitChildren = true
    // this.app.editor.on(EditorMoveEvent.MOVE, this.drag)
    // this.app.on(DragEvent.DRAG, this.drag)
    // this.app.on(DragEvent.END, this.end)
  }
  inactive() {
    this.app.editor.visible = false
    this.app.tree.hitChildren = false
    this.app.editor.cancel()
  }
}



function findClosestGuideLine(value: number, guide: Map<number, AABB>, type: 'horizontal' | 'vertical' = 'horizontal'): any {
  let closestValue = null;
  let closestInnerId = null;
  let closestMin = null;
  let closestMax = null;
  let minDistance = 5;

  // 查找距离最小的辅助线
  guide.forEach((bounds, innerId) => {
    const { minX, minY, maxX, maxY } = bounds
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const array = type === 'vertical' ? [minX, centerX, maxX] : [minY, centerY, maxY]
    for (let i = 0; i < array.length; i++) {
      const distance = Math.abs(value - array[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closestValue = array[i];
        closestInnerId = innerId
        closestMin = type === 'vertical' ? minY : minX
        closestMax = type === 'vertical' ? maxY : maxX
      }
    }
  });
  if (closestValue && closestInnerId) {
    return { value: closestValue, innerId: closestInnerId, closestMax, closestMin };
  }
}