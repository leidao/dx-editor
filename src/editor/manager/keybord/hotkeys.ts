/*
 * @Description: 快捷键
 * @Author: ldx
 * @Date: 2024-08-27 15:19:15
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-11 15:22:13
 */
import { getMaxMin } from "@/editor/utils";
import { EditorView } from "@/editor/editor";
import { Bounds, ChildEvent, DragEvent, PropertyEvent } from "leafer-ui";

export default class Hotkeys {
  constructor(public editor: EditorView) { }
  /** 删除选中 */
  deleteSelected = () => {
    const list = this.editor.selector.list || []
    this.editor.selector.cancel()
    // this.editor.manager.history.patch()
    list.forEach(item => {
      item.parent?.remove(item)
    })
    if (list.length > 0) {
      // 撤销回退需要
      this.editor.app.tree.emit('reomve')
      this.editor.app.emit('selectChange')
    }
  }
  /** 全选 */
  selectAll = (event?: KeyboardEvent) => {
    event && event.preventDefault()
    const graph = this.editor.app.tree.children
    this.editor.selector.select(graph)
  }
  /** 缩小 */
  zoomOut = (event?: KeyboardEvent) => {
    event && event.preventDefault()
    this.editor.app.tree.zoom('out')
    this.editor.selector.hoverTarget = null
    this.editor.app.tree.emit('zoomChange')
  }
  /** 放大 */
  zoomIn = (event?: KeyboardEvent) => {
    event && event.preventDefault()
    this.editor.app.tree.zoom('in')
    this.editor.selector.hoverTarget = null
    this.editor.app.tree.emit('zoomChange')
  }
  /** 适应画布 */
  showAll = (event?: KeyboardEvent) => {
    event && event.preventDefault()
    // 画布中没有图形则不做任何操作
    const list = this.editor.app.tree.children
    list.length > 0 && this.editor.app.tree.zoom(list)
    this.editor.selector.hoverTarget = null
    this.editor.app.tree.emit('zoomChange')
  }
  /** 适应选中图形 */
  showSelectGraph = (event?: KeyboardEvent) => {
    event && event.preventDefault()
    // 没有选中图形则自适应画布，画布中没有图形则不做任何操作
    let graph = this.editor.selector.list
    if (graph.length === 0) graph = this.editor.app.tree.children
    graph.length > 0 && this.editor.app.tree.zoom(graph)
    this.editor.selector.hoverTarget = null
    this.editor.app.tree.emit('zoomChange')
  }
  /** 画布缩放到100% */
  '50%' = (event?: KeyboardEvent) => {
    event && event.preventDefault()
    this.editor.app.tree.scale = 0.5
    this.editor.app.tree.emit('zoomChange')
  }
  '100%' = (event?: KeyboardEvent) => {
    event && event.preventDefault()
    this.editor.app.tree.scale = 1
    this.editor.app.tree.emit('zoomChange')
  }
  '200%' = (event?: KeyboardEvent) => {
    event && event.preventDefault()
    this.editor.app.tree.scale = 2
    this.editor.app.tree.emit('zoomChange')
  }
  /** 旋转 */
  rotate = (angle:number) => {
    const list = this.editor.selector.list
    list.forEach(element => {
      element.rotateOf('center', angle)
    })
  }
  /** 翻转 */
  flip = (axis:'x' | 'y' ) => {
    const list = this.editor.selector.list
    list.forEach(element => {
      element.flip(axis)
    })
  }
 
  /** 隐藏/显示标尺 */
  setRulerVisible = () => {
    this.editor.ruler.visible = !this.editor.ruler.visible
  }
  /** 左对齐 */
  alignLeft = () => {
    const list = this.editor.selector.list
    const element = this.editor.selector.element
    if (!element) return
    const { x = 0 } = element
    list.forEach(item => {
      // 考虑旋转/缩放问题，图形的x/y不在最左边了，需要偏移
      const points = item.getLayoutPoints('box', item.leafer)
      const { minX } = getMaxMin(points)
      // 计算偏移值 
      const offset = (item.x || 0) - minX
      if (item.x === x + offset) return
      item.x = x + offset
    })
    this.editor.app.tree.emit('update')
  }

  /** 右对齐 */
  alignRight = () => {
    const list = this.editor.selector.list
    const element = this.editor.selector.element
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
    this.editor.app.tree.emit('update')
  }
  /** 顶对齐 */
  alignTop = () => {
    const list = this.editor.selector.list
    const element = this.editor.selector.element
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
    this.editor.app.tree.emit('update')
  }
  /** 垂直居中 */
  verticalCenter = () => {
    const list = this.editor.selector.list
    const element = this.editor.selector.element
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
    this.editor.app.tree.emit('update')
  }
  /** 水平居中 */
  horizontalCenter = () => {
    const list = this.editor.selector.list
    const element = this.editor.selector.element
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
    this.editor.app.tree.emit('update')
  }
  /** 底对齐 */
  alignBottom = () => {
    const list = this.editor.selector.list
    const element = this.editor.selector.element
    if (!element) return
    const { y = 0, height = 0 } = element
    list.forEach(item => {
      const points = item.getLayoutPoints('box', item.leafer)
      const { maxY } = getMaxMin(points)
      // 偏移量
      const offset = maxY - (item.y || 0)
      const bottom = y + height
      if (item.y === bottom - offset) return
      item.y = bottom - offset
    })
    this.editor.app.tree.emit('update')
  }
}