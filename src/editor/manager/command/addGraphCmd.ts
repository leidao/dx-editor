/*
 * @Description:添加图形
 * @Author: ldx
 * @Date: 2024-08-29 16:12:15
 * @LastEditors: ldx
 * @LastEditTime: 2024-08-29 16:28:40
 */
import { EditorView } from "@/editor/view";
import CommandBase from "./commandBase";
import { UI } from "leafer-ui";

export default class AddGraphCmd extends CommandBase {
  name = 'addGraphCmd'
  constructor(private view: EditorView,private graph:UI) {
    super()
  }
  redo(): void {
    this.view.app.tree.add(this.graph)
  }
  undo(): void {
    this.view.app.tree.remove(this.graph)
  }
}