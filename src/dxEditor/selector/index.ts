/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-27 16:04:35
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-07 10:29:55
 */
import { EditorView } from "../index"
import { getClosestTimesVal } from "../utils"
import globalConfig from '../config'
import { Bounds, Box, Img, IObject, Object2D, Rect, Text } from "@/dxCanvas"
import { PointerEvent, DragEvent, EditorEvent, KeyEvent } from '../event'
import { LeafList } from "./leafList"
import { EditToolCreator } from "./editTool/EditToolCreator"
import { IPointerEvent } from "@/dxCanvas/event"
import { VirtualGroup } from "./virtualGroup"
import EditOuter from "./editTool/editTool"
import ImgEditOuter from "./editOuter/imgEditOuter"
import TextEditOuter from "./editOuter/textEditOuter"
import TextEditInner from "./editInner/textEditInner"
import { SelectArea } from "./selectArea"
import BoxEditInner from "./editInner/boxEditInner"


Object2D.setEditOuter = function (toolName: string): void {
  Object.defineProperty(this.prototype, 'editOuter', {
    get(): string { return toolName }
  })
}
Object2D.setEditInner = function (toolName: string): void {
  Object.defineProperty(this.prototype, 'editInner', {
    get(): string { return toolName }
  })
}


export default class Selector {
  hoverTarget: Object2D | null = null
  target: Object2D | Object2D[] | null = null

  editToolList: IObject = {}

  // 列表
  get list(): Object2D[] { return this.leafList.list }
  leafList: LeafList = new LeafList()

  // 状态

  get multiple(): boolean { return this.list.length > 1 }
  get single(): boolean { return this.list.length === 1 }

  dragging: boolean = false
  editing = false
  /** 元素是否响应交互事件，默认为 true */
  hittable = true

  downData?: IPointerEvent
  selectArea!: SelectArea
  // 组件
  get element() {
    if (this.multiple) {
      this.simulateTarget.clear()
      this.list.forEach(item => this.simulateTarget.add(item))
      this.simulateTarget.computeBoundsBox()
      return this.simulateTarget
    } else {
      return this.list[0] as Object2D
    }
  }
  simulateTarget = new VirtualGroup()
  needRemoveItem: Object2D | null = null


  constructor(public editor: EditorView) {
    this.listen()
    EditOuter.registerEditTool()
    ImgEditOuter.registerEditTool()
    Img.setEditOuter('ImgEditOuter')
    // TextEditOuter.registerEditTool()
    // Text.setEditOuter('TextEditOuter')
    TextEditInner.registerEditTool()
    Text.setEditInner('TextEditInner')
    BoxEditInner.registerEditTool()
    Box.setEditInner('BoxEditInner')

    this.selectArea = new SelectArea(editor)
  }


  // setHoverTarget(target?: Object2D) {
  //   if (!target) return
  //   if (this.hoverTarget) {
  //     this.app.emit('EditSelect.hover', { element: this.hoverTarget, type: 'hoverLeave', event: null })
  //   }
  //   this.app.emit('EditSelect.hover', { element: target, type: 'hoverEnter', event: null })
  //   this.hoverTarget = target
  // }
  // select 
  select(...targets: Object2D[]): void {
    const oldList = this.leafList.clone()
    this.leafList.reset()
    targets.forEach(item => this.addItem(item))
    this.compareSelectChange(this.leafList, oldList)
    this.target = targets
  }
  cancel(): void {
    const oldList = this.leafList.clone()
    this.leafList.reset()
    this.compareSelectChange(this.leafList, oldList)
    this.target = null
  }

  // item
  public hasItem(item: Object2D): boolean {
    return this.leafList.has(item)
  }

  public addItem(item: Object2D): void {
    if (!this.hasItem(item) && !item.locked) {
      this.leafList.add(item)
      this.target = this.leafList.list
    }
  }

  public removeItem(item: Object2D): void {
    if (this.hasItem(item)) {
      this.leafList.remove(item)
      this.target = this.leafList.list
    }
  }

