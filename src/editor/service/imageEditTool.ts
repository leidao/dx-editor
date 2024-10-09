/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-27 16:04:35
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-09 15:03:12
 */
import globalConfig from '../config'
import { traverse } from '../utils';

import EditTool, { HoverEvent, SelectEvent } from "./editTool";
import { registerEditTool } from "leafer-editor";
import { Image, LeafList, Line } from "leafer-ui";
@registerEditTool()
export default class ImageEditTool extends EditTool {
  public get tag() { return 'ImageEditTool' }
  leafList = new LeafList()
  // onMove(event: any) {
  //   super.onMove(event)
  //   const { list, app } = this.selector
  
  //   // 导线的跟随移动
  //   list.forEach(target => {
  //     if (target instanceof Image && target.data.ellipseData) {
  //       const targetX = target.x || 0, targetY = target.y || 0
  //       const ellipseData: { x: number, y: number }[] = target.data!.ellipseData
  //       for (let i = 0; i < ellipseData.length; i++) {
  //         const element = ellipseData[i];
  //         const pageX = element.x + targetX
  //         const pageY = element.y + targetY
  //         const lines = this.calculatedAdsorptionEffect(pageX, pageY)
  //         if (this.moveData.x === 0 && this.moveData.y === 0) return
  //         lines.forEach(item => {
  //           const { type, element } = item
  //           if (type === 'start') {
  //             const { _movePoints = [], _points = [] } = element.data
  //             let moveX = pageX, moveY = pageY
  //             if (_movePoints.length === 2) {
  //               this.moveData.x > 0 ? 0 : 0
  //               moveX = _movePoints[0].x
  //             } else {

  //             }
  //           }
  //         })


  //       }
  //     }
  //   })
  // }
  
  onHoverEnter(event: HoverEvent) {
    const { element } = event
    element.cursor = 'all-scroll';
    (element as Image).url = element.data?.hoverUrl || ''
  }
  onHover(event: HoverEvent) {
  }
  onHoverLeave(event: HoverEvent) {
    const { element } = event
    if(this.selector.leafList.has(element)) return
    element.cursor = 'auto';
    (element as Image).url = element.data?.sourceUrl || ''
  }

  onSelect(event: SelectEvent) {
    const { element } = event
    element.cursor = 'all-scroll';
    (element as Image).url = element.data?.selectUrl || ''

    // 收集所有的导线
    this.leafList.reset()
    traverse(this.selector.app.tree, (item) => {
      if (item instanceof Line && item.name === '导线') {
        this.leafList.add(item)
      }
    })
  }
  onUnSelect(event: SelectEvent) {
    const { element } = event;
    (element as Image).url = element.data?.sourceUrl || ''
  }
  onLoad() {
    console.log('onLoad');
  }
  onUpdate() {
    console.log('onUpdate');
  }
  onUnload() {
    console.log('onUnload');
  }
  calculatedAdsorptionEffect(x: number, y: number) {
    let lines: any[] = []
    this.leafList.forEach(line => {
      const _movePoints = line.data?._movePoints || []
      const startPoint = _movePoints[0];
      const endPoint = _movePoints[_movePoints.length - 1];
      // 该导线同样被选中，则不用考虑
      if (this.selector.leafList.has(line)) return
      if (parseInt(`${startPoint.x}`) === parseInt(`${x}`) && parseInt(`${startPoint.y}`) === parseInt(`${y}`)) {
        lines.push({
          element: line,
          type: 'start'
        })
      } else if (parseInt(`${endPoint.x}`) === parseInt(`${x}`) && parseInt(`${endPoint.y}`) === parseInt(`${y}`)) {
        lines.push({
          element: line,
          type: 'end'
        })
      }
    })
    return lines
  }
}
