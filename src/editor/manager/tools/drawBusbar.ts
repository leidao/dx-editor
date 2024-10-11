/*
 * @Description: 绘制母线
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-11 16:28:12
 */
import { v4 } from 'uuid'
import { EditorView } from '@/editor/editor'
import ToolBase from './toolBase'
import { Line, Image, Group, PointerEvent, Point, KeyEvent, LeafList, Ellipse } from 'leafer-ui'
import { getClosestTimesVal, toFixed, traverse } from '@/editor/utils'
import globalConfig from '@/editor/config'
import { IUI } from '@leafer-in/interface'
/** 绘制母线 */
export default class ToolDrawBusbar extends ToolBase {
  readonly keyboard = 'b'
  readonly type = 'drawBusbar'
  busbar: Line | null = null

  constructor(editor: EditorView) {
    super(editor)
  }
  tap = (event: PointerEvent) => {
    // 获取page坐标
    const pagePoint = this.app.getPagePoint({ x: event.x, y: event.y })
    // 获取网格的倍数坐标
    let x = getClosestTimesVal(pagePoint.x, globalConfig.moveSize)
    let y = getClosestTimesVal(pagePoint.y, globalConfig.moveSize)
    if (!this.busbar) {
      this.busbar = new Line({
        x,
        y,
        id: v4(),
        name: '母线',
        points: [0, 0],
        editable: true,
        cornerRadius: 0.5,
        strokeWidth: 2,
        strokeCap: 'round',
        stroke: '#008800',
        data: {
          // 记录真实page点位坐标
          _points: [{ x, y }],
          _movePoints: [],
          sourceColor: '#008800',
          hoverColor: '#ff0000',
          selectColor: '#ff0000',
        },
        // strokeWidthFixed:true,
      })
      this.app.tree.add(this.busbar)
    } else {
      this.busbar.data._points = this.busbar.data._movePoints.slice()
      this.busbar = null
      this.app.tree.emit('add')
    }
  }
  move = (event: PointerEvent) => {
    if (this.busbar) {
      const pagePoint = this.app.getPagePoint({ x: event.x, y: event.y })
      let x = getClosestTimesVal(pagePoint.x, globalConfig.moveSize)
      let y = getClosestTimesVal(pagePoint.y, globalConfig.moveSize)
      // diffX > diffY 判断导线方向
      this.busbar.data._movePoints = this.busbar.data._points.concat({ x, y })
      // 根据_points点位减去x/y坐标得到points
      this.busbar.points = this.busbar.data._movePoints.map((point: { x: number, y: number }) => ([point.x - (this.busbar?.x || 0), point.y - (this.busbar?.y || 0)])).flat()
    }
  }
  onKeydown = (event: KeyEvent) => {
    const { code } = event
    switch (code) {
      case 'Escape':
        if (this.busbar) {
          this.app.tree.remove(this.busbar)
          this.busbar = null
        } else {
          this.inactive()
          this.editor.manager.tools.setActiveTool('operationGraph')
        }
        break;
      default:
        break;
    }
  }
 
  active() {
    this.app.tree.hitChildren = false
    this.editor.selector.hitChildren = false
    this.editor.helpLine.visible = true
    this.app.on(PointerEvent.TAP, this.tap)
    this.app.on(PointerEvent.MOVE, this.move)
    this.app.on(KeyEvent.HOLD, this.onKeydown)
  }
  inactive() {
    if (this.busbar) {
      this.app.tree.remove(this.busbar)
      this.busbar = null
    }
    this.app.tree.hitChildren = true
    this.editor.selector.hitChildren = true
    this.editor.helpLine.visible = false
    this.app.off(PointerEvent.TAP, this.tap)
    this.app.off(PointerEvent.MOVE, this.move)
    this.app.off(KeyEvent.HOLD, this.onKeydown)
  }

}

