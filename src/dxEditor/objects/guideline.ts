/*
 * @Description: 辅助线
 * @Author: ldx
 * @Date: 2024-08-28 14:10:14
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-29 16:53:54
 */
import { Group, Line, Object2D, OrbitEvent } from '@/dxCanvas';
import globalConfig from '../config'
import { getClosestTimesVal } from '../utils';
import _ from 'lodash';
import { EditorView } from '@/dxEditor';
import { PointerEvent } from '@/dxEditor/event'
import { IPointerEvent } from '@/dxCanvas/event';


export class Guideline {
  xLine!: Line
  yLine!: Line
  lineColor = '#f00'
  private _visible = false
  get visible(): boolean {
    return this._visible && globalConfig.helpLineVisible
  }
  set visible(visible: boolean) {
    this._visible = visible
    this.xLine.visible = this.visible
    this.yLine.visible = this.visible
    if (!this.visible) {
      this.xLine.y = 0
      this.yLine.x = 0
    }
    this.editor.sky.render()
  }
  constructor(public editor: EditorView) {
    this.xLine = new Line({
      enableCamera: false,
      style: {
        lineWidth: 1,
        strokeStyle: globalConfig.helpLineColor,
        lineDash: [5, 5],
      },
      points: [[0, 0], [editor.domElement.clientWidth, 0]],
      visible: this.visible,
      index: Infinity
    })
    this.yLine = new Line({
      enableCamera: false,
      style: {
        lineWidth: 1,
        strokeStyle: globalConfig.helpLineColor,
        lineDash: [5, 5],
      },
      points: [[0, 0], [0, editor.domElement.clientHeight]],
      visible: this.visible,
      index: Infinity
    })
    this.editor.sky.add(this.xLine)
    this.editor.sky.add(this.yLine)
    this.listen()

  }

  drawShape = (event: PointerEvent | OrbitEvent) => {
    if (!this.visible) return
    if (event instanceof PointerEvent || event.type === 'wheel' ) {
      const origin = event.origin as IPointerEvent
      const worldPoint = this.editor.sky.getWorldByClient(origin.clientX, origin.clientY)
      let x = getClosestTimesVal(worldPoint.x, globalConfig.moveSize)
      let y = getClosestTimesVal(worldPoint.y, globalConfig.moveSize)
      const pagePoint = this.editor.sky.getPageByWorld(x,y)
      this.xLine.position.y = pagePoint.y <= 20 ? 20 : pagePoint.y
      this.yLine.position.x = pagePoint.x <= 20 ? 20 : pagePoint.x
    } else if (event instanceof OrbitEvent) {
      const origin = event.origin as IPointerEvent
      if(!origin || event.type === 'wheel') return
      this.xLine.position.y = (this.xLine.position.y || 0) + origin.clientY
      this.yLine.position.x = (this.yLine.position.x || 0) + origin.clientX
    }
    this.editor.sky.render()
  }

  listen() {
    this.editor.addEventListener(PointerEvent.MOVE, this.drawShape)
    this.editor.orbitControler.addEventListener(OrbitEvent.CHANGE, this.drawShape)
  }
  destroy() {
    this.editor.removeEventListener(PointerEvent.MOVE, this.drawShape)
    this.editor.orbitControler.removeEventListener(OrbitEvent.CHANGE, this.drawShape)
  }




}
