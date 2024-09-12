/*
 * @Description: 操作图形
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-12 11:28:01
 */

import { EditorView } from '@/editor/view'
import ToolBase from './toolBase'
import { Line, DragEvent, Bounds, Group, UI, registerUI } from 'leafer-editor';
import { EditorMoveEvent, EditorScaleEvent, EditTool, LineEditTool, registerEditTool } from '@leafer-in/editor'
import { IEditorMoveEvent } from '@leafer-in/interface'
import _ from 'lodash';
import { AABB, getMaxMin } from '@/editor/utils';
import { updateAuxiliaryLine, updateLinePoints } from './common';
@registerEditTool()
export class CustomLineEditTool extends LineEditTool {
  public bounds = new Bounds()
  public group = new Group({ name: '辅助线' })
  public get tag() { return 'CustomLineEditTool' } // 2. 定义全局唯一的 tag 名称
  onScaleWithDrag = _.throttle((event: EditorScaleEvent) => {
    const line = event.target as Line
    if (!line) return
    const { x, y } = line.leafer?.getPagePointByClient(event.drag.origin as any)!
    updateLinePoints(line, { x, y }, event.direction)
  }, 16)

  onMove(event: IEditorMoveEvent): void {
    const { editor } = this
    const { list, app } = editor
    const { moveX, moveY } = event
    app.lockLayout()
    if (event.editor?.dragging) {
      // 清空辅助线，这样也能排除可视区域内的辅助线不为对比图形
      this.group.clear()
      this.editBox.visible = false
      const lines = updateAuxiliaryLine(editor, event)
      this.group.addMany(...lines)
    } else {
      list.forEach(target => {
        target.moveWorld(moveX, moveY)
      })
    }
    app.unlockLayout()
  }
  end = () => {
    this.group.clear()
  }
  onLoad(): void {
    this.editor.app.tree?.add(this.group)
    this.editor.on(DragEvent.END, this.end)
  }

  onUnload(): void {
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
  onMove(event: IEditorMoveEvent): void {
    const { editor } = this
    const { list, app } = editor
    const { moveX, moveY } = event
    app.lockLayout()
    if (event.editor?.dragging) {
      // 清空辅助线，这样也能排除可视区域内的辅助线不为对比图形
      this.group.clear()
      this.editBox.visible = false
      const lines = updateAuxiliaryLine(editor, event)
      this.group.addMany(...lines)
    } else {
      list.forEach(target => {
        target.moveWorld(moveX, moveY)
      })
    }
    app.unlockLayout()
  }

  drag = () => {
    this.isDrag = true
  }
  end = () => {
    this.isDrag = false
    this.group.clear()
    this.editBox.visible = true
  }
  onLoad(): void {
    this.isDrag = false
    this.editor.app.tree?.add(this.group)
    this.editor.on(DragEvent.DRAG, this.drag)
    this.editor.on(DragEvent.END, this.end)
  }
  onUpdate(): void {
    this.editBox.visible = !this.isDrag
  }
  onUnload(): void {
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