/*
 * @Description: 绘制导线
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-30 15:36:19
 */
import { v4 } from 'uuid'
import { EditorView } from '@/editor/view'
import ToolBase from './toolBase'
import { Bounds, DragEvent, LeafList, Line, Image, Ellipse, Group, PointerEvent } from 'leafer-editor'
import { getClosestTimesVal } from '@/editor/utils'
import globalConfig from '@/editor/config'
/** 绘制导线 */
export default class ToolDrawWire extends ToolBase {
  readonly keyboard = 'l'
  readonly type = 'drawWire'
  wire!: Line
  constructor(view: EditorView) {
    super(view)
  }
  tap = (event: PointerEvent) => {
    // 获取page坐标
    const pagePoint = this.app.getPagePoint({ x: event.x, y: event.y })
    // 获取网格的倍数坐标
    let x = getClosestTimesVal(pagePoint.x, globalConfig.moveSize)
    let y = getClosestTimesVal(pagePoint.y, globalConfig.moveSize)
    if (!this.wire) {
      this.wire = new Line({
        x,
        y,
        id: v4(),
        name: '导线',
        points: [0, 0],
        editable: true,
        cornerRadius: 1,
        strokeWidth: 2,
        strokeCap: 'round',
        stroke: '#008800',
        data: {
          // 记录真实page点位坐标
          _points: [{ x, y }],
          _movePoints: []
        }
        // strokeWidthFixed:true,
      })
      this.app.tree.add(this.wire)
    } else {
      this.wire.data._points = this.wire.data._movePoints.slice()
    }
  }
  move = (event: PointerEvent) => {
    if (this.wire) {
      console.log('====');
      const pagePoint = this.app.getPagePoint({ x: event.x, y: event.y })
      let x = getClosestTimesVal(pagePoint.x, globalConfig.moveSize)
      let y = getClosestTimesVal(pagePoint.y, globalConfig.moveSize)
      const lastPoint = this.wire.data._points[this.wire.data._points.length - 1]
      // 计算当前鼠标位置和上一个点位的差值，比较x和y的大小得出导线生成方向
      const [diffX, diffY] = [Math.abs(x - lastPoint.x), Math.abs(y - lastPoint.y)]
      // diffX > diffY 判断导线方向
      this.wire.data._movePoints = this.wire.data._points.concat(diffX > diffY ? { x, y: lastPoint.y } : { x: lastPoint.x, y }, { x, y })
      // 根据_points点位减去x/y坐标得到points
      this.wire.points = this.wire.data._movePoints.map((point: { x: number, y: number }) => ([point.x - (this.wire.x || 0), point.y - (this.wire.y || 0)])).flat()

    }
  }

  end = () => {
    /** 触发撤销回退栈栈的收集 */
    this.app.tree.emit('add')
  }
  active() {
    this.app.editor.visible = false
    this.app.tree.hitChildren = false
    this.view.helpLine.visible = true
    this.app.on(PointerEvent.TAP, this.tap)
    this.app.on(PointerEvent.MOVE, this.move)
  }
  inactive() {
    this.app.editor.visible = true
    this.app.tree.hitChildren = true
    this.view.helpLine.visible = false
    this.app.off(PointerEvent.TAP, this.tap)
    this.app.off(PointerEvent.MOVE, this.move)

  }

}

