/*
 * @Description: 绘制按钮
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-24 09:34:57
 */
import { EditorView } from '@/dxEditor'
import ToolBase from './toolBase'
import globalConfig from '@/dxEditor/config'
import { PointerEvent, Box, KeyEvent } from 'leafer-ui'
import { getClosestTimesVal } from '@/dxEditor/utils'
import { v4 } from 'uuid'
export default class ToolDrawBtn extends ToolBase {
  readonly keyboard = 'b'
  readonly type = 'drawBtn'
  btn: Box | null = null


  constructor(editor: EditorView) {
    super(editor)
  }

  onTap = (event: PointerEvent) => {
    const pagePoint = this.app.getPagePoint({ x: event.x, y: event.y })
    let x = getClosestTimesVal(pagePoint.x, globalConfig.moveSize)
    let y = getClosestTimesVal(pagePoint.y, globalConfig.moveSize)
    this.btn = new Box({
      x: x,
      y: y,
      fill: '#32cd79',
      cornerRadius: 5,
      name: '按钮',
      // origin: 'center', // 从中心缩放
      hitChildren:false,
      editable: true,
      id:v4(),
      children: [{
        tag: 'Text',
        text: 'Text',
        fontSize: 16,
        fontWeight: 'bold',
        padding: [3, 13],
        fill: '#000',
        textAlign: 'center',
        verticalAlign: 'middle',
        hitChildren:false,
        editable: false,
      }],
      data: {
        sourceColor: '#32cd79',
        hoverColor: '#ff0000',
        selectColor: '#ff0000',
      }
    })
    this.app.tree.add(this.btn)
  }

  onKeydown = (event: KeyEvent) => {
    const { code } = event
    switch (code) {
      case 'Escape':
        this.editor.tool.setActiveTool('operationGraph')
        break;
      default:
        break;
    }
  }

  active() {
    this.editor.guideline.visible = true
    this.app.tree.hitChildren = false
    this.editor.selector.hitChildren = false
    this.app.on(PointerEvent.TAP, this.onTap);
    this.app.on(KeyEvent.HOLD, this.onKeydown)
  }
  inactive() {
    this.editor.guideline.visible = false
    this.app.tree.hitChildren = true
    this.editor.selector.hitChildren = true
    this.app.off(PointerEvent.TAP, this.onTap);
    this.app.off(KeyEvent.HOLD, this.onKeydown)
  }
}