  public shiftItem(item: Object2D): void {
    this.hasItem(item) ? this.removeItem(item) : this.addItem(item)
  }


  public findUI(event: PointerEvent | DragEvent): Object2D | null {
    const { clientX, clientY } = event.origin! as IPointerEvent
    const worldPoint = this.editor.tree.getWorldByClient(clientX, clientY)
    const obj = this.editor.tree.isPointInGraph(worldPoint)
    return obj?.hittable ? obj : null
  }

  public isMultipleSelect(): boolean {
    return !!this.editor.shiftKey
  }

  // event
  onMove = (event: PointerEvent) => {
    // 在拖拽中或者不允许交互不进入判断
    if (this.editor.dragging || !this.hittable) return
    const find = this.findUI(event)
    // 元素存在并且不隐藏
    if (find) {
      if (find === this.hoverTarget) {
        // 在元素上移动
        this.editor.dispatchEvent(EditorEvent.HOVER, new EditorEvent('hover', { target: find, origin: event }))
      } else {
        if (this.hoverTarget) {
          // 离开之前的元素
          this.editor.dispatchEvent(EditorEvent.HOVER, new EditorEvent('hoverLeave', { target: this.hoverTarget, origin: event }))
          this.hoverTarget = null
        }
        // 进入新的元素
        this.editor.dispatchEvent(EditorEvent.HOVER, new EditorEvent('hoverEnter', { target: find, origin: event }))
        this.hoverTarget = find
      }
    } else if (this.hoverTarget) {
      // 离开之前的元素
      this.editor.dispatchEvent(EditorEvent.HOVER, new EditorEvent('hoverLeave', { target: this.hoverTarget, origin: event }))
      this.hoverTarget = null
    }
  }

  onDown = (e: PointerEvent) => {
    // 在编辑中或者不允许交互不进入判断
    if (this.editing || !this.hittable) return
    // const { app } = this
    const oldList = this.leafList.clone()
    const find = this.findUI(e)
    if (find) {
      if (this.isMultipleSelect()) {
        if (this.hasItem(find)) {
          // 等待tap事件再实际移除
          this.needRemoveItem = find
        } else {
          this.addItem(find)
        }
      } else {
        // if(this.multiple && this.hasItem(find)){
        //   TODO 可以做多个选中平移优化
        // }
        this.leafList.reset()
        this.addItem(find)
      }
    } else {
      if (!this.isMultipleSelect()) {
        this.leafList.reset()
        this.target = null
      }
    }
    this.compareSelectChange(this.leafList, oldList, e)
  }
  onTap = (e: PointerEvent) => {
    // 不允许交互
    if (!this.hittable) return
    if (this.needRemoveItem) {
      // const { app } = this
      const oldList = this.leafList.clone()
      this.removeItem(this.needRemoveItem)
      this.needRemoveItem = null
      this.compareSelectChange(this.leafList, oldList, e)
    }
  }

  compareSelectChange(value: LeafList, oldValue: LeafList, event?: PointerEvent) {
    const len = Math.max(value.length, oldValue.length)
    for (let i = 0; i < len; i++) {
      const element = value.indexAt(i) as Object2D
      const oldElement = oldValue.indexAt(i) as Object2D
      // 新的有，老的列表中也存在新的，这个元素什么也不用做
      if (element && oldValue.has(element) && oldElement && value.has(oldElement)) continue
      // 新的有，老的列表中没有新的，需要添加新的元素
      if (element && !oldValue.has(element)) {
        this.editor.dispatchEvent(EditorEvent.SELECT, new EditorEvent('select', { target: element, origin: event }))
      }
      // 老的有，新的元素中没有老的，需要去除老的元素
      if (oldElement && !value.has(oldElement)) {
        this.editor.dispatchEvent(EditorEvent.SELECT, new EditorEvent('unselect', { target: oldElement, origin: event }))
      }
    }
  }

