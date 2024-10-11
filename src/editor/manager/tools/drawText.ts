/*
 * @Description: 绘制线段
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-11 17:58:26
 */
import { v4 } from 'uuid'
import { EditorView } from '@/editor/editor'
import ToolBase from './toolBase'
import globalConfig from '@/editor/config'
import { App, PointerEvent, Text, InnerEditorEvent } from 'leafer-editor'
import { getClosestTimesVal } from '@/editor/utils'
export default class ToolDrawText extends ToolBase {
  readonly keyboard = 't'
  readonly type = 'drawText'
  text: Text | null = null


  constructor(editor: EditorView) {
    super(editor)
  }

  onTap = (event: PointerEvent) => {
    const pagePoint = this.app.getPagePoint({ x: event.x, y: event.y })
    let x = getClosestTimesVal(pagePoint.x, globalConfig.moveSize)
    let y = getClosestTimesVal(pagePoint.y, globalConfig.moveSize)

    if (!this.text) {
      this.text = new Text({
        x,
        y: y - 9,
        text: '',
        id: v4(),
        name: '文字',
        editable: true,
        data: {
          sourceColor: '#000000',
          hoverColor: '#ff0000',
          selectColor: '#ff0000',
        }
      })
      this.app.tree.add(this.text)
      // 打开内部编辑
      this.editor.helpLine.visible = false
      this.editor.selector.openInnerEditor(this.text)

    }
    this.app.off(PointerEvent.TAP, this.onTap);
  }


  innerEditorClose = () => {
    this.editor.app.emit('update')
    // 设置toolbar为默认并且关闭监听鼠标点击事件
    this.editor.manager.tools.setActiveTool('operationGraph')
    this.inactive()
  }

  active() {
    this.inactive()
    this.editor.helpLine.visible = true
    this.app.on(PointerEvent.TAP, this.onTap);
    this.app.on('closeInnerEditor', this.innerEditorClose)
  }
  inactive() {
    this.text = null
    this.editor.helpLine.visible = false
    this.app.off(PointerEvent.TAP, this.onTap);
    this.app.off('closeInnerEditor', this.innerEditorClose)
    this.editor.selector.closeInnerEditor()
  }
}

