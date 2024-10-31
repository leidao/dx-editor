/*
 * @Description: 操作图形
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-31 16:24:28
 */

import { EditorView } from '@/dxEditor'
import ToolBase from './toolBase'
import { DragEvent, EditorEvent, KeyEvent, PointerEvent } from '@/dxEditor/event'
import { IPointerEvent } from '@/dxCanvas/event'
import { getClosestTimesVal, loadSVG, toURL } from '../utils'
import globalConfig from '@/dxEditor/config'
import { Img } from '@/dxCanvas'
export default class ToolAddPic extends ToolBase {
  readonly type = 'addPic'
  image?: Img
  constructor(editor: EditorView) {
    super(editor)
  }
  onTap = (event: PointerEvent) => {
    if (!this.image) return
    // 获取world坐标
    const { clientX, clientY } = event.origin as IPointerEvent
    const worldPoint = this.editor.tree.getWorldByClient(clientX, clientY)
    // 获取网格的倍数坐标
    const x = getClosestTimesVal(worldPoint.x - this.image.size.x / 2, globalConfig.moveSize)
    const y = getClosestTimesVal(worldPoint.y - this.image.size.y / 2, globalConfig.moveSize)
    this.image.position.set(x, y)
    this.image.computeBoundsBox(true)
    this.editor.tree.render()
    this.editor.dispatchEvent(EditorEvent.ADD, new EditorEvent('add', { target: this.image }))
    this.editor.tool.setActiveTool('operationGraph')
  }
  onMove = (event: PointerEvent) => {
    if (!this.image) return
    const { clientX, clientY } = event.origin as IPointerEvent
    const worldPoint = this.editor.tree.getWorldByClient(clientX, clientY)
    const x = getClosestTimesVal(worldPoint.x - this.image.size.x / 2, globalConfig.moveSize)
    const y = getClosestTimesVal(worldPoint.y - this.image.size.y / 2, globalConfig.moveSize)
    this.image.position.set(x, y)
    this.image.computeBoundsBox(true)
    this.editor.tree.render()
  }

  onKeydown = (event: KeyEvent) => {
    const { code } = event.origin as KeyboardEvent
    switch (code) {
      case 'Escape':
        if (this.image) {
          this.editor.tree.remove(this.image)
          this.image = undefined
          this.editor.tree.render()
        }
        this.editor.tool.setActiveTool('operationGraph')
        break;
      default:
        break;
    }
  }
  active(src: string) {
    loadSVG(src).then(svgDocument => {
      const svg = svgDocument.querySelectorAll('svg');
      // 获取svg的大小
      const width = +(svg[0].getAttribute('width') || 70)
      const height = +(svg[0].getAttribute('height') || 50)
      // 查找所有灰色圆点
      const viewBox = svg[0].getAttribute('viewBox')
      const pixel = (viewBox?.split(' ') || []).map(Number)
      const circles = svgDocument.querySelectorAll('ellipse[fill="#4F4F4F"]');

      let data: any[] = []
      circles.forEach((circle) => {
        circle.setAttribute('fillOpacity', '0')
        circle.setAttribute('fill', 'none')
        const cx = +(circle.getAttribute('cx') || 0);
        const cy = +(circle.getAttribute('cy') || 0);
        data.push({ x: cx - pixel[0], y: cy - pixel[1] })
      });

      // 使用 XMLSerializer 将 SVG 文档转换为字符串
      const serializer = new XMLSerializer();
      const sourceFile = serializer.serializeToString(svgDocument);

      let updateFile = sourceFile
      if (/stroke="#A00100"/.test(updateFile)) {
        updateFile = updateFile.replace(/stroke="#A00100"/g, `stroke="#ff0000"`);
      }
      if (/fill="#A00100"/.test(updateFile)) {
        updateFile = updateFile.replace(/fill="#A00100"/g, `fill="#ff0000"`);
      }
      if (/fill="none"/.test(updateFile)) {
        updateFile = updateFile.replace(/fill="none"/g, `fill="#4f4f4f4d"`);
      }

      // 让图元坐标为网格的倍数

      const defalutSrc = toURL(sourceFile, 'svg')
      const hoverSrc = toURL(updateFile, 'svg')
      this.image = new Img({
        name: '图片',
        // position: [x, y],
        src: defalutSrc,
        size: [width, height],
        style: {
          src: defalutSrc,
        },
        hoverStyle: {
          src: hoverSrc
        },
        selectStyle: {
          src: hoverSrc
        }
      })
      this.editor.tree.add(this.image)
    })
    this.editor.selector.hittable = false
    this.editor.guideline.visible = true
    this.editor.addEventListener(PointerEvent.TAP, this.onTap)
    this.editor.addEventListener(PointerEvent.MOVE, this.onMove)
    this.editor.addEventListener(KeyEvent.HOLD, this.onKeydown)
  }
  inactive() {
    this.editor.selector.hittable = true
    this.editor.guideline.visible = false
    this.editor.removeEventListener(PointerEvent.TAP, this.onTap)
    this.editor.removeEventListener(PointerEvent.MOVE, this.onMove)
    this.editor.removeEventListener(KeyEvent.HOLD, this.onKeydown)
  }
}

