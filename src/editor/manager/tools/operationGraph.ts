/*
 * @Description: 操作图形
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-09 15:29:45
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
  }
  active() {
    this.view.selector.hitChildren = true
    this.app.tree.hitChildren = true
  }
  inactive() {
    this.view.selector.hitChildren = false
    this.app.tree.hitChildren = false
    this.view.selector.cancel()
  }
}
