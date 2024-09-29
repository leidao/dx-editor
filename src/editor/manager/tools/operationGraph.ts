/*
 * @Description: 操作图形
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-29 10:47:05
 */

import { EditorView } from '@/editor/view'
import ToolBase from './toolBase'
import { Line, DragEvent, Bounds, Group, UI, registerUI, Ellipse, Direction9, PointerEvent } from 'leafer-editor';
import { EditorScaleEvent, EditTool, LineEditTool, registerEditTool } from '@leafer-in/editor'
import { IEditorMoveEvent } from '@leafer-in/interface'
import _ from 'lodash';
import { AABB, getMaxMin } from '@/editor/utils';
import { updateAuxiliaryLine, updateLinePoints, leafList, calculatedAdsorptionEffect } from './common';
const { left, right } = Direction9



export default class ToolOperationGraph extends ToolBase {
  readonly keyboard = 'a'
  readonly type = 'operationGraph'
  constructor(view: EditorView) {
    super(view)
    // Line.setEditOuter('CustomLineEditTool')
    // UI.setEditOuter('CustomEditTool')
  }


  active() {
    this.app.editor.visible = true
    this.app.tree.hitChildren = true
  }
  inactive() {
    this.app.editor.visible = false
    this.app.tree.hitChildren = false
    this.app.editor.cancel()
  }
}
