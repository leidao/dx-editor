/*
 * @Description: 历史记录
 * @Author: ldx
 * @Date: 2023-12-09 18:58:58
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-04 10:21:22
 */
// import { DragEvent, KeyEvent } from 'leafer-ui'
import { Object2D } from '@/dxCanvas'
import { EditorView } from '@/dxEditor'
import { EditorEvent } from '@/dxEditor/event'
import { produce, enablePatches, applyPatches, Patch } from "immer"
// import { InnerEditorEvent } from 'leafer-editor'
import _ from 'lodash'
// import { IKeyEvent } from '@leafer-ui/interface'

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
  collect = new Map<string,Object2D>()
  constructor(private editor: EditorView) {
    enablePatches()
    this.listen()
  }
  listen() {
    this.editor.addEventListener(EditorEvent.ADD, this.change)
    this.editor.addEventListener(EditorEvent.REMOVE, this.change)
    this.editor.addEventListener(EditorEvent.UPDATE, this.change)
  }
  destroy() {
    this.editor.removeEventListener(EditorEvent.ADD, this.change)
    this.editor.removeEventListener(EditorEvent.REMOVE, this.change)
    this.editor.removeEventListener(EditorEvent.UPDATE, this.change)
  }
  change = () => {
    const json = this.editor.tree.toJSON()
    const data: { [key: string]: any } = {}
    json.children?.forEach((child: any) => data[child.uuid] = child)

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
      // patches.forEach(item => {
      //   const { op, path, value } = item
      //   if (op === 'remove') {
      //     for (let i = 0; i < path.length; i++) {
      //       const key = path[i] as string;
      //       if (key.startsWith('id:') && path.length - 1 === i) {
      //         const element = this.editor.tree.getObjectById(key)
      //         if(!element) return
      //         this.collect.set(key,element)
      //       }
      //     }
      //   }
      // })
      // console.log('inversePatches', inversePatches);
      // console.log('this.queue', this.queue);
    })
    this.editor.dispatchEvent(EditorEvent.HISTORY_CHANGE, new EditorEvent('redo'))
    // console.log('nextState', this.initialState);
  }

  redo = () => {
    const cmd = this.queue[this.current + 1] // 找到当前的下一步还原操作
    // console.log('redo=====', cmd?.redo, cmd);

    if (cmd) {
    //   cmd.redo.forEach(item => {
    //     const { op, path, value } = item
    //     if (op === 'replace') {
    //       let element: any
    //       for (let i = 0; i < path.length - 1; i++) {
    //         const key = path[i] as string;
    //         if (key.startsWith('id:')) {
    //           element = this.editor.tree.getObjectById(key)
    //         } else {
    //           element = element[key]
    //         }
    //       }
    //       element[path[path.length - 1]] = value
    //     } else if (op === 'add') {
    //       for (let i = 0; i < path.length; i++) {
    //         const key = path[i] as string;
    //         if (key.startsWith('id:') && path.length - 1 === i) {
    //           const element = this.collect.get(key)
    //           if(!element) return
    //           if(path.length === 1){
    //             this.editor.tree.add(element)
    //           }
    //           element.parent?.add(element)
    //         }
    //       }
          
    //     }
    //   })
      this.initialState = produce(this.initialState, draft => {
        applyPatches(draft, cmd.redo);
      })
      const children = Object.values(this.initialState)
      this.editor.exportJson(children)
      this.current++
      this.editor.selector.cancel()
      // const selectChildren = children.filter(item => item.state === 'select')
      // if (selectChildren.length > 0) {
      //   const list = selectChildren.map(item => this.editor.tree.getObjectById(item.uuid)).filter(v => !!v)
      //   console.log('list',list);
        
      //   this.editor.selector.select(...list)
      // } else {
      //   this.editor.selector.cancel()
      // }
      // this.editor.tree.render()
      this.editor.dispatchEvent(EditorEvent.HISTORY_CHANGE, new EditorEvent('redo'))
    }
  }
  undo = () => {
    const cmd = this.queue[this.current] // 找到上一步还原
    // console.log('undo=====', cmd?.undo, cmd);
    if (cmd) {
      this.initialState = produce(this.initialState, draft => {
        applyPatches(draft, cmd.undo);
      })
      const children = Object.values(this.initialState)
      this.editor.exportJson(children)
      this.current--
      this.editor.selector.cancel()
      // const selectChildren = children.filter(item => item.state === 'select')
      // if (selectChildren.length > 0) {
      //   const list = selectChildren.map(item => this.editor.tree.getObjectById(item.uuid)).filter(v => !!v)
      //   console.log('list22',list);
      //   this.editor.selector.select(...list)
      // } else {
      //   this.editor.selector.cancel()
      // }
      // this.editor.tree.render()
      this.editor.dispatchEvent(EditorEvent.HISTORY_CHANGE, new EditorEvent('undo'))
    }
  }
}
