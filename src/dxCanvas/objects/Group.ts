/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-10-13 19:14:05
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-04 17:43:11
 */


import { ChildEvent, IEventListenerId } from "../event";
import { Vector2 } from "../math";
import { TextStyle } from "../style";
import { copyPrimitive, Creator } from "../utils";
import { IObject, Object2D } from "./Object2D";
import { TextType } from "./Text";

type GroupType = TextType & { hitChildren?: boolean }

class Group extends Object2D {
  // 子集
  children: Object2D[] = []
  _style = new TextStyle()
  /** 名称 */
  name = '组'
  /** 子元素是否响应交互事件，默认为 true */
  hitChildren = true
  /** 类型 */
  public get tag() { return 'Group' }
  constructor(attr: GroupType = {}) {
    super()
    this.setOption(attr)
  }

  /* 添加元素 */
  add(...objs: Object2D[]) {
    for (const obj of objs) {
      if (obj === this) {
        return this
      }
      obj.parent && obj.remove()
      obj.parent = this
      this.children.push(obj)
      obj.computeBoundsBox()
    }
    this.sort()
    this.dispatchEvent(ChildEvent.ADD, new ChildEvent('add', { target: this, value: objs }))
    return this
  }

  /* 删除元素 */
  remove(...objs: Object2D[]) {
    const { children } = this
    for (const obj of objs) {
      const index = children.indexOf(obj)
      if (index !== -1) {
        obj.parent = undefined
        this.children.splice(index, 1)
      } else {
        for (const child of children) {
          if (child instanceof Group) {
            child.remove(obj)
          }
        }
      }
    }
    this.dispatchEvent(ChildEvent.REMOVE, new ChildEvent('remove', { target: this, value: objs }))
    return this
  }
  /* 清空children */
  // TODO 可以做销毁，目前是浅清空
  clear() {
    for (const obj of this.children) {
      obj.parent = undefined
    }
    this.dispatchEvent(ChildEvent.REMOVE, new ChildEvent('remove', { target: this, value: this.children.slice() }))
    this.children = []
    return this
  }

  /* 排序 */
  sort() {
    const { children } = this
    children.sort((a, b) => {
      return a.index - b.index
    })
    for (const child of children) {
      child instanceof Group && child.sort()
    }
  }

  /* 根据名称获取元素 */
  getObjectByName(name: string) {
    return this.getObjectByProperty('name', name)
  }
  /* 根据id获取元素 */
  getObjectById(id: string) {
    return this.getObjectByProperty('uuid', id)
  }

  /* 根据某个属性的值获取子对象 */
  getObjectByProperty<T>(name: string, value: T): Object2D | undefined {
    const { children } = this
    for (let i = 0, l = children.length; i < l; i++) {
      const child = children[i]
      if (child[name] === value) {
        return child
      } else if (child instanceof Group) {
        const obj = child.getObjectByProperty<T>(name, value)
        if (obj) {
          return obj
        }
      }
    }
    return undefined
  }

  /* 遍历元素 */
  traverse(callback: (obj: Object2D) => void) {
    callback(this)
    const { children } = this
    for (const child of children) {
      if (child instanceof Group) {
        child.traverse(callback)
      } else {
        callback(child)
      }
    }
  }

  /* 遍历可见元素 */
  traverseVisible(callback: (obj: Object2D) => void) {
    if (!this.visible) {
      return
    }
    callback(this)
    const { children } = this
    for (const child of children) {
      if (!child.visible) {
        continue
      }
      if (child instanceof Group) {
        child.traverse(callback)
      } else {
        callback(child)
      }
    }
  }

  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const { children } = this
    // 应用样式
    this.applyStyle(ctx)
    /* 绘制子对象 */
    for (const obj of children) {
      obj.draw(ctx)
    }
  }

  computeBoundsBox = (updateChildBoundsBox = false) => {
    const { children, bounds } = this
    bounds.clear()
    children.forEach(object => {
      updateChildBoundsBox && object.computeBoundsBox(false)
      bounds.expand(object.bounds.min, object.bounds.max)
    })
    this.parent?.computeBoundsBox()
  }

  /** 点位是否在图形中 */
  isPointInGraph(mp: Vector2) {
    const { children, hitChildren } = this
    for (let obj of [...children].reverse()) {
      const child = obj.isPointInGraph(mp)
      if (child) return hitChildren ? child : obj
    }
    return false
  }

  toJSON() {
    const object = super.toJSON();
    object.children = this.children.map(item => item.toJSON())
    return object
  }
  clone(): Group {
    const data = this.toJSON()
    return Group.one(data)
  }
  static one(data: IObject): Group {
    return new Group({
      ...data,
      children: data.children.map((item: IObject) => Creator.get(item.tag).one(item))
    })
  }


  destroy() {
    this.removeAllListeners()
    this.children.forEach((obj) => obj.destroy())
  }



}
export { Group }