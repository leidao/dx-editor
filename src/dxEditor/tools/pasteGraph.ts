/*
 * @Description: 放置剪贴板图形
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-07 09:44:57
 */
import { EditorView } from '@/dxEditor'
import ToolBase from './toolBase'
import { getClosestTimesVal } from '@/dxEditor/utils'
import globalConfig from '@/dxEditor/config'
import { IPointerEvent, Vector2 } from '@/dxCanvas'
import { EditorEvent, KeyEvent, PointerEvent } from '../event'
import { remapWireConnections } from '../wireConnections'
/** 放置剪贴板图形 */
export default class ToolPasteGraph extends ToolBase {
  readonly type = 'pasteGraph'
  previewOrigin = new Vector2()

  constructor(editor: EditorView) {
    super(editor)
  }
  onTap = () => {
    const { position, children } = this.editor.pasteData
    if (children.length === 0) return
    const placed = children.map(child => {
      const element = child.clone()
      element.position.add(position)
      this.editor.tree.add(element)
      return element
    })
    remapWireConnections(children, placed)
    this.editor.selector.select(...placed)
    this.editor.tree.render()
    this.editor.dispatchEvent(EditorEvent.PASTE_CHANGE,new EditorEvent('paste'))
    this.editor.dispatchEvent(EditorEvent.ADD,new EditorEvent('add',{target: placed}))
    this.editor.tool.setActiveTool('operationGraph')
  }
  onMove = (event: PointerEvent) => {
    const {clientX,clientY} = event.origin as IPointerEvent
    const pagePoint = this.editor.tree.getWorldByClient(clientX,clientY)
    const px = pagePoint.x - this.previewOrigin.x
    const py = pagePoint.y - this.previewOrigin.y
    let x = getClosestTimesVal(px, globalConfig.moveSize)
    let y = getClosestTimesVal(py, globalConfig.moveSize)
    this.editor.pasteData.position.set(x,y)
    this.editor.pasteData.computeBoundsBox(true)
    this.editor.sky.render()
  }
  onKeydown = (event: KeyEvent) => {
    const { code } = event.origin as KeyboardEvent
    switch (code) {
      case 'Escape':
        this.editor.tool.setActiveTool('operationGraph')
        break;
      default:
        break;
    }
  }

  active() {
    this.editor.sky.add(this.editor.pasteData)
    this.editor.pasteData.computeBoundsBox(true)
    this.previewOrigin.set(this.editor.pasteData.bounds.x, this.editor.pasteData.bounds.y)
    this.editor.selector.hittable = false
    this.editor.guideline.visible = true
    this.editor.sky.render()
    this.editor.addEventListener(PointerEvent.TAP, this.onTap)
    this.editor.addEventListener(PointerEvent.MOVE, this.onMove)
    this.editor.addEventListener(KeyEvent.HOLD, this.onKeydown)
  }
  inactive() {
    this.editor.sky.remove(this.editor.pasteData)
    this.editor.pasteData.position.set(0,0)
    this.editor.pasteData.computeBoundsBox(true)
    this.editor.selector.hittable = true
    this.editor.guideline.visible = false
    this.editor.sky.render()
    this.editor.removeEventListener(PointerEvent.TAP, this.onTap)
    this.editor.removeEventListener(PointerEvent.MOVE, this.onMove)
    this.editor.removeEventListener(KeyEvent.HOLD, this.onKeydown)
  }

}
