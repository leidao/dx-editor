/*
 * @Description: 绘制导线
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-10 09:47:43
 */
import { v4 } from 'uuid'
import { EditorView } from '@/editor/view'
import ToolBase from './toolBase'
import { Line, Image, Group, PointerEvent, Point, KeyEvent, LeafList, Ellipse } from 'leafer-ui'
import { getClosestTimesVal, toFixed, traverse } from '@/editor/utils'
import globalConfig from '@/editor/config'
import { IUI } from '@leafer-in/interface'
/** 绘制导线 */
export default class ToolDrawWire extends ToolBase {
  readonly keyboard = 'l'
  readonly type = 'drawWire'
  wire: Line | null = null
  /** 重新计算 */
  resetCalculation = true
  /** 上一个目标 */
  ellipse!: Ellipse
  private angle = 0
  constructor(view: EditorView) {
    super(view)
    this.ellipse = new Ellipse({
      width: 6,
      height: 6,
      offsetX: -3,
      offsetY: -3,
      fill: "rgb(255,5,5)",
      opacity: 0,
      data:{
        
      }
    })
    this.view.layer.add(this.ellipse)
    // console.log('this.app.sky',this.app.sky);
    
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
      this.app.tree.add(this.wire)
    } else {
      this.wire.data._points = this.wire.data._movePoints.slice()
      if(this.ellipse.opacity){
        this.wire = null
        /** 触发撤销回退栈栈的收集 */
        this.app.tree.emit('add')
      }
    }
  }
  move = (event: PointerEvent) => {
    const pagePoint = this.app.getPagePoint({ x: event.x, y: event.y })
    let x = getClosestTimesVal(pagePoint.x, globalConfig.moveSize)
    let y = getClosestTimesVal(pagePoint.y, globalConfig.moveSize)

    this.calculatedAdsorptionEffect({ x, y })

    if (this.wire) {
      const lastPoint = this.wire.data._points[this.wire.data._points.length - 1]
      // 计算当前鼠标位置和上一个点位的距离，判断是否进行导线方向计算还是重置之前计算
      const distance = new Point(x, y).getDistance(new Point(lastPoint.x, lastPoint.y))
      // 计算当前鼠标位置和上一个点位的角度，得出导线生成方向
      let angle = new Point(x, y).getAngle(new Point(lastPoint.x, lastPoint.y)) + + 180
      if (distance < globalConfig.gridSize || [90, 180, 270, 360].includes(angle)) {
        this.resetCalculation = true
      } else {
        if (this.resetCalculation) {
          this.resetCalculation = false
          this.angle = angle
        }
      }
      let moveX = lastPoint.x, moveY = lastPoint.y
      if (this.angle > 315 || this.angle < 45) {
        moveX = x
      } else if (this.angle > 45 && this.angle < 135) {
        moveY = y
      } else if (this.angle > 135 && this.angle < 225) {
        moveX = x
      } else if (this.angle > 225 && this.angle < 315) {
        moveY = y
      }
      // diffX > diffY 判断导线方向
      this.wire.data._movePoints = this.wire.data._points.concat({ x: moveX, y: moveY }, { x, y })
      // 根据_points点位减去x/y坐标得到points
      this.wire.points = this.wire.data._movePoints.map((point: { x: number, y: number }) => ([point.x - (this.wire?.x || 0), point.y - (this.wire?.y || 0)])).flat()

    }
  }

  onKeydown = (event: KeyEvent) => {
    const { code } = event
    switch (code) {
      case 'Enter':
        if (this.wire) {
          this.wire.points = this.wire.data._points.map((point: { x: number, y: number }) => ([point.x - (this.wire?.x || 0), point.y - (this.wire?.y || 0)])).flat()
          this.wire = null
          this.ellipse.opacity = 0
          /** 触发撤销回退栈栈的收集 */
          this.app.tree.emit('add')
        }
        break;
      case 'Escape':
        if (this.wire) {
          this.app.tree.remove(this.wire)
          this.wire = null
          this.ellipse.opacity = 0
        } else {
          this.inactive()
          this.view.manager.tools.setActiveTool('operationGraph')
        }
        break;
      default:
        break;
    }
  }
  calculatedAdsorptionEffect(point: { x: number, y: number }) {
    const moveWorldPoint = this.app.getWorldPointByPage(point)
    // const findList = this.app.tree.children.filter(item => item instanceof Group).map(item => item.children).flat().filter(item => item instanceof Ellipse)
    const leafList = new LeafList()
    traverse(this.app.tree, (item) => {
      if (!(item instanceof Image && item.data?.ellipseData)) {
        leafList.add(item)
      }
    })
    const { target } = this.app.tree.pick(moveWorldPoint, { exclude: leafList })!
    this.ellipse.opacity = 0
    if (target) {
      const ellipseData: { x: number, y: number }[] = target.data!.ellipseData
      const targetX = target.x || 0, targetY = target.y || 0
      for (let i = 0; i < ellipseData.length; i++) {
        const element = ellipseData[i];
        const pageX = element.x + targetX
        const pagey = element.y + targetY
        // 相等
        if (parseInt(`${point.x}`) === parseInt(`${pageX}`) && parseInt(`${point.y}`) === parseInt(`${pagey}`)) {
          this.ellipse.opacity = 1
          this.ellipse.x = pageX
          this.ellipse.y = pagey
          return
        }
      }
    }

  }

  active() {
    this.app.tree.hitChildren = false
    this.view.selector.hitChildren = false
    this.view.helpLine.visible = true
    this.app.on(PointerEvent.TAP, this.tap)
    this.app.on(PointerEvent.MOVE, this.move)
    this.app.on(KeyEvent.HOLD, this.onKeydown)
  }
  inactive() {
    if (this.wire) {
      this.app.tree.remove(this.wire)
      this.wire = null
      this.ellipse.opacity = 0
    }
    this.app.tree.hitChildren = true
    this.view.selector.hitChildren = true
    this.view.helpLine.visible = false
    this.app.off(PointerEvent.TAP, this.tap)
    this.app.off(PointerEvent.MOVE, this.move)
    this.app.off(KeyEvent.HOLD, this.onKeydown)
  }

}

