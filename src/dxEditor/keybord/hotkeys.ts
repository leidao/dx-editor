/*
 * @Description: 快捷键
 * @Author: ldx
 * @Date: 2024-08-27 15:19:15
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-01 10:59:58
 */
import { generateUUID, Vector2 } from "@/dxCanvas";
import { EditorView } from "@/dxEditor";
import { EditorEvent } from "../event";

export default class Hotkeys {
  constructor(public editor: EditorView) { }
  /** 删除选中 */
  deleteSelected = () => {
    const list = this.editor.selector.list || []
    // this.editor.selector.cancel()
    // this.editor.history.patch()
    list.forEach(item => {
      item.remove()
    })
    this.editor.tree.render()
    if (list.length > 0) {
      // 撤销回退需要
      this.editor.dispatchEvent(EditorEvent.REMOVE,new EditorEvent('remove'))
    }
  }
  /** 全选 */
  selectAll = () => {
    const graph = this.editor.tree.children
    this.editor.selector.select(...graph)
  }
  /** 复制 */
  copy = () => {
    const list = this.editor.selector.list
    if (list.length === 0) return
    list.forEach(element => {
      const copyElement = element.clone()
      copyElement.uuid = generateUUID()
      this.editor.pasteData.add(copyElement)
    })
    this.editor.dispatchEvent(EditorEvent.PASTE_CHANGE,new EditorEvent('copy'))
  }
  /** 剪切 */
  cut = () => {
    const list = this.editor.selector.list
    if (list.length === 0) return
    list.forEach(element => {
      this.editor.pasteData.add(element)
      // const copyElement = element.clone()
      // copyElement.uuid = generateUUID()
      // this.editor.pasteData.add(copyElement)
    })
    this.editor.tree.render()
    this.editor.dispatchEvent(EditorEvent.PASTE_CHANGE,new EditorEvent('shear'))
  }
  /** 缩小 */
  zoomOut = () => {
    this.editor.orbitControler.zoomOut()
    this.editor.selector.hoverTarget = null
  }
  /** 放大 */
  zoomIn = () => {
    this.editor.orbitControler.zoomIn()
    this.editor.selector.hoverTarget = null
  }
  /** 适应画布 */
  showAll = () => {
    // 画布中没有图形则不做任何操作
    const list = this.editor.tree.children
    if (list.length > 0) {
      this.editor.orbitControler.zoomGraph(list)
    }
    this.editor.selector.hoverTarget = null
    this.editor.tree.render()
  }
  /** 适应选中图形 */
  showSelectGraph = () => {
    // 没有选中图形则自适应画布，画布中没有图形则不做任何操作
    let list = this.editor.selector.list
    if (list.length === 0) list = this.editor.tree.children
    if (list.length > 0) {
      this.editor.orbitControler.zoomGraph(list)
    }
    this.editor.selector.hoverTarget = null
    this.editor.tree.render()
  }
  /** 画布缩放到100% */
  '50%' = () => {
    const scale = 0.5 / this.editor.camera.zoom
    this.editor.orbitControler.zoom(scale)
  }
  '100%' = () => {
    const scale = 1 / this.editor.camera.zoom
    this.editor.orbitControler.zoom(scale)
  }
  '200%' = () => {
    const scale = 2 / this.editor.camera.zoom
    this.editor.orbitControler.zoom(scale)
  }
  /** 旋转 */
  rotate = (angle: number) => {
    const list = this.editor.selector.list
    list.forEach(element => {
      const { x, y } = element.bounds
      element.rotate += angle
      element.computeBoundsBox()
      const P = new Vector2(element.bounds.x - x, element.bounds.y - y)
      element.position.sub(P)
      element.computeBoundsBox(true)
    })
    this.editor.tree.render()
    this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
  }
  /** 翻转 */
  flip = (axis: 'x' | 'y') => {
    const list = this.editor.selector.list
    list.forEach(element => {
      const { x: scaleX, y: scaleY } = element.scale
      const { x, y } = element.bounds
      element.scale.set(axis === 'x' ? scaleX * -1 : scaleX, axis === 'y' ? scaleY * -1 : scaleY)
      element.computeBoundsBox()
      const P = new Vector2(element.bounds.x - x, element.bounds.y - y)
      element.position.sub(P)
      element.computeBoundsBox(true)
    })
    this.editor.tree.render()
    this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
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
    const { minX, min } = element.bounds
    list.forEach(item => {
      if (item.bounds.minX === minX) return
      const P = item.bounds.min.clone().sub(min)
      item.position.x -= P.x
      item.computeBoundsBox(true)
    })
    element.computeBoundsBox()
    this.editor.tree.render()
    this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
  }

