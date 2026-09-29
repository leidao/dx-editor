import { EditorView } from '@/dxEditor'
import { IPointerEvent, Rect, Vector2 } from '@/dxCanvas'
import { DragEvent, EditorEvent, KeyEvent, PointerEvent } from '@/dxEditor/event'
import globalConfig from '@/dxEditor/config'
import { getClosestTimesVal } from '@/dxEditor/utils'
import ToolBase from './toolBase'

export default class ToolDrawRect extends ToolBase {
  readonly type = 'drawRect'
  private start = new Vector2()
  private rect: Rect | null = null

  private point(event: PointerEvent | DragEvent) {
    const { clientX, clientY } = event.origin as IPointerEvent
    const point = this.editor.tree.getWorldByClient(clientX, clientY)
    const step = globalConfig.moveSize
    return new Vector2(getClosestTimesVal(point.x, step), getClosestTimesVal(point.y, step))
  }

  onDown = (event: PointerEvent) => { this.start.copy(this.point(event)) }

  onDragStart = (event: DragEvent) => {
    this.rect = new Rect({
      name: '矩形', position: this.start.toArray(), width: 0, height: 0,
      style: { fillStyle: '#d9d9d9', strokeStyle: '#666', lineWidth: 1 }
    })
    this.editor.tree.add(this.rect)
    this.onDrag(event)
  }

  onDrag = (event: DragEvent) => {
    if (!this.rect) return
    const end = this.point(event)
    this.rect.setRect(end.x - this.start.x, end.y - this.start.y)
    this.editor.tree.render()
  }

  onDragEnd = (event: DragEvent) => {
    if (!this.rect) return
    this.onDrag(event)
    const rect = this.rect
    this.rect = null
    if (Math.abs(rect.width) < 1 || Math.abs(rect.height) < 1) {
      this.editor.tree.remove(rect)
    } else {
      if (rect.width < 0) { rect.position.x += rect.width; rect.width = -rect.width }
      if (rect.height < 0) { rect.position.y += rect.height; rect.height = -rect.height }
      rect.computeBoundsBox(true)
      this.editor.dispatchEvent(EditorEvent.ADD, new EditorEvent('add', { target: rect }))
    }
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
    if (this.rect) this.editor.tree.remove(this.rect)
    this.rect = null
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
