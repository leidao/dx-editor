/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-27 16:04:35
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-09 17:53:32
 */
import { ILeafList, IObject, IPointerEvent, IUI } from "@leafer-in/interface"
import { EditToolCreator } from "leafer-editor"
import { App, LeafList, PointerEvent, DragEvent } from "leafer-ui"
import EditTool, { HoverEvent } from "./editTool"


export type SelectEvent = {
  value: LeafList
  oldValue: LeafList
  type: 'select' | 'unSelect'
  event: PointerEvent
}

export default class EditSelect {

  hoverTarget: IUI | null = null
  target: IUI | IUI[] | null = null

  editToolList: IObject = {}

  // 列表
  get list(): IUI[] { return this.leafList.list as IUI[] }
  leafList: ILeafList = new LeafList() // from target

  // 状态
  get multiple(): boolean { return this.list.length > 1 }
  dragging: boolean = false
  hitChildren: boolean = true
  downData: any

  // 组件
  get element() { return this.multiple ? this.list : this.list[0] as IUI }
  needRemoveItem: IUI | null = null


  constructor(public app: App) {
    this.listen()
  }

  setHoverTarget(target?: IUI) {
    if(!target) return
    if(this.hoverTarget){
      this.app.emit('EditSelect.hover', { element: this.hoverTarget, type: 'hoverLeave', event: null })
    }
    this.app.emit('EditSelect.hover', { element: target, type: 'hoverEnter', event: null })
    this.hoverTarget = target
  }
  // select 
  select(target?: IUI | IUI[]): void {
    if(!target) return
    const array = Array.isArray(target) ? target : [target]
    const oldList = this.leafList.clone()
    this.leafList.reset()
    array.forEach(item => this.leafList.add(item))
    this.app.emit('EditSelect.select', { value: this.leafList, oldValue: oldList, type: 'select', event: null })
    this.app.emit('selectChange')
    this.target = target
  }
  cancel(): void {
    const oldList = this.leafList.clone()
    this.leafList.reset()
    this.app.emit('EditSelect.select', { value: this.leafList, oldValue: oldList, type: 'select', event: null })
    this.app.emit('selectChange')
    this.target = null
  }

  // item
  public hasItem(item: IUI): boolean {
    return this.leafList.has(item)
  }

  public addItem(item: IUI): void {
    if (!this.hasItem(item) && !item.locked) {
      this.leafList.add(item)
      this.target = this.leafList.list as IUI[]
    }
  }

  public removeItem(item: IUI): void {
    if (this.hasItem(item)) {
      this.leafList.remove(item)
      this.target = this.leafList.list as IUI[]
    }
  }

  public shiftItem(item: IUI): void {
    this.hasItem(item) ? this.removeItem(item) : this.addItem(item)
  }

  findOne(path: ILeafList): IUI {
    return path.list.find((leaf) => leaf.editable) as IUI
  }

  public findDeepOne(e: PointerEvent): IUI {
    return this.findOne(e.target.leafer!.interaction!.findPath(e)) as IUI
  }

  public findUI(e: PointerEvent): IUI {
    return this.isMultipleSelect(e) ? this.findDeepOne(e) : this.findOne(e.path)
  }

  public isMultipleSelect(e: IPointerEvent): boolean {
    return !!e.shiftKey
  }

  // event
  onMove = (event: PointerEvent) => {
    // 不允许选中或者在拖拽中
    if (!this.hitChildren || this.dragging) return
    const { app } = this
    const find = this.findUI(event)
    // 元素存在并且不隐藏
    if (find && find.visible) {
      if (find === this.hoverTarget) {
        // 在元素上移动
        app.emit('EditSelect.hover', { element: find, type: 'hover', event: event })
      } else {
        if (this.hoverTarget) {
          // 离开之前的元素
          app.emit('EditSelect.hover', { element: this.hoverTarget, type: 'hoverLeave', event: event })
          this.hoverTarget = null
        } else {
          // 进入新的元素
          app.emit('EditSelect.hover', { element: find, type: 'hoverEnter', event: event })
          this.hoverTarget = find
        }
      }
    } else if (this.hoverTarget) {
      // 离开之前的元素
      app.emit('EditSelect.hover', { element: this.hoverTarget, type: 'hoverLeave', event: event })
      this.hoverTarget = null
    }
  }

