/*
 * @Description: 快捷键
 * @Author: ldx
 * @Date: 2024-08-27 15:19:15
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-10 09:31:03
 */
import { getMaxMin } from "@/editor/utils";
import { EditorView } from "@/editor/view";
import { Bounds, ChildEvent, DragEvent, PropertyEvent } from "leafer-ui";

export default class Hotkeys {
  constructor(public view: EditorView) { }
  /** 删除选中 */
  deleteSelected = () => {
    const list = this.view.selector.list || []
    list.forEach(item => {
      item.parent?.remove(item)
    })
    this.view.selector.cancel()

    if (list.length > 0) {
      // 撤销回退需要
      this.view.app.tree.emit('reomve')
      // this.view.app.emit('reomve')
    }
  }
  /** 全选 */
  selectAll = (event?: KeyboardEvent) => {
    event && event.preventDefault()
    const graph = this.view.app.tree.children
    this.view.selector.select(graph)
  }
  /** 缩小 */
  zoomOut = (event?: KeyboardEvent) => {
    event && event.preventDefault()
    this.view.app.tree.zoom('out')
    this.view.selector.hoverTarget = null
    this.view.app.tree.emit('zoomChange')
  }
  /** 放大 */
  zoomIn = (event?: KeyboardEvent) => {
    event && event.preventDefault()
    this.view.app.tree.zoom('in')
    this.view.selector.hoverTarget = null
    this.view.app.tree.emit('zoomChange')
  }
  /** 适应画布 */
  showAll = (event?: KeyboardEvent) => {
    event && event.preventDefault()
    // 画布中没有图形则不做任何操作
    const list = this.view.app.tree.children
    list.length > 0 && this.view.app.tree.zoom(list)
    this.view.selector.hoverTarget = null
    this.view.app.tree.emit('zoomChange')
  }
  /** 适应选中图形 */
  showSelectGraph = (event?: KeyboardEvent) => {
    event && event.preventDefault()
    // 没有选中图形则自适应画布，画布中没有图形则不做任何操作
    let graph = this.view.selector.list
    if (graph.length === 0) graph = this.view.app.tree.children
    graph.length > 0 && this.view.app.tree.zoom(graph)
    this.view.selector.hoverTarget = null
    this.view.app.tree.emit('zoomChange')
  }
  /** 画布缩放到100% */
  '50%' = (event?: KeyboardEvent) => {
    event && event.preventDefault()
    this.view.app.tree.scale = 0.5
    this.view.app.tree.emit('zoomChange')
  }
  '100%' = (event?: KeyboardEvent) => {
    event && event.preventDefault()
    this.view.app.tree.scale = 1
    this.view.app.tree.emit('zoomChange')
  }
  '200%' = (event?: KeyboardEvent) => {
    event && event.preventDefault()
    this.view.app.tree.scale = 2
    this.view.app.tree.emit('zoomChange')
  }
  /** 隐藏/显示标尺 */
  setRulerVisible = () => {
    this.view.ruler.visible = !this.view.ruler.visible
  }
  /** 左对齐 */
  alignLeft = () => {
    const list = this.view.selector.list
    const element = this.view.app.editor.element
    if (!element) return
    const { x = 0 } = element
    list.forEach(item => {
      // 考虑旋转/缩放问题，图形的x/y不在最左边了，需要偏移
      const points = item.getLayoutPoints('box', item.leafer)
      const { minX } = getMaxMin(points)
      // 计算偏移值 
      const offset = (item.x || 0) - minX
      if (item.x = x + offset) return
      item.x = x + offset
    })
    // this.view.app.editor.updateEditBox()
  }
  /** 水平居中 */
  horizontalCenter = () => {
    const list = this.view.selector.list
    const element = this.view.app.editor.element
    if (!element) return
    const { x = 0, width = 0 } = element
    list.forEach(item => {
      const points = item.getLayoutPoints('box', item.leafer)
      const { minX, maxX } = getMaxMin(points)
      // 根据包围盒计算出图形宽度的一半位置 - 图形的x轴坐标位置 = 偏移量
      const offset = ((maxX + minX) || 0) / 2 - (item.x || 0)
      const center = width / 2 + x
      if (item.x === center - offset) return
      item.x = center - offset
    })
    // this.view.app.editor.updateEditBox()
  }
  /** 右对齐 */
  alignRight = () => {
    const list = this.view.selector.list
    const element = this.view.app.editor.element
    if (!element) return
    const { x = 0, width = 0 } = element
    list.forEach(item => {
      const points = item.getLayoutPoints('box', item.leafer)
      const { maxX } = getMaxMin(points)
      // 根据包围盒计算出图形最大值 - 图形的x轴坐标位置 = 偏移量
      const offset = maxX - (item.x || 0)
      const right = x + width
      if (item.x === right - offset) return
      item.x = right - offset
    })
    // this.view.app.editor.updateEditBox()
  }
  /** 顶对齐 */
  alignTop = () => {
    const list = this.view.selector.list
    const element = this.view.app.editor.element
    if (!element) return
    const { y = 0 } = element
    list.forEach(item => {
      // 考虑旋转/缩放问题，图形的x/y不在最左边了，需要偏移
      const points = item.getLayoutPoints('box', item.leafer)
      const { minY } = getMaxMin(points)
      // 计算偏移值  
      const offset = (item.y || 0) - minY
      if (item.y = y + offset) return
      item.y = y + offset
    })
    // this.view.app.editor.updateEditBox()
  }
  /** 垂直居中 */
  verticalCenter = () => {
    const list = this.view.selector.list
    const element = this.view.app.editor.element
    if (!element) return
    const { y = 0, height = 0 } = element
    list.forEach(item => {
      const points = item.getLayoutPoints('box', item.leafer)
      const { minY, maxY } = getMaxMin(points)
      // 偏移量
      const offset = ((maxY + minY) || 0) / 2 - (item.y || 0)
      const center = height / 2 + y
      if (item.y === center - offset) return
      item.y = center - offset
    })
    // this.view.app.editor.updateEditBox()
  }
  /** 底对齐 */
  alignBottom = () => {
    const list = this.view.selector.list
    const element = this.view.app.editor.element
    if (!element) return
    const { y = 0,height = 0 } = element
    list.forEach(item => {
      const points = item.getLayoutPoints('box', item.leafer)
      const { maxY } = getMaxMin(points)
      // 偏移量
      const offset = maxY - (item.y || 0)
      const bottom = y + height
      if (item.y === bottom - offset) return
      item.y = bottom - offset
    })
    // this.view.app.editor.updateEditBox()
  }
}