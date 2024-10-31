/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-27 16:04:35
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-30 11:33:49
 */
import { EditorEvent } from '@/dxEditor/event';
import { LeafList } from '../leafList';
import EditTool from "../editTool/editTool";
import { Img } from '@/dxCanvas';

export default class ImgEditOuter extends EditTool {
  public get tag() { return 'ImgEditOuter' }
  leafList = new LeafList()

  onHoverEnter(event: EditorEvent) {
    const element = event.target as Img
    this.editor.cursor.setCursor('move')
    if (this.editor.selector.leafList.has(element)) return
    element.state = 'hoverEnter'
    this.updateEditBox(element)
  }
  onHover(event: EditorEvent) {
  }
  onHoverLeave(event: EditorEvent) {
    const element = event.target as Img
    this.editor.cursor.setCursor('auto')
    if (this.editor.selector.leafList.has(element)) return
    element.state = 'hoverLeave'
    this.updateEditBox(element)
  }

  onSelect(event: EditorEvent) {
    const element = event.target as Img
    this.editor.cursor.setCursor('move')
    element.state = 'select'
    this.updateEditBox(element)
    this.editor.tree.render()
    // 收集所有的导线
    // this.leafList.reset()
    // this.editor.tree.traverse((item) => {
    //   if (item instanceof Line && item.name === '导线') {
    //     this.leafList.add(item)
    //   }
    // })

  }
  onUnSelect(event: EditorEvent) {
    const element = event.target as Img
    this.editor.cursor.setCursor('auto')
    element.src = element.style.src || ''
    element.state = 'none'
    this.updateEditBox(element)
  }

  updateEditBox(element: Img) {
    const state = element.state
    switch (state) {
      case 'hoverEnter':
        element.src = element.hoverStyle.src || ''
        break;
      case 'select':
        element.src = element.selectStyle.src || ''
        break;
      case 'hoverLeave':
      case 'none':
      default:
        element.src = element.style.src || ''
        break;
    }
    this.editor.sky.render()
  }

  // calculatedAdsorptionEffect(x: number, y: number) {
  //   let lines: any[] = []
  //   this.leafList.forEach(line => {
  //     const _movePoints = line.data?._movePoints || []
  //     const startPoint = _movePoints[0];
  //     const endPoint = _movePoints[_movePoints.length - 1];
  //     // 该导线同样被选中，则不用考虑
  //     if (this.selector.leafList.has(line)) return
  //     if (parseInt(`${startPoint.x}`) === parseInt(`${x}`) && parseInt(`${startPoint.y}`) === parseInt(`${y}`)) {
  //       lines.push({
  //         element: line,
  //         type: 'start'
  //       })
  //     } else if (parseInt(`${endPoint.x}`) === parseInt(`${x}`) && parseInt(`${endPoint.y}`) === parseInt(`${y}`)) {
  //       lines.push({
  //         element: line,
  //         type: 'end'
  //       })
  //     }
  //   })
  //   return lines
  // }
}
