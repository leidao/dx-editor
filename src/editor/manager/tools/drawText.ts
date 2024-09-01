/*
 * @Description: 绘制线段
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-08-30 10:27:23
 */
import { v4 } from 'uuid'
import { EditorView } from '@/editor/view'
import ToolBase from './toolBase'
import { App, PointerEvent, Text, InnerEditorEvent } from 'leafer-editor'
export default class ToolDrawText extends ToolBase {
  readonly keyboard = 't'
  readonly type = 'drawText'
  text: Text | null = null


  constructor(view: EditorView) {
    super(view)
  }

  start = (e: PointerEvent) => {
    const { x, y } = this.app.getPagePoint({ x: e.x, y: e.y })
    if (!this.text) {
      this.text = new Text({
        x,
        y,
        text: '',
        name: '文字',
        editable: true,
        id: v4()
      })
      this.app.tree.add(this.text)
      // 打开内部编辑
      this.app.editor.openInnerEditor(this.text)
    }

    this.app.off(PointerEvent.CLICK, this.start);
  }

  innerEditorClose = () => {
    // 内部编辑器关闭时
    this.app.editor.visible = true
    // 设置toolbar为默认并且关闭监听鼠标点击事件
    this.view.manager.tools.setSelectedName('operationGraph')
    this.view.manager.tools.setActiveTool('operationGraph')
    this.app.editor.off(InnerEditorEvent.CLOSE, this.innerEditorClose)
  }

  active() {
    this.text = null
    this.app.tree.hitChildren = true
    this.app.on(PointerEvent.CLICK, this.start);
    this.app.editor.on(InnerEditorEvent.CLOSE, this.innerEditorClose)
  }
  inactive() {
    this.app.off(PointerEvent.CLICK, this.start);
    // 内部编辑器关闭时
    this.app.editor.visible = true
    this.app.editor.off(InnerEditorEvent.CLOSE, this.innerEditorClose)
    this.app.editor.closeInnerEditor()
  }

}

