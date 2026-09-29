import { Ellipse, Line, OrbitEvent, Vector2 } from '@/dxCanvas'
import { DragEvent, EditorEvent, PointerEvent } from './event'
import type { EditorView } from './index'
import globalConfig from './config'
import { getClosestTimesVal } from './utils'

type Vertex = { line: Line; index: number }

/** Editable vertex handles for the selected wire or busbar. */
export default class LineVertexEditor {
  private handles: Ellipse[] = []
  private pending: Vertex | null = null
  private changed = false

  constructor(private editor: EditorView) {
    editor.addEventListener(EditorEvent.SELECT, this.refresh)
    editor.addEventListener(EditorEvent.HISTORY_CHANGE, this.refresh)
    editor.addEventListener(DragEvent.START, this.onDragStart)
    editor.addEventListener(DragEvent.DRAG, this.onDrag)
    editor.addEventListener(DragEvent.END, this.onDragEnd)
    editor.orbitControler.addEventListener(OrbitEvent.CHANGE, this.refresh)
  }

  get selectedLine(): Line | null {
    const { selector } = this.editor
    return selector.single && selector.element instanceof Line ? selector.element : null
  }

  /** Called before normal selection begins, so a vertex can be grabbed off the thin line. */
  capture(event: PointerEvent): boolean {
    this.pending = null
    this.changed = false
    const line = this.selectedLine
    if (!line) return false
    const origin = event.origin as globalThis.PointerEvent
    const click = this.editor.tree.getPageByClient(origin.clientX, origin.clientY)
    const points = line.getPoints()
    for (let index = points.length - 1; index >= 0; index--) {
      const world = new Vector2(...points[index]).applyMatrix3(line.worldMatrix)
      const page = this.editor.tree.getPageByWorld(world.x, world.y)
      if (page.distanceTo(click) <= 8) {
        this.pending = { line, index }
        return true
      }
    }
    return false
  }

  get capturing() { return !!this.pending }

  private setWorldPoint(line: Line, index: number, world: Vector2, commit = true) {
    const points = line.getPoints()
    if (index < 0 || index >= points.length) return
    const local = world.applyMatrix3(line.worldMatrix.clone().invert())
    if (points[index][0] === local.x && points[index][1] === local.y) return
    line.replacePoints(index, 1, local.toArray() as [number, number])
    if (index === 0 || index === points.length - 1) {
      const connections = line.userData.connections
      if (connections) delete connections[index === 0 ? 'start' : 'end']
    }
    this.updatePointCache(line)
    this.refresh()
    this.editor.render()
    if (commit) this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update', { target: line }))
  }

  private updatePointCache(line: Line) {
    line.userData._points = line.getPoints().map(([x, y]) => {
      const point = new Vector2(x, y).applyMatrix3(line.worldMatrix)
      return { x: point.x, y: point.y }
    })
    line.userData._movePoints = line.userData._points.slice()
  }

  changeCoordinate(index: number, axis: 'x' | 'y', value: number) {
    const line = this.selectedLine
    if (!line || !Number.isFinite(value)) return
    const point = line.getPoints()[index]
    if (!point) return
    const world = new Vector2(...point).applyMatrix3(line.worldMatrix)
    world[axis] = value
    this.setWorldPoint(line, index, world)
  }

  insertAfter(index: number) {
    const line = this.selectedLine
    const points = line?.getPoints()
    if (!line || !points || index < 0 || index >= points.length - 1) return
    const [a, b] = [points[index], points[index + 1]]
    line.replacePoints(index + 1, 0, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2])
    this.updatePointCache(line)
    this.refresh()
    this.editor.render()
    this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update', { target: line }))
  }

  remove(index: number) {
    const line = this.selectedLine
    const points = line?.getPoints()
    if (!line || !points || index <= 0 || index >= points.length - 1) return
    line.replacePoints(index, 1)
    this.updatePointCache(line)
    this.refresh()
    this.editor.render()
    this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update', { target: line }))
  }

  private onDragStart = (event: DragEvent) => this.onDrag(event)

  private onDrag = (event: DragEvent) => {
    if (!this.pending) return
    const origin = event.origin as globalThis.PointerEvent
    const world = this.editor.tree.getWorldByClient(origin.clientX, origin.clientY)
    world.x = getClosestTimesVal(world.x, globalConfig.moveSize)
    world.y = getClosestTimesVal(world.y, globalConfig.moveSize)
    this.setWorldPoint(this.pending.line, this.pending.index, world, false)
    this.changed = true
  }

  private onDragEnd = (event: DragEvent) => {
    if (!this.pending) return
    this.onDrag(event)
    const line = this.pending.line
    this.pending = null
    if (this.changed) this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update', { target: line }))
    this.changed = false
  }

  private refresh = () => {
    const line = this.selectedLine
    const points = line?.getPoints() || []
    while (this.handles.length > points.length) this.editor.sky.remove(this.handles.pop()!)
    while (this.handles.length < points.length) {
      const handle = new Ellipse({ style: { fillStyle: '#1687ff', strokeStyle: '#fff', lineWidth: 1 } })
      this.handles.push(handle)
      this.editor.sky.add(handle)
    }
    if (line) points.forEach((point, index) => {
      const handle = this.handles[index]
      handle.position.copy(new Vector2(...point).applyMatrix3(line.worldMatrix))
      handle.width = 10 / this.editor.camera.zoom
      handle.height = 10 / this.editor.camera.zoom
      handle.computeBoundsBox(true)
    })
    this.editor.sky.render()
  }

  destroy() {
    this.editor.removeEventListener(EditorEvent.SELECT, this.refresh)
    this.editor.removeEventListener(EditorEvent.HISTORY_CHANGE, this.refresh)
    this.editor.removeEventListener(DragEvent.START, this.onDragStart)
    this.editor.removeEventListener(DragEvent.DRAG, this.onDrag)
    this.editor.removeEventListener(DragEvent.END, this.onDragEnd)
    this.editor.orbitControler.removeEventListener(OrbitEvent.CHANGE, this.refresh)
    for (const handle of this.handles) this.editor.sky.remove(handle)
    this.handles = []
  }
}
