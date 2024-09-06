/*
 * @Description: 操作图形
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-06 16:04:30
 */

import { EditorView } from '@/editor/view'
import ToolBase from './toolBase'
import { EditorMoveEvent, Line, DragEvent, Box } from 'leafer-editor';
import { EditorScaleEvent, EditTool, registerEditTool } from '@leafer-in/editor'
import { updateLinePoints } from './drawLine';

@registerEditTool()
export class CustomEditTool extends EditTool {

  public get tag() { return 'CustomEditTool' } // 2. 定义全局唯一的 tag 名称

  onScaleWithDrag(event: EditorScaleEvent) {
    const line = event.target as Line
   
    
    // console.log('event',event.editor.leafer.getPagePointByClient);
    // const { x, y } = event.editor.getPagePoint({ x: event.drag.origin.offsetX, y: event.drag.origin.offsetY })
    const { x, y } = event.editor.leafer?.getPagePointByClient(event.drag.origin as any)!
    // console.log('xxxx',x,y,event.editor.getPagePoint({ x: event.drag.origin.offsetX, y: event.drag.origin.offsetY }));
  
    // console.log('event.drag.getPagePoint()',event.drag.getPagePoint());
    // event.drag.getPa
    
    updateLinePoints(line, { x, y }, event.direction)
  }
 
}
export default class ToolOperationGraph extends ToolBase {
  readonly keyboard = 'a'
  readonly type = 'operationGraph'
  constructor(view: EditorView) {
    super(view)
    Line.setEditOuter('CustomEditTool')
  }
  active() {
    this.app.editor.visible = true
    this.app.tree.hitChildren = true
  }
  inactive() {
    this.app.editor.visible = false
    this.app.tree.hitChildren = false
    this.app.editor.cancel()
  }
}

