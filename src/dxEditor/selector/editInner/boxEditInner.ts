/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-27 16:04:35
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-05 13:45:52
 */

import { alignRatio, baselineRatio, IEventListenerId, IPointerEvent, Matrix3, OrbitEvent, Text } from "@/dxCanvas"
import { PointerEvent } from "@/dxEditor/event"
import EditTool from "../editTool/editTool"
import { updateStyle } from "./textEditInner"

export default class BoxEditInner extends EditTool {

  public get tag() { return 'BoxEditInner' }
  editDom?: HTMLDivElement
  container?: HTMLDivElement
  textScale: number = 1
  eventIds: IEventListenerId[] = []

  openInnerEditor() {
    const element = this.editor.selector.element
    const text = element.children[0] as Text
    text.visible = false

    const { left, top, width, height } = this.editor.domElement.getBoundingClientRect()

    const container = this.container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.transformOrigin = 'left top'
    container.style.boxSizing = 'border-box'
    container.style.left = `${left + 20}px`
    container.style.top = `${top + 20}px`
    container.style.width = `${width - 20}px`
    container.style.height = `${height - 20}px`
    container.style.clipPath = 'inset(0px 0px 0px 0px)'

    const div = this.editDom = document.createElement('div')
    const { style } = div
    div.contentEditable = 'true'
    style.position = 'fixed' // 防止文本输入到边界时产生滚动
    style.transformOrigin = 'left top'
    style.boxSizing = 'border-box'
    style.lineHeight = '1'

    div.innerText = text.getText()

    const { x: scaleX, y: scaleY } = text.worldScale
    this.textScale = Math.max(Math.abs(scaleX), Math.abs(scaleY))

    const fontSize = (text._style.fontSize || 12) * this.textScale
    if (fontSize < 12) this.textScale *= 12 / fontSize

    this.editor.domElement.appendChild(container)
    container.appendChild(div)

    this.eventIds = [
      this.editor.on(PointerEvent.DOWN, (e: PointerEvent) => {
        let { target } = e.origin as IPointerEvent
        let find: boolean = false
        while (target) {
          if (target === div) find = true
          target = (target as any).parentElement
        }
        if (!find) this.editor.selector.closeInnerEditor()
      }),
      this.editor.orbitControler.on(OrbitEvent.CHANGE, this.onUpdate),
    ]

    div.addEventListener("focus", this.onFocus)
    div.addEventListener("input", this.onInput)
    window.addEventListener('keydown', this.onEscape)
    window.addEventListener('scroll', this.onUpdate)


    const selection = window.getSelection()!
    const range = document.createRange()

    range.selectNodeContents(div)

    selection.removeAllRanges()
    selection.addRange(range)
    this.onUpdate()
    this.editor.tree.render()
  }
  onInput = () => {
    const { editDom } = this
    const element = this.editor.selector.element
    const text = element.children[0] as Text
    text.setText(editDom!.innerText.replace(/\n\n/, '\n'))
    this.onUpdate()
    text.computeBoundsBox(true)
    this.editor.tree.render()
  }

  onFocus = () => {
    this.editDom!.style.outline = 'none'
  }

  onEscape = (e: KeyboardEvent) => {
    if (e.code === 'Escape') this.editor.selector.closeInnerEditor()
  }
  onUpdate = () => {
    const element = this.editor.selector.element
    const text = element.children[0] as Text
    const { style } = this.editDom!
    const { x = 0, y = 0 } = this.editor.domElement.getBoundingClientRect() || {}
    const { textScale } = this
    const [a, b, , c, d, , e, f] = new Matrix3().copy(text.pvmMatrix).scale(1 / textScale, 1 / textScale).elements
    let { width, height } = text.bounds
    width = width * textScale + 10
    height = height * textScale + 0
    const textBaseline = text.style.textBaseline || 'top'
    const textAlign = text.style.textAlign || 'start'
    style.transform = `matrix(${a},${b},${c},${d},${e + ((width) * d) * alignRatio[textAlign]},${f + ((height - 0.5) * d) * baselineRatio[textBaseline]})`
    style.left = x - window.scrollX + 'px'
    style.top = y - window.scrollY + 'px'
    style.width = width + 'px'
    style.height = height + 'px'
    updateStyle(this.editDom!, text, this.textScale)
  }

  closeInnerEditor() {
    const element = this.editor.selector.element
    const text = element.children[0] as Text
    if (text) { text.visible = true; this.onInput() }
    this.editor.off(this.eventIds)
    this.editDom!.removeEventListener("focus", this.onFocus)
    this.editDom!.removeEventListener("input", this.onInput)
    window.removeEventListener('keydown', this.onEscape)
    window.removeEventListener('scroll', this.onUpdate)
    this.editDom!.remove()
    this.container!.remove()
    this.eventIds = []
    this.editDom = undefined
    this.container = undefined
    this.editor.tree.render()
  }
}

