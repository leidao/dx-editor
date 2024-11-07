/*
 * @Description: 绘制母线
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-07 09:44:57
 */
import { EditorView } from '@/dxEditor'
import ToolBase from './toolBase'
import { getClosestTimesVal } from '@/dxEditor/utils'
import globalConfig from '@/dxEditor/config'
import { EditToolCreator } from '@/dxEditor/selector/editTool/EditToolCreator'
import { IObject, IPointerEvent, Line, Vector2 } from '@/dxCanvas'
import { EditorEvent, KeyEvent, PointerEvent } from '../event'
/** 绘制母线 */
export default class ToolPasteGraph extends ToolBase {
  readonly type = 'pasteGraph'
  busbar: Line | null = null
  pasteData?: IObject

  constructor(editor: EditorView) {
    super(editor)
  }
  onTap = () => {
    const position = this.editor.pasteData.position
    const children = this.editor.pasteData.children || 0
    this.editor.selector.select(...children)
    for (let index = children.length-1; index >= 0; index--) {
      const element = children[index];
      element.position.add(position)
      this.editor.tree.add(element)
      element.computeBoundsBox(true)
    }
    this.editor.tree.render()
    this.editor.dispatchEvent(EditorEvent.PASTE_CHANGE,new EditorEvent('paste'))
    this.editor.dispatchEvent(EditorEvent.ADD,new EditorEvent('add',{target:this.editor.selector.list}))
    this.editor.tool.setActiveTool('operationGraph')
  }
  onMove = (event: PointerEvent) => {
    const {clientX,clientY} = event.origin as IPointerEvent
    const pagePoint = this.editor.tree.getWorldByClient(clientX,clientY)
    const px = pagePoint.x - this.editor.pasteData.bounds.x 
    const py = pagePoint.y - this.editor.pasteData.bounds.y 
    let x = getClosestTimesVal(px, globalConfig.moveSize)
    let y = getClosestTimesVal(py, globalConfig.moveSize)
    this.editor.pasteData.position.set(x,y)
    this.editor.sky.render()
  }
  onKeydown = (event: KeyEvent) => {
    const { code } = event.origin as KeyboardEvent
    switch (code) {
      case 'Escape':
        if(this.editor.pastetype === 'shear') this.editor.tree.add(...this.editor.pasteData.children)
        this.editor.tool.setActiveTool('operationGraph')
        break;
      default:
        break;
    }
  }

  active() {
    this.editor.sky.add(this.editor.pasteData)
    this.editor.pasteData.computeBoundsBox()
    this.editor.selector.hittable = false
    this.editor.guideline.visible = true
    this.editor.sky.render()
    this.editor.addEventListener(PointerEvent.TAP, this.onTap)
    this.editor.addEventListener(PointerEvent.MOVE, this.onMove)
    this.editor.addEventListener(KeyEvent.HOLD, this.onKeydown)
  }
  inactive() {
    this.editor.pasteData.clear()
    this.editor.pasteData.position.set(0,0)
    this.editor.sky.remove(this.editor.pasteData)
    this.editor.selector.hittable = true
    this.editor.guideline.visible = false
    this.editor.sky.render()
    this.editor.removeEventListener(PointerEvent.TAP, this.onTap)
    this.editor.removeEventListener(PointerEvent.MOVE, this.onMove)
    this.editor.removeEventListener(KeyEvent.HOLD, this.onKeydown)
  }

}

