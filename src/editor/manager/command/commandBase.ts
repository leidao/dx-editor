/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-08-22 10:03:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-08-29 16:29:05
 */
import { EditorView } from "@/editor/view"

type Option = {
  type: string
  id: number
  name: string
}
//命令基类（编辑的对象）
export default abstract class CommandBase {
  abstract name:string //命令的名称
  inMemory = false //命令是否放入队列中允许撤销和重做

  constructor() {}
  abstract undo(): void
  abstract redo(): void
  
}