  /** 右对齐 */
  alignRight = () => {
    const list = this.editor.selector.list
    const element = this.editor.selector.element
    if (!element) return
    const { maxX, max } = element.bounds
    list.forEach(item => {
      if (item.bounds.maxX === maxX) return
      const P = max.clone().sub(item.bounds.max)
      item.position.x += P.x
      item.computeBoundsBox(true)
    })
    element.computeBoundsBox()
    this.editor.tree.render()
    this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
  }
  /** 顶对齐 */
  alignTop = () => {
    const list = this.editor.selector.list
    const element = this.editor.selector.element
    if (!element) return
    const { minY, min } = element.bounds
    list.forEach(item => {
      if (item.bounds.minY === minY) return
      const P = item.bounds.min.clone().sub(min)
      item.position.y -= P.y
      item.computeBoundsBox(true)
    })
    element.computeBoundsBox()
    this.editor.tree.render()
    this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
  }
  /** 底对齐 */
  alignBottom = () => {
    const list = this.editor.selector.list
    const element = this.editor.selector.element
    if (!element) return
    const { maxY, max } = element.bounds
    list.forEach(item => {
      if (item.bounds.maxY === maxY) return
      const P = max.clone().sub(item.bounds.max)
      item.position.y += P.y
      item.computeBoundsBox(true)
    })
    element.computeBoundsBox()
    this.editor.tree.render()
    this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
  }
  /** 垂直居中 */
  verticalCenter = () => {
    const list = this.editor.selector.list
    const element = this.editor.selector.element
    if (!element) return
    const { x = 0 } = element.bounds
    list.forEach(item => {
      if (item.bounds.x === x) return
      const px = item.bounds.x - x
      item.position.x -= px
      item.computeBoundsBox(true)
    })
    element.computeBoundsBox()
    this.editor.tree.render()
    this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
  }
  /** 水平居中 */
  horizontalCenter = () => {
    const list = this.editor.selector.list
    const element = this.editor.selector.element
    if (!element) return
    const { y = 0 } = element.bounds
    list.forEach(item => {
      if (item.bounds.y === y) return
      const py = item.bounds.y - y
      item.position.y -= py
      item.computeBoundsBox(true)
    })
    element.computeBoundsBox()
    this.editor.tree.render()
    this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
  }
  /** 水平等距分布 */
  horizontalEquidistance = () => {
    const list = this.editor.selector.list
    const element = this.editor.selector.element
    if (!element) return
    const size = list.length - 1
    const { width, minX, maxX } = element.bounds
    const usedWidth = list.reduce((a, b) => {
      return a + b.bounds.width
    }, 0)
    // 剩余宽度等距分布
    const equallyWidth = (width - usedWidth) / size
    // 对列表进行排序，以便按照顺序设置元素位置
    const sortList = list.slice().sort((a, b) => a.bounds.x - b.bounds.x)
    sortList.forEach((item, i) => {
      if (item.bounds.minX === minX || item.bounds.maxX === maxX) return
      item.position.x = sortList[i-1].bounds.maxX + equallyWidth 
      item.computeBoundsBox(true)
    })
    element.computeBoundsBox()
    this.editor.tree.render()
    this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
  }
  /** 垂直等距分布 */
  verticalEquidistance = () => {
    const list = this.editor.selector.list
    const element = this.editor.selector.element
    if (!element) return
    const size = list.length - 1
    const { height, minY, maxY } = element.bounds
    const usedHeight = list.reduce((a, b) => {
      return a + b.bounds.height
    }, 0)
    // 剩余高度等距分布
    const equallyHeight = (height - usedHeight) / size
    const sortList = list.slice().sort((a, b) => a.bounds.y - b.bounds.y)
    sortList.forEach((item, i) => {
      if (item.bounds.minY === minY || item.bounds.maxY === maxY) return
      item.position.y = sortList[i-1].bounds.maxY + equallyHeight 
      item.computeBoundsBox(true)
    })
    element.computeBoundsBox()
    this.editor.tree.render()
    this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
  }

}