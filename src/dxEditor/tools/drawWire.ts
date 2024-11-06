/*
 * @Description: 绘制导线
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-05 17:44:58
 */
import { EditorView } from '@/dxEditor'
import ToolBase from './toolBase'
import { getClosestTimesVal } from '@/dxEditor/utils'
import globalConfig from '@/dxEditor/config'
import { Ellipse, IPointerEvent, Line, radToDeg, Vector2 } from '@/dxCanvas'
import { EditorEvent, KeyEvent, PointerEvent } from '../event'
import { LeafList } from '../selector/leafList'
/** 绘制导线 */
export default class ToolDrawWire extends ToolBase {
  readonly type = 'drawWire'
  wire: Line | null = null
  /** 重新计算 */
  resetCalculation = true
  leafList = new LeafList()
  ellipse = new Ellipse({
    width: 6,
    height: 6,
    style: {
      fillStyle: "rgb(255,5,5)",
      globalAlpha: 0
    },
    hoverStyle: {
      globalAlpha: 1
    },
  })
  private angle = 0
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
    if (!this.wire) {
      this.wire = new Line({
        position: [x, y],
        name: '导线',
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
      this.editor.tree.add(this.wire)
    } else {
      this.wire.userData._points = this.wire.userData._movePoints.slice()
      if (this.ellipse.state === 'hoverEnter') {
        this.wire = null
        /** 触发撤销回退栈栈的收集 */
        this.editor.dispatchEvent(EditorEvent.ADD,new EditorEvent('add'))
      }
    }
  }
  onMove = (event: PointerEvent) => {
    const { clientX, clientY } = event.origin as IPointerEvent
    const worldPoint = this.editor.tree.getWorldByClient(clientX, clientY)
    let x = getClosestTimesVal(worldPoint.x, globalConfig.moveSize)
    let y = getClosestTimesVal(worldPoint.y, globalConfig.moveSize)

    this.calculatedAdsorptionEffect(new Vector2(x, y))

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
      const { x: px, y: py } = this.wire.position
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
          const { x: px, y: py } = this.wire.position
          const points = this.wire.userData._points.map((point: { x: number, y: number }) => ([point.x - px, point.y - py]))
          this.wire.setPoints(points)
          this.wire = null
          this.editor.tree.render()
          /** 触发撤销回退栈栈的收集 */
          this.editor.dispatchEvent(EditorEvent.ADD, new EditorEvent('add'))
        }
        break;
      case 'Escape':
        if (this.wire) {
          this.editor.tree.remove(this.wire)
          this.wire = null
          this.editor.tree.render()
        } else {
          this.editor.tool.setActiveTool('operationGraph')
        }
        break;
      default:
        break;
    }
  }
  calculatedAdsorptionEffect(point: Vector2) {
    this.leafList.reset()
    this.editor.tree.traverse((item) => {
      if ((item.tag === 'Img' && item.userData.ellipseData && item.bounds.hitPoint(point))) {
        this.leafList.add(item)
      }
    })
    this.ellipse.state = 'none'
    const list = this.leafList.list
    for (let index = 0; index < list.length; index++) {
      const target = list[index];
      const ellipseData: { x: number, y: number }[] = target.userData.ellipseData
      for (let i = 0; i < ellipseData.length; i++) {
        const element = ellipseData[i];
        const ellipseWorldPoint = new Vector2(element.x, element.y).applyMatrix3(target.worldMatrix)
        // 相等
        if (Math.abs(ellipseWorldPoint.x - point.x) < 1 && Math.abs(ellipseWorldPoint.y - point.y) < 1) {
          this.ellipse.state = 'hoverEnter'
          this.ellipse.position.copy(ellipseWorldPoint)
          this.ellipse.computeBoundsBox(true)

          return
        }
      }
    }
    this.editor.sky.render()

  }

  active() {
    this.editor.selector.hittable = false
    this.editor.guideline.visible = true
    this.editor.sky.add(this.ellipse)
    this.editor.sky.render()
    this.editor.addEventListener(PointerEvent.TAP, this.onTap)
    this.editor.addEventListener(PointerEvent.MOVE, this.onMove)
    this.editor.addEventListener(KeyEvent.HOLD, this.onKeydown)
  }
  inactive() {
    if (this.wire) {
      this.editor.tree.remove(this.wire)
      this.wire = null
    }
    this.ellipse.state = 'none'
    this.editor.sky.remove(this.ellipse)
    this.editor.selector.hittable = true
    this.editor.guideline.visible = false
    this.editor.sky.render()
    this.editor.removeEventListener(PointerEvent.TAP, this.onTap)
    this.editor.removeEventListener(PointerEvent.MOVE, this.onMove)
    this.editor.removeEventListener(KeyEvent.HOLD, this.onKeydown)
  }

}

