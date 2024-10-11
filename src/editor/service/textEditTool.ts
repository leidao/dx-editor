/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-27 16:04:35
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-11 14:25:59
 */
import { IEventListenerId, IFill, IRGB, IText, ITextAlign, ITextCase, IVerticalAlign } from '@leafer-ui/interface';
import globalConfig from '../config'
import EditTool, { HoverEvent, SelectEvent } from "./editTool";
import { registerEditTool, PointerEvent, Matrix, MoveEvent, ZoomEvent, ResizeEvent, PropertyEvent, ColorConvert, LayoutEvent } from "leafer-editor";




@registerEditTool()
export default class TextEditTool extends EditTool {
  public get tag() { return 'textEditTool' }
  editDom?: HTMLDivElement
  textScale: number = 1
  eventIds: IEventListenerId[] = []

  onHoverEnter(event: HoverEvent) {
    const { element } = event
    element.cursor = 'all-scroll';
    element.fill = element.data?.hoverColor || ''
  }
  onHover(event: HoverEvent) {
    // ew-resize 'ns-resize'
  }
  onHoverLeave(event: HoverEvent) {
    const { element } = event
    if (this.selector.leafList.has(element)) return
    element.cursor = 'auto';
    element.fill = element.data?.sourceColor || ''
  }

  onSelect(event: SelectEvent) {
    const { element } = event
    element.cursor = 'all-scroll';
    element.fill = element.data?.selectColor || ''
    element.data && (element.data.state = 'select')

  }
  onUnSelect(event: SelectEvent) {
    const { element } = event;
    element.fill = element.data?.sourceColor || ''
    element.data && (element.data.state = 'none')
  }

  openInnerEditor() {
    const text = this.selector.element as any as IText
    text.visible = false

    const div = this.editDom = document.createElement('div')
    const { style } = div
    div.contentEditable = 'true'
    style.position = 'fixed' // 防止文本输入到边界时产生滚动
    style.transformOrigin = 'left top'
    style.boxSizing = 'border-box'

    div.innerText = text.text || ''

    const { scaleX, scaleY } = text.worldTransform
    this.textScale = Math.max(Math.abs(scaleX), Math.abs(scaleY))

    const fontSize = (text.fontSize || 12) * this.textScale
    if (fontSize < 12) this.textScale *= 12 / fontSize;

    (this.selector.app.view as HTMLDivElement).appendChild(div)

    this.eventIds = [
      this.selector.app.on_(PointerEvent.DOWN, (e: PointerEvent) => {
        let { target } = e.origin, find: boolean = false
        while (target) {
          if (target === div) find = true
          target = target.parentElement
        }
        if (!find) this.selector.closeInnerEditor()
      }),
      // this.selector.app.tree.on_(MoveEvent.MOVE, this.onUpdate),
      // this.selector.app.tree.on_(ZoomEvent.ZOOM, this.onUpdate),
      // this.selector.app.tree.on_(ResizeEvent.RESIZE, this.onUpdate),
      this.selector.app.tree.on_(LayoutEvent.AFTER, this.onUpdate),
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
  }
  onInput = () => {
    const { editDom } = this
    const text = this.selector.element as any as IText
    text.text = editDom!.innerText.replace(/\n\n/, '\n')
    text.updateLayout()
  }

  onFocus = () => {
    this.editDom!.style.outline = 'none'
  }

  onEscape = (e: KeyboardEvent) => {
    if (e.code === 'Escape') this.selector.closeInnerEditor()
  }
  onUpdate = () => {
    const { textScale,selector } = this
    const text = this.selector.element as any as IText
    text.updateLayout()
    const { style } = this.editDom!
    const { x = 0, y = 0 } = text.app.tree?.clientBounds || {}
    const { a, b, c, d, e, f } = new Matrix(text.worldTransform).scale(1 / textScale)
    const {width,height} = text.boxBounds
    style.transform = `matrix(${a},${b},${c},${d},${e},${f})`
    style.left = x - window.scrollX + 'px'
    style.top = y - window.scrollY + 'px'
    style.width = width * textScale + (text.__.__autoWidth ? 20 : 0) + 'px'
    style.height = height * textScale + (text.__.__autoHeight ? 20 : 0) + 'px'
    updateStyle(this.editDom!, text, this.textScale)
  }

  closeInnerEditor() {
    const text = this.selector.element as any as IText
    if (text) {
      this.onInput()
      text.visible = true
      this.selector.app.off_(this.eventIds)
      this.editDom!.removeEventListener("focus", this.onFocus)
      this.editDom!.removeEventListener("input", this.onInput)
      window.removeEventListener('keydown', this.onEscape)
      window.removeEventListener('scroll', this.onUpdate)
      this.editDom!.remove()
      this.eventIds = []
      this.editDom = undefined
    }
  }
}

export const textCaseMap = {
  'none': 'none',
  'title': 'capitalize',
  'upper': 'uppercase',
  'lower': 'lowercase',
  'small-caps': 'small-caps'
}

export const verticalAlignMap = {
  'top': 'flex-start',
  'middle': 'center',
  'bottom': 'flex-end'
}


const updateStyle = (textDom: HTMLDivElement, text: IText, textScale: number) => {
  const { style } = textDom
  const { fill, padding, textWrap, textOverflow, textDecoration } = text

  style.fontFamily = text.fontFamily || ''
  style.fontSize = (text.fontSize || 12) * textScale + 'px'
  setFill(style, fill!)

  style.fontStyle = text.italic ? 'italic' : 'normal'
  style.fontWeight = text.fontWeight as string
  style.textDecoration = textDecoration === 'delete' ? 'line-through' : textDecoration || ''
  style.textTransform = textCaseMap[text.textCase as ITextCase]

  style.textAlign = text.textAlign as ITextAlign
  style.display = 'flex'
  style.flexDirection = 'column'
  style.justifyContent = verticalAlignMap[text.verticalAlign as IVerticalAlign]

  style.lineHeight = (text.__.__lineHeight || 0) * textScale + 'px'
  style.letterSpacing = (text.__.__letterSpacing || 0) * textScale + 'px'
  if (textWrap === 'none') {
    style.whiteSpace = 'nowrap'
  } else if (textWrap === 'break') {
    style.wordBreak = 'break-all'
  }

  style.textIndent = (text.paraIndent || 0) * textScale + 'px'
  style.padding = padding instanceof Array ? padding.map(item => item * textScale + 'px').join(' ') : (padding || 0) * textScale + 'px'
  style.textOverflow = textOverflow === 'show' ? '' : (textOverflow === 'hide' ? 'clip' : textOverflow as string)

}
const setFill = (style: CSSStyleDeclaration, fill: IFill) => {
  let color: string = 'black'

  if (fill instanceof Array) fill = fill[0]

  if (typeof fill === 'object') {

    switch (fill.type) {
      case 'solid':
        color = ColorConvert.string(fill.color)
        break
      case 'image':
        break
      case 'linear':
      case 'radial':
      case 'angular':
        const stop = fill.stops[0]
        color = ColorConvert.string(typeof stop === 'string' ? stop : stop.color)
        break
      default:
        if ((fill as IRGB).r !== undefined) color = ColorConvert.string(fill)
    }

  } else {
    color = fill
  }

  style.color = color
}