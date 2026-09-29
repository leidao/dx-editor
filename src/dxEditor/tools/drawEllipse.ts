import { Ellipse, IPointerEvent, Vector2 } from '@/dxCanvas'
import { DragEvent, EditorEvent, KeyEvent, PointerEvent } from '@/dxEditor/event'
import type { EditorView } from '@/dxEditor'
import globalConfig from '@/dxEditor/config'
import { getClosestTimesVal } from '@/dxEditor/utils'
import ToolBase from './toolBase'

export default class ToolDrawEllipse extends ToolBase {
  readonly type: string
  private start = new Vector2()
  private ellipse: Ellipse | null = null

  constructor(editor: EditorView, private circle = false) {
    super(editor)
    this.type = circle ? 'drawCircle' : 'drawEllipse'
  }

  private point(event: PointerEvent | DragEvent) {
    const { clientX, clientY } = event.origin as IPointerEvent
    const point = this.editor.tree.getWorldByClient(clientX, clientY)
    const step = globalConfig.moveSize
    return new Vector2(getClosestTimesVal(point.x, step), getClosestTimesVal(point.y, step))
  }

  onDown = (event: PointerEvent) => { this.start.copy(this.point(event)) }

  onDragStart = (event: DragEvent) => {
    this.ellipse = new Ellipse({
      name: this.circle ? '圆' : '椭圆', position: this.start.toArray(), width: 0, height: 0,
      style: { fillStyle: '#d9d9d9', strokeStyle: '#666', lineWidth: 1 }
    })
    this.editor.tree.add(this.ellipse)
    this.onDrag(event)
  }

  onDrag = (event: DragEvent) => {
    if (!this.ellipse) return
    const end = this.point(event)
    let width = Math.abs(end.x - this.start.x)
    let height = Math.abs(end.y - this.start.y)
    if (this.circle) width = height = Math.min(width, height)
    this.ellipse.position.set(this.start.x + Math.sign(end.x - this.start.x) * width / 2,
      this.start.y + Math.sign(end.y - this.start.y) * height / 2)
    this.ellipse.width = width
    this.ellipse.height = height
    this.ellipse.computeBoundsBox(true)
    this.editor.tree.render()
  }

  onDragEnd = (event: DragEvent) => {
    if (!this.ellipse) return
    this.onDrag(event)
    const ellipse = this.ellipse
    this.ellipse = null
    if (ellipse.width < 1 || ellipse.height < 1) this.editor.tree.remove(ellipse)
    else this.editor.dispatchEvent(EditorEvent.ADD, new EditorEvent('add', { target: ellipse }))
    this.editor.tree.render()
    this.editor.tool.setActiveTool('operationGraph')
  }

  onKeydown = (event: KeyEvent) => {
    if ((event.origin as KeyboardEvent).code === 'Escape') this.editor.tool.setActiveTool('operationGraph')
  }

  active() {
    this.editor.selector.hittable = false
    this.editor.guideline.visible = true
    this.editor.addEventListener(PointerEvent.DOWN, this.onDown)
    this.editor.addEventListener(DragEvent.START, this.onDragStart)
    this.editor.addEventListener(DragEvent.DRAG, this.onDrag)
    this.editor.addEventListener(DragEvent.END, this.onDragEnd)
    this.editor.addEventListener(KeyEvent.HOLD, this.onKeydown)
  }

  inactive() {
    if (this.ellipse) this.editor.tree.remove(this.ellipse)
    this.ellipse = null
    this.editor.selector.hittable = true
    this.editor.guideline.visible = false
    this.editor.sky.render()
    this.editor.tree.render()
    this.editor.removeEventListener(PointerEvent.DOWN, this.onDown)
    this.editor.removeEventListener(DragEvent.START, this.onDragStart)
    this.editor.removeEventListener(DragEvent.DRAG, this.onDrag)
    this.editor.removeEventListener(DragEvent.END, this.onDragEnd)
    this.editor.removeEventListener(KeyEvent.HOLD, this.onKeydown)
  }
}
