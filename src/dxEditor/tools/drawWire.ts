/*
 * @Description: 绘制导线
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-30 17:57:45
 */
import { EditorView } from '@/dxEditor'
import ToolBase from './toolBase'
import { getClosestTimesVal } from '@/dxEditor/utils'
import globalConfig from '@/dxEditor/config'
import { IPointerEvent, Line, radToDeg, Vector2 } from '@/dxCanvas'
import { EditorEvent, KeyEvent, PointerEvent } from '../event'
import { LeafList } from '../selector/leafList'
/** 绘制导线 */
export default class ToolDrawWire extends ToolBase {
  readonly keyboard = 'l'
  readonly type = 'drawWire'
  wire: Line | null = null
  /** 重新计算 */
  resetCalculation = true
  /** 上一个目标 */
  ellipse!: any
  private angle = 0
  constructor(editor: EditorView) {
    super(editor)
    // this.ellipse = new Ellipse({
    //   width: 6,
    //   height: 6,
    //   offsetX: -3,
    //   offsetY: -3,
    //   fill: "rgb(255,5,5)",
    //   opacity: 0,
    //   userData: {

    //   }
    // })
    // this.editor.sky.add(this.ellipse)
    // console.log('this.app.sky',this.app.sky);

  }
  onTap = (event: PointerEvent) => {
    // 获取world坐标
    const { clientX, clientY } = event.origin as IPointerEvent
    const pagePoint = this.editor.tree.getWorldByClient(clientX, clientY)
    // 获取网格的倍数坐标
    let x = getClosestTimesVal(pagePoint.x, globalConfig.moveSize)
    let y = getClosestTimesVal(pagePoint.y, globalConfig.moveSize)
    if (!this.wire) {
      this.wire = new Line({
        position: [x, y],
        name: '导线',
        points: [[0, 0]],
        style: {
          lineWidth: 2,
          lineCap:'round',
          lineJoin:'round',
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
      this.editor.tree.add(this.wire)
    } else {
      this.wire.userData._points = this.wire.userData._movePoints.slice()
      // if (this.ellipse.opacity) {
      //   this.wire = null
      //   /** 触发撤销回退栈栈的收集 */
      //   this.editor.dispatchEvent(EditorEvent.ADD,new EditorEvent('add'))
      // }
    }
  }
  onMove = (event: PointerEvent) => {
    const { clientX, clientY } = event.origin as IPointerEvent
    const pagePoint = this.editor.tree.getWorldByClient(clientX, clientY)
    let x = getClosestTimesVal(pagePoint.x, globalConfig.moveSize)
    let y = getClosestTimesVal(pagePoint.y, globalConfig.moveSize)

    // this.calculatedAdsorptionEffect({ x, y })

    if (this.wire) {
      const lastPoint = this.wire.userData._points[this.wire.userData._points.length - 1]
      // 计算当前鼠标位置和上一个点位的距离，判断是否进行导线方向计算还是重置之前计算
      const distance = new Vector2(x, y).distanceTo(new Vector2(lastPoint.x, lastPoint.y))
      // 计算当前鼠标位置和上一个点位的角度，得出导线生成方向
      let angle = radToDeg(new Vector2(x, y).sub(new Vector2(lastPoint.x, lastPoint.y)).angle())
      if (distance < globalConfig.gridSize || [90, 180, 270, 360].includes(angle)) {
        this.resetCalculation = true
      } else {
        if (this.resetCalculation) {
          this.resetCalculation = false
          this.angle = angle
        }
      }
      let moveX = lastPoint.x, moveY = lastPoint.y
      if (this.angle >= 315 || this.angle < 45) {
        moveX = x
      } else if (this.angle >= 45 && this.angle < 135) {
        moveY = y
      } else if (this.angle >= 135 && this.angle < 225) {
        moveX = x
      } else if (this.angle >= 225 && this.angle < 315) {
        moveY = y
      }
      // diffX > diffY 判断导线方向
      this.wire.userData._movePoints = this.wire.userData._points.concat({ x: moveX, y: moveY }, { x, y })
      // 根据_points点位减去x/y坐标得到points
      const {x:px,y:py} = this.wire.position
      const points = this.wire.userData._movePoints.map((point: { x: number, y: number }) => ([point.x - px, point.y - py]))
      this.wire.setPoints(points)
      this.editor.tree.render()
    }
  }

  onKeydown = (event: KeyEvent) => {
    const { code } = event.origin as KeyboardEvent
    switch (code) {
      case 'Enter':
        if (this.wire) {
          const {x:px,y:py} = this.wire.position
          const points = this.wire.userData._points.map((point: { x: number, y: number }) => ([point.x -px, point.y - py]))
          this.wire.setPoints(points)
          this.wire = null
          // this.ellipse.style.globalAlpha = 0
          this.editor.tree.render()
          /** 触发撤销回退栈栈的收集 */
          this.editor.dispatchEvent(EditorEvent.ADD,new EditorEvent('add'))
        }
        break;
      case 'Escape':
        if (this.wire) {
          this.editor.tree.remove(this.wire)
          this.wire = null
          // this.ellipse.style.globalAlpha = 0
          this.editor.tree.render()
        } else {
          this.editor.tool.setActiveTool('operationGraph')
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
    this.editor.tree.traverse((item) => {
      if (!(item instanceof Image && item.userData?.ellipseData)) {
        leafList.add(item)
      }
    })

    const { target } = this.app.tree.pick(moveWorldPoint, { exclude: leafList })!
    this.ellipse.opacity = 0
    if (target) {
      const ellipseData: { x: number, y: number }[] = target.userData!.ellipseData
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
    this.editor.selector.hittable = false
    this.editor.guideline.visible = true
    this.editor.addEventListener(PointerEvent.TAP, this.onTap)
    this.editor.addEventListener(PointerEvent.MOVE, this.onMove)
    this.editor.addEventListener(KeyEvent.HOLD, this.onKeydown)
  }
  inactive() {
    if (this.wire) {
      this.editor.tree.remove(this.wire)
      this.wire = null
      this.ellipse.opacity = 0
    }
    this.editor.selector.hittable = true
    this.editor.guideline.visible = false
    this.editor.removeEventListener(PointerEvent.TAP, this.onTap)
    this.editor.removeEventListener(PointerEvent.MOVE, this.onMove)
    this.editor.removeEventListener(KeyEvent.HOLD, this.onKeydown)
  }

}

