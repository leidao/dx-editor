/*
 * @Description: 绘制母线
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-01 16:35:15
 */
import { EditorView } from '@/dxEditor'
import ToolBase from './toolBase'
import { getClosestTimesVal } from '@/dxEditor/utils'
import globalConfig from '@/dxEditor/config'
import { IPointerEvent, Line } from '@/dxCanvas'
import { EditorEvent, KeyEvent, PointerEvent } from '@/dxEditor/event'
/** 绘制母线 */
export default class ToolDrawBusbar extends ToolBase {
  readonly = 'm'
  readonly type = 'drawBusbar'
  busbar: Line | null = null

  constructor(editor: EditorView) {
    super(editor)
  }
  onTap = (event: PointerEvent) => {
    // 获取world坐标
    const { clientX, clientY } = event.origin as IPointerEvent
    const pagePoint = this.editor.tree.getWorldByClient(clientX, clientY)
    // 获取网格的倍数坐标
    let x = getClosestTimesVal(pagePoint.x, globalConfig.moveSize)
    let y = getClosestTimesVal(pagePoint.y, globalConfig.moveSize)
    if (!this.busbar) {
      this.busbar = new Line({
        position: [x, y],
        name: '母线',
        points: [[0, 0]],
        style: {
          lineWidth: 2,
          lineCap: 'round',
          lineJoin: 'round',
          strokeStyle: '#008800',
        },
        hoverStyle: {
          strokeStyle: '#ff0000',
        },
        selectStyle: {
          strokeStyle: '#ff0000',
        },
        userData: {
          // 记录真实page点位坐标
          _points: [{ x, y }],
          _movePoints: [],
        },
      })
      this.editor.tree.add(this.busbar)
    } else {
      this.busbar.userData._points = this.busbar.userData._movePoints.slice()
      this.busbar = null
      this.editor.dispatchEvent(EditorEvent.ADD, new EditorEvent('add'))
    }
  }
  onMove = (event: PointerEvent) => {
    if (this.busbar) {
      // 获取world坐标
      const { clientX, clientY } = event.origin as IPointerEvent
      const pagePoint = this.editor.tree.getWorldByClient(clientX, clientY)
      let x = getClosestTimesVal(pagePoint.x, globalConfig.moveSize)
      let y = getClosestTimesVal(pagePoint.y, globalConfig.moveSize)
      // diffX > diffY 判断导线方向
      this.busbar.userData._movePoints = this.busbar.userData._points.concat({ x, y })
      // 根据_points点位减去x/y坐标得到points
      const { x: px, y: py } = this.busbar.position
      const points = this.busbar.userData._movePoints.map((point: { x: number, y: number }) => ([point.x - px, point.y - py]))
      this.busbar.setPoints(points)
      this.editor.tree.render()
    }
  }
  onKeydown = (event: KeyEvent) => {
    const { code } = event.origin as KeyboardEvent
    switch (code) {
      case 'Escape':
        if (this.busbar) {
          this.editor.tree.remove(this.busbar)
          this.busbar = null
          this.editor.tree.render()
        } else {
          this.editor.tool.setActiveTool('operationGraph')
        }
        break;
      default:
        break;
    }
  }

  active() {
    this.editor.selector.hittable = false
    this.editor.guideline.visible = true
    this.editor.sky.render()
    this.editor.addEventListener(PointerEvent.TAP, this.onTap)
    this.editor.addEventListener(PointerEvent.MOVE, this.onMove)
    this.editor.addEventListener(KeyEvent.HOLD, this.onKeydown)
  }
  inactive() {
    if (this.busbar) {
      this.editor.tree.remove(this.busbar)
      this.busbar = null
    }
    this.editor.selector.hittable = true
    this.editor.guideline.visible = false
    this.editor.sky.render()
    this.editor.removeEventListener(PointerEvent.TAP, this.onTap)
    this.editor.removeEventListener(PointerEvent.MOVE, this.onMove)
    this.editor.removeEventListener(KeyEvent.HOLD, this.onKeydown)
  }

}

