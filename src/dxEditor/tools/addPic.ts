/*
 * @Description: 操作图形
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-05 16:21:13
 */

import { EditorView } from '@/dxEditor'
import ToolBase from './toolBase'
import { EditorEvent, KeyEvent, PointerEvent } from '@/dxEditor/event'
import { IPointerEvent } from '@/dxCanvas/event'
import { getClosestTimesVal, loadSVG, toURL } from '../utils'
import globalConfig from '@/dxEditor/config'
import { Img } from '@/dxCanvas'
export default class ToolAddPic extends ToolBase {
  readonly type = 'addPic'
  image?: Img
  private activationId = 0
  constructor(editor: EditorView) {
    super(editor)
  }
  onTap = (event: PointerEvent) => {
    const image = this.image
    if (!image) return
    // 获取world坐标
    const { clientX, clientY } = event.origin as IPointerEvent
    const worldPoint = this.editor.tree.getWorldByClient(clientX, clientY)
    // 获取网格的倍数坐标
    const x = getClosestTimesVal(worldPoint.x - image.size.x / 2, globalConfig.moveSize)
    const y = getClosestTimesVal(worldPoint.y - image.size.y / 2, globalConfig.moveSize)
    this.editor.sky.remove(image)
    this.image = undefined
    image.position.set(x, y)
    this.editor.tree.add(image)
    this.editor.tree.render()
    this.editor.dispatchEvent(EditorEvent.ADD, new EditorEvent('add', { target: image }))
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
    this.editor.sky.render()
  }

  onKeydown = (event: KeyEvent) => {
    const { code } = event.origin as KeyboardEvent
    switch (code) {
      case 'Escape':
        this.editor.tool.setActiveTool('operationGraph')
        break;
      default:
        break;
    }
  }
  active(src: string) {
    const activationId = ++this.activationId
    loadSVG(src).then(svgDocument => {
      if (activationId !== this.activationId) return
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
        },
        userData: { ellipseData: data, portSize: [width, height] }
      })
      this.editor.sky.add(this.image)
      this.editor.sky.render()
    }).catch(() => {
      if (activationId === this.activationId) this.editor.tool.setActiveTool('operationGraph')
    }).finally(() => {
      if (src.startsWith('blob:')) URL.revokeObjectURL(src)
    })
    this.editor.selector.hittable = false
    this.editor.guideline.visible = true
    this.editor.sky.render()
    this.editor.addEventListener(PointerEvent.TAP, this.onTap)
    this.editor.addEventListener(PointerEvent.MOVE, this.onMove)
    this.editor.addEventListener(KeyEvent.HOLD, this.onKeydown)
  }
  inactive() {
    this.activationId++
    if (this.image) {
      this.editor.sky.remove(this.image)
      this.image = undefined
    }
    this.editor.selector.hittable = true
    this.editor.guideline.visible = false
    this.editor.sky.render()
    this.editor.removeEventListener(PointerEvent.TAP, this.onTap)
    this.editor.removeEventListener(PointerEvent.MOVE, this.onMove)
    this.editor.removeEventListener(KeyEvent.HOLD, this.onKeydown)
  }
}
