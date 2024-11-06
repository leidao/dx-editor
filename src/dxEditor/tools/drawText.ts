/*
 * @Description: 绘制线段
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-06 15:07:03
 */
import { v4 } from 'uuid'
import { EditorView } from '@/dxEditor'
import ToolBase from './toolBase'
import globalConfig from '@/dxEditor/config'
import { Text, Vector2 } from '@/dxCanvas'
import { getClosestTimesVal } from '@/dxEditor/utils'
import { EditorEvent, PointerEvent } from '@/dxEditor/event'
import { IPointerEvent } from '@/dxCanvas/event'
export default class ToolDrawText extends ToolBase {
  readonly type = 'drawText'


  constructor(editor: EditorView) {
    super(editor)
  }

  onTap = (event: PointerEvent) => {
    const { clientX, clientY } = event.origin as IPointerEvent
    const worldPoint = this.editor.tree.getWorldByClient(clientX, clientY)
    let x = getClosestTimesVal(worldPoint.x, globalConfig.moveSize)
    let y = getClosestTimesVal(worldPoint.y, globalConfig.moveSize)
    const text = new Text({
      position: [x, y-1],
      text: '',
      style: {
        fontSize: 12,
        fillStyle: '#000',
        textAlign: 'left',
        textBaseline: 'top'
      },
      hoverStyle: {
        fillStyle: '#ff0000',
      },
      selectStyle: {
        fillStyle: '#ff0000',
      },
    })
    this.editor.tree.add(text)
    // 打开内部编辑
    this.editor.guideline.visible = false
    this.editor.selector.openInnerEditor(text)

    this.editor.removeEventListener(PointerEvent.TAP, this.onTap);
  }


  onCloseInnerEditor = () => {
    this.editor.tree.render()
    this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('add'))
    // 设置toolbar为默认并且关闭监听鼠标点击事件
    this.editor.tool.setActiveTool('operationGraph')
  }

  active() {
    this.editor.guideline.visible = true
    this.editor.selector.hittable = false
    this.editor.sky.render()
    this.editor.addEventListener(PointerEvent.TAP, this.onTap);
    this.editor.addEventListener(EditorEvent.CLOSEINNEREDIT, this.onCloseInnerEditor)
  }
  inactive() {
    this.editor.guideline.visible = false
    this.editor.selector.hittable = true
    this.editor.sky.render()
    this.editor.removeEventListener(PointerEvent.TAP, this.onTap);
    this.editor.removeEventListener(EditorEvent.CLOSEINNEREDIT, this.onCloseInnerEditor)
    this.editor.selector.editing && this.editor.selector.closeInnerEditor()
  }
}