  onDragStart = (event: DragEvent) => {
    // 不允许交互
    if (!this.hittable) return
    const find = this.findUI(event)
    this.dragging = !!find
    this.downData = event.origin as IPointerEvent
    if (this.dragging) {
      this.list.forEach(element => {
        const tag = element.editOuter as string
        const editTool = this.editToolList[tag] = this.editToolList[tag] || EditToolCreator.get(tag, this.editor)
        editTool?.onDragStart && editTool.onDragStart(event)
      })
    } else {
      const { clientX, clientY } = event.origin as IPointerEvent
      const worldPoint = this.editor.sky.getPageByClient(clientX, clientY)
      this.selectArea.setPoistion(worldPoint)
    }
  }
  onDrag = (event: DragEvent) => {
    // 不允许交互
    if (!this.hittable) return
    if (this.dragging) {
      const { downData } = this
      if (!downData) return
      const origin = event.origin as IPointerEvent
      const { moveSize } = globalConfig
      const distance = this.editor.tree.getPageLenByWorld(moveSize, 0).x
      let x = getClosestTimesVal(origin!.x, distance)
      let y = getClosestTimesVal(origin!.y, distance)
      let x2 = getClosestTimesVal(downData!.x, distance)
      let y2 = getClosestTimesVal(downData!.y, distance)
      event.moveX = x - x2
      event.moveY = y - y2
      if (event.moveX === 0 && event.moveY === 0) return
      this.downData = event.origin as IPointerEvent
      this.list.forEach(element => {
        const tag = element.editOuter as string
        const editTool = this.editToolList[tag] = this.editToolList[tag] || EditToolCreator.get(tag, this.editor)
        editTool?.onDrag && editTool.onDrag({ ...event, target: element })
      })
      this.editor.dispatchEvent(EditorEvent.DRAG, new EditorEvent('drag', { target: this.list }))
      this.editor.render()
    } else {
      const { clientX, clientY } = event.origin as IPointerEvent
      const worldPoint = this.editor.sky.getPageByClient(clientX, clientY)
      this.selectArea.setRect(worldPoint)
    }
  }
  onDragEnd = (event: DragEvent) => {
    // 不允许交互
    if (!this.hittable) return
    if (this.dragging) {
      this.list.forEach(element => {
        const tag = element.editOuter as string
        const editTool = this.editToolList[tag] = this.editToolList[tag] || EditToolCreator.get(tag, this.editor)
        editTool?.onDragEnd && editTool.onDragEnd({ ...event, target: element })
      })
      this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update', { target: this.list }))
    } else {
      this.selectArea.clear()
    }
    // if (this.dragging) {
    //   this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
    // }
    this.dragging = false
  }
  onDoubleTap = (e: PointerEvent) => {
    // 不允许交互
    if (!this.hittable) return
    const find = this.findUI(e)
    if (find && find.visible) {
      this.openInnerEditor()
    }
  }
  openInnerEditor(target?: Object2D) {
    // 将当前操作图形设为选中并且取消其他图形选中
    target && this.select(target)
    // debugger
    if (this.single && this.element.editable) {
      const editTarget = this.element
      const tag = editTarget.editInner || 'EditTool'
      const editTool = this.editToolList[tag] = this.editToolList[tag] || EditToolCreator.get(tag, this.editor)
      if (editTool.openInnerEditor) {
        this.editing = true
        editTool.openInnerEditor()
        this.editor.dispatchEvent(EditorEvent.OPENINNEREDIT, new EditorEvent('openInnerEdit', { target: editTarget as Object2D }))
      }
    }
  }
  closeInnerEditor() {
    if (this.single && this.element.editable) {
      const editTarget = this.element
      const tag = editTarget.editInner || 'EditTool'
      const editTool = this.editToolList[tag] = this.editToolList[tag] || EditToolCreator.get(tag, this as any)
      if (editTool.closeInnerEditor) {
        this.editing = false
        editTool.closeInnerEditor()
        this.editor.dispatchEvent(EditorEvent.CLOSEINNEREDIT, new EditorEvent('closeInnerEdit', { target: editTarget as Object2D }))
        this.editor.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
      }
    }
  }
  onHover = (event: EditorEvent) => {
    const { type } = event
    const element = event.target!
    const tag = element.editOuter || 'EditTool'
    const editTool = this.editToolList[tag] = this.editToolList[tag] || EditToolCreator.get(tag, this.editor)
    switch (type) {
      case 'hoverEnter':
        editTool?.onHoverEnter && editTool.onHoverEnter(event)
        break;
      case 'hover':
        editTool?.onHover && editTool.onHover(event)
        break;
      case 'hoverLeave':
        editTool?.onHoverLeave && editTool.onHoverLeave(event)
        break;
      default:
        break;
    }
  }
  onSelect = (event: EditorEvent) => {
    const { type } = event
    const element = event.target!
    const tag = element.editOuter
    const editTool = this.editToolList[tag] = this.editToolList[tag] || EditToolCreator.get(tag, this.editor)
    switch (type) {
      case 'select':
        editTool?.onSelect && editTool.onSelect(event)
        break;
      case 'unselect':
        editTool?.onUnSelect && editTool.onUnSelect(event)
        break;
      default:
        break;
    }
  }