  onDown = (e: PointerEvent) => {
    // 不允许选中
    if (!this.hitChildren) return
    const { app } = this
    const oldList = this.leafList.clone()
    const find = this.findUI(e)
    // 如果hover元素和选中的元素一致，则将hover元素设为null
    // if (this.hoverTarget === find) this.hoverTarget = null
    if (find && find.visible) {
      if (this.isMultipleSelect(e)) {
        if (this.hasItem(find)) {
          // 等待tap事件再实际移除
          this.needRemoveItem = find
          // this.removeItem(find)
        } else {
          this.addItem(find)
        }
      } else {
        this.leafList.reset()
        this.addItem(find)
      }
    } else {
      if (!e.shiftKey) {
        this.leafList.reset()
        this.target = null
      }
    }
    app.emit('EditSelect.select', { value: this.leafList, oldValue: oldList, type: 'select', event: e })
    app.emit('selectChange')
  }
  onTap = (e: PointerEvent) => {
    if (this.needRemoveItem) {
      const { app } = this
      const oldList = this.leafList.clone()
      this.removeItem(this.needRemoveItem)
      this.needRemoveItem = null
      app.emit('EditSelect.select', { value: this.leafList, oldValue: oldList, type: 'select', event: e })
      app.emit('selectChange')
    }
  }

  onDragStart = (e: DragEvent) => {
    const find = this.findUI(e)
    this.dragging = !!(find && find.visible)
    this.downData = e
  }
  onDrag = (e: DragEvent) => {
    if (this.dragging) {
      this.list.forEach(element => {
        const tag = element.editOuter as string
        const editTool = this.editToolList[tag] = this.editToolList[tag] || EditToolCreator.get(tag, this as any)
        editTool?.onMove && editTool.onMove(e)
      })
    }
  }
  onDragEnd = (e: DragEvent) => {
    this.dragging = false
  }
  onHover = (event: HoverEvent) => {
    const { element, type } = event
    const tag = element.editOuter as string
    const editTool = this.editToolList[tag] = this.editToolList[tag] || EditToolCreator.get(tag, this as any)
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
  onSelect = (event: SelectEvent) => {
    const { value, oldValue } = event
    const len = Math.max(value.length, oldValue.length)
    for (let i = 0; i < len; i++) {
      const element = value.indexAt(i) as IUI
      const oldElement = oldValue.indexAt(i) as IUI
      // 新的有，老的列表中也存在新的，这个元素什么也不用做
      if (element && oldValue.has(element)) continue
      // 新的有，老的列表中没有新的，需要添加新的元素
      if (element && !oldValue.has(element)) {
        const tag = element.editOuter as string
        const editTool = this.editToolList[tag] = this.editToolList[tag] || EditToolCreator.get(tag, this as any)
        editTool?.onSelect && editTool.onSelect({ element: element, type: 'select', event: event.event })
      }
      // 老的有，新的元素中没有老的，需要去除老的元素
      if (oldElement && !value.has(oldElement)) {
        const tag = oldElement.editOuter as string
        const editTool = this.editToolList[tag] = this.editToolList[tag] || EditToolCreator.get(tag, this as any)
        editTool?.onUnSelect && editTool.onUnSelect({ element: oldElement, type: 'unSelect', event: event.event })
      }
    }
  }

  listen() {
    this.app.on(PointerEvent.MOVE, this.onMove)
    this.app.on(PointerEvent.DOWN, this.onDown)
    this.app.on(PointerEvent.TAP, this.onTap)
    this.app.on(DragEvent.START, this.onDragStart)
    this.app.on(DragEvent.DRAG, this.onDrag)
    this.app.on(DragEvent.END, this.onDragEnd)

    this.app.on('EditSelect.hover', this.onHover)
    this.app.on('EditSelect.select', this.onSelect)
  }


}
