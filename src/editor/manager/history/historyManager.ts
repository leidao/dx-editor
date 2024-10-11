/*
 * @Description: 历史记录
 * @Author: ldx
 * @Date: 2023-12-09 18:58:58
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-11 15:53:10
 */
import { DragEvent, KeyEvent } from 'leafer-ui'
import { EditorView } from '../../editor'
import { produce, enablePatches, applyPatches, Patch } from "immer"
import { InnerEditorEvent } from 'leafer-editor'
import _ from 'lodash'
import { IKeyEvent } from '@leafer-ui/interface'

export type Queue = { [key: number]: { redo: Patch[], undo: Patch[] } }

function isPlainValue(data: any) {
  return !(Object.prototype.toString.call(data) === '[object Object]' || Array.isArray(data))
}
const deepCompareAndMerge = (draft: any, data: any) => {
  const mergeData = { ...draft, ...data }
  // TODO 比较老数据和新数据的变化，这里只做了一层比较，后续做改造
  Object.keys(mergeData).forEach(key => {
    // 新的有，老得没有，直接赋值
    if (!draft[key]) {
      draft[key] = data[key]
    } else if (!data[key]) {
      // 新的没有，老得有，直接删除
      delete draft[key]
    } else {
      if (isPlainValue(draft[key]) && isPlainValue(data[key])) {
        draft[key] = data[key]
      } else {
        // 两个都有，并且都不是普通值
        deepCompareAndMerge(draft[key], data[key])
      }
    }
  })
}
export default class HistoryManager {
  current = -1 // 前进后退的索引值
  maxQueueValue = 50 // 最大存放数
  queue: Queue = {} //  存放所有的操作命令
  initialState: { [key: string]: any } = {}
  constructor(private editor: EditorView) {
    enablePatches()
    this.listen()
  }
  listen() {
    // 直接监听ChildEvent.ADD不合适，比如文字的添加/线段的绘制，都是当前绘制完成后才发布add事件
    this.editor.app.tree.on('add', this.change)
    // set(json)会触发add事件，所以需要自己在需要的地方发布remove事件
    this.editor.app.tree.on('reomve', this.change)
    // 直接监听PropertyEvent.CHANGE的话图形的拖拽/旋转等操作会多次触发，因此也是自己在合适的时机去手动发布update事件
    this.editor.app.tree.on('update', this.change)


  }
  destroy() {
    this.editor.app.tree.off('add', this.change)
    this.editor.app.tree.off('reomve', this.change)
    this.editor.app.tree.off('update', this.change)
  }
  onKeydown = (event: IKeyEvent) => {
    if (
      event.origin?.target instanceof HTMLInputElement ||
      event.origin?.target instanceof HTMLTextAreaElement
    ) {
      // event.stop && event.stop()
      // event.stopDefault && event.stopDefault()
      return
    }
    const { key, shiftKey, altKey, ctrlKey, metaKey } = event
    const keyString: string[] = []
    if (ctrlKey || metaKey) keyString.push('ctrl')
    if (shiftKey) keyString.push('shift')
    if (altKey) keyString.push('alt')
    const keyCode = key?.toLocaleLowerCase()
    if (keyCode) {
      if (!keyString.includes(keyCode)) {
        keyString.push(keyCode)
      }
    }
    const keyName = keyString.join('+')
    if (keyName === 'ctrl+z') {
      this.undo()
    } else if (keyName === 'ctrl+shift+z') {
      this.redo()
    }
  }
  patch(){
    const json = _.cloneDeep(this.editor.app.tree.toJSON())
    this.initialState = produce(this.initialState, draft => {
      json.children?.forEach((child: any) => draft[child.id] = child)
    })
  }
  change = () => {
    const json = _.cloneDeep(this.editor.app.tree.toJSON())
    const data: { [key: string]: any } = {}
    json.children?.forEach((child: any) => data[child.id] = child)
    
    this.initialState = produce(this.initialState, draft => {

      deepCompareAndMerge(draft, data)

    }, (patches, inversePatches) => {
      // 没有任何变化
      if (patches.length === 0 && inversePatches.length === 0) return
      this.current++;
      this.queue[this.current] = {
        redo: patches,
        undo: inversePatches
      }
      // 把后一个操作删除，不能在反撤销了，cmd不存在直接return
      delete this.queue[this.current + 1];
      // 超出最大队列的删除
      delete this.queue[this.current - this.maxQueueValue];
      // console.log('patches', patches);
      // console.log('inversePatches', inversePatches);
      // console.log('this.queue', this.queue);
    })
    this.editor.app.emit('historyChange', { queue: this.queue, current: this.current })
    // console.log('nextState', this.initialState);
  }

  redo = () => {
    const cmd = this.queue[this.current + 1] // 找到当前的下一步还原操作
    // console.log('redo=====',cmd?.redo,cmd);

    if (cmd) {
      this.initialState = produce(this.initialState, draft => {
        applyPatches(draft, cmd.redo);
      })
      const data = {
        hitChildren: true,
        tag: "Leafer",
        children: _.cloneDeep(Object.values(this.initialState))
      }
      // const hoverId = this.editor.selector.hoverTarget?.id
      this.editor.app.tree.set(data)
      this.current++
      const selectChildren = data.children.filter(item=>item.data.state === 'select')
      if (selectChildren.length > 0) {
        const list = selectChildren.map(item => this.editor.app.tree.findId(item.id)).filter(v => !!v)
        this.editor.selector.select(list)
      }else{
        this.editor.selector.cancel()
      }
      this.editor.app.emit('selectChange')
      this.editor.app.emit('historyChange', { queue: this.queue, current: this.current })
    }
  }
  undo = () => {
    const cmd = this.queue[this.current] // 找到上一步还原
    // console.log('undo=====',cmd?.undo,cmd);
    if (cmd) {
      this.initialState = produce(this.initialState, draft => {
        applyPatches(draft, cmd.undo);
      })
      const data = {
        hitChildren: true,
        tag: "Leafer",
        children: _.cloneDeep(Object.values(this.initialState))
      }
      this.editor.app.tree.set(data)
      this.current--
      const selectChildren = data.children.filter(item=>item.data.state === 'select')
      if (selectChildren.length > 0) {
        const list = selectChildren.map(item => this.editor.app.tree.findId(item.id)).filter(v => !!v)
        this.editor.selector.select(list)
      }else{
        this.editor.selector.cancel()
      }
      this.editor.app.emit('selectChange')
      this.editor.app.emit('historyChange', { queue: this.queue, current: this.current })
    }
  }
}
