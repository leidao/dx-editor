/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-27 16:04:35
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-10 16:31:11
 */
import globalConfig from '../config'
import EditTool, { HoverEvent, SelectEvent } from "./editTool";
import { registerEditTool } from "leafer-editor";
@registerEditTool()
export default class LineEditTool extends EditTool {
  public get tag() { return 'lineEditTool' }
 
  onHoverEnter(event: HoverEvent) {
    const { element } = event
    element.cursor = 'all-scroll';
    element.stroke = element.data?.hoverColor || ''
  }
  onHover(event: HoverEvent) {
    // ew-resize 'ns-resize'
  }
  onHoverLeave(event: HoverEvent) {
    const { element } = event
    if(this.selector.leafList.has(element)) return
    element.cursor = 'auto';
    element.stroke = element.data?.sourceColor || ''
  }

  onSelect(event: SelectEvent) {
    const { element } = event
    element.cursor = 'all-scroll';
    element.stroke = element.data?.selectColor || ''
    element.data && (element.data.state = 'select')
  }
  onUnSelect(event: SelectEvent) {
    const { element } = event;
    element.stroke = element.data?.sourceColor || ''
    element.data && (element.data.state = 'none')
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
}
