/*
 * @Description: 绘制线段
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-05 18:01:41
 */
import { v4 } from 'uuid'
import { EditorView } from '@/editor/view'
import ToolBase from './toolBase'
import {  DragEvent, KeyEvent, Line, Point } from 'leafer-editor'
export default class ToolDrawLine extends ToolBase {
  readonly keyboard = 'l'
  readonly type = 'drawLine'
  /** 是否按住了shift健 */
  shiftKey = false
  line!: Line
  constructor(view: EditorView) {
    super(view)
  }
 
  start = (e: DragEvent) => {
    const { x, y } = this.app.getPagePoint({x:e.x,y:e.y})
    this.line = new Line({
      editable: true,
      strokeWidth: 2,
      stroke: '#ff0000',
      points: [x, y],
      name:'线段',
      id:v4()
    })
    this.app.tree.add(this.line)
  }

  drag = (e: DragEvent) => {
    if (this.line) {
      const { x, y } = this.app.getPagePoint({x:e.x,y:e.y})
      const points = (this.line.points||[]).splice(0, 2)
      let lastPointX = x,lastPointY = y
      if(this.shiftKey){
       const angle =  new Point(...points).getAngle(new Point(x,y))
        if(angle > -22.5 && angle < 22.5){
          lastPointY = points[1]
        }else if(angle > 22.5 && angle < 67.5){
          
        }else if(angle > 67.5 && angle < 112.5){
          lastPointX = points[0]
        }else if(angle > 112.5 && angle < 157.5){
          
        }else if(angle > 157.5 && angle > -157.5){
          lastPointY = points[1]
        }else if(angle > 202.5 && angle < 247.5){
          
        }else if(angle > 202.5 && angle < 247.5){
          
        }
      //  console.log('xxxxx',angle);
       
      }
      this.line.points = [...points, x, y]
      
      
    }
  }
  end = () =>{
    this.app.tree.emit('add')
  }
  down = (event:KeyEvent) =>{
    this.shiftKey = event.shiftKey
  }
  up = (event:KeyEvent) =>{
    this.shiftKey = event.shiftKey
  }
 
  active() {
    this.app.editor.visible = false
    this.app.tree.hitChildren = false
    this.app.on(DragEvent.START, this.start)
    this.app.on(DragEvent.DRAG, this.drag)
    this.app.on(DragEvent.END, this.end)
    this.app.on(KeyEvent.DOWN, this.down)
    this.app.on(KeyEvent.UP, this.up)
  }
  inactive() {
    this.app.editor.visible = true
    this.app.tree.hitChildren = true
    this.app.off(DragEvent.START, this.start)
    this.app.off(DragEvent.DRAG, this.drag)
    this.app.on(DragEvent.END, this.end)
  }

}