  onKeyDown = (event: KeyEvent) => {
    if(this.dragging || this.editing) return
    const { code } = event.origin as KeyboardEvent
    if (!['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(code)) return
    const { moveSize } = globalConfig
    const distance = this.editor.tree.getPageLenByWorld(moveSize, 0).x
    switch (code) {
      case 'ArrowLeft':
        event.moveX = -distance
        break;
      case 'ArrowRight':
        event.moveX = distance
        break;
      case 'ArrowDown':
        event.moveY = distance
        break;
      case 'ArrowUp':
        event.moveY = -distance
        break;
      default:
        break;
    }
    this.list.forEach(element => {
      const tag = element.editOuter as string
      const editTool = this.editToolList[tag] = this.editToolList[tag] || EditToolCreator.get(tag, this.editor)
      editTool?.onDrag && editTool.onDrag({ ...event, target: element })
    })
    this.editor.dispatchEvent(EditorEvent.DRAG, new EditorEvent('drag', { target: this.list }))
    this.editor.render()
  }


  listen() {
    this.editor.addEventListener(PointerEvent.MOVE, this.onMove)
    this.editor.addEventListener(PointerEvent.DOWN, this.onDown)
    this.editor.addEventListener(PointerEvent.TAP, this.onTap)
    this.editor.addEventListener(DragEvent.START, this.onDragStart)
    this.editor.addEventListener(DragEvent.DRAG, this.onDrag)
    this.editor.addEventListener(DragEvent.END, this.onDragEnd)
    this.editor.addEventListener(PointerEvent.DOUBLE_TAP, this.onDoubleTap)

    this.editor.addEventListener(EditorEvent.HOVER, this.onHover)
    this.editor.addEventListener(EditorEvent.SELECT, this.onSelect)

    this.editor.addEventListener(KeyEvent.DOWN, this.onKeyDown)
  }

  destroy() {
    this.editor.removeEventListener(PointerEvent.MOVE, this.onMove)
    this.editor.removeEventListener(PointerEvent.DOWN, this.onDown)
    this.editor.removeEventListener(PointerEvent.TAP, this.onTap)
    this.editor.removeEventListener(DragEvent.START, this.onDragStart)
    this.editor.removeEventListener(DragEvent.DRAG, this.onDrag)
    this.editor.removeEventListener(DragEvent.END, this.onDragEnd)
    this.editor.removeEventListener(PointerEvent.DOUBLE_TAP, this.onDoubleTap)

    this.editor.removeEventListener(EditorEvent.HOVER, this.onHover)
    this.editor.removeEventListener(EditorEvent.SELECT, this.onSelect)

    this.editor.removeEventListener(KeyEvent.DOWN, this.onKeyDown)

  }


}

