/*
 * @Description: 绘制按钮
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-05 13:45:13
 */
import { EditorView } from '@/dxEditor'
import ToolBase from './toolBase'
import globalConfig from '@/dxEditor/config'
import { getClosestTimesVal } from '@/dxEditor/utils'
import { EditorEvent, KeyEvent, PointerEvent } from '@/dxEditor/event'
import { Group, IPointerEvent, Line, Text } from '@/dxCanvas'
import { Box } from '@/dxCanvas/objects/Box'
export default class ToolDrawBtn extends ToolBase {
  readonly type = 'drawBtn'
  btn: Group | null = null


  constructor(editor: EditorView) {
    super(editor)
  }

  onTap = (event: PointerEvent) => {
    const { clientX, clientY } = event.origin as IPointerEvent
    const worldPoint = this.editor.tree.getWorldByClient(clientX, clientY)
    let x = getClosestTimesVal(worldPoint.x, globalConfig.moveSize)
    let y = getClosestTimesVal(worldPoint.y, globalConfig.moveSize)
    this.btn = new Box({
      position: [x, y],
      cornerRadius: 6,
      padding: [10, 10],
      style: {
        fillStyle: '#32cd79',
      },
      hoverStyle: {
        fillStyle: '#ff0000',
      },
      selectStyle: {
        fillStyle: '#ff0000',
      },
      name: '按钮',
      hitChildren: false,
    })
    const text = new Text({
      text: 'Text',
      style: {
        fontSize: 16,
        fontWeight: 700,
        fillStyle: '#000',
        textAlign: 'center',
        textBaseline: 'middle'
      },
      hitable: false,
    })
    this.btn.add(text)
    this.editor.tree.add(this.btn)
    this.editor.tree.render()
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
    this.editor.guideline.visible = true
    this.editor.selector.hittable = false
    this.editor.addEventListener(PointerEvent.TAP, this.onTap)
    this.editor.addEventListener(KeyEvent.HOLD, this.onKeydown)
  }
  inactive() {
    this.editor.guideline.visible = false
    this.editor.selector.hittable = true
    this.editor.removeEventListener(PointerEvent.TAP, this.onTap)
    this.editor.removeEventListener(KeyEvent.HOLD, this.onKeydown)
  }
}

