
/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-08-20 14:50:58
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-06 17:33:02
 */


import _ from 'lodash'
import globalConfig from './config'
import { loadSVG, getClosestTimesVal, toURL } from './utils'
import { OrbitEvent, OrbitControler, Vector2, Img, Camera, Scene, IObject, Group, Ellipse, Rect, Text, Object2D } from '@/dxCanvas'
import { Ruler, Grid, Guideline } from './objects'
import { EventDispatcher, IPointerEvent } from '@/dxCanvas/event'
import Selector from './selector'
import { MyPointerEvent, MyDragEvent, KeyEvent, EditorEvent } from './event'
import ToolManager from './tools/toolManager'
import KeybordManger, { getkeyName } from './keybord/keybordManger'
import HistoryManager from './history/historyManager'
import CursorManger from './cursor/cursorManager'
import { Creator } from '@/dxCanvas/utils'
import data from './data.json'
import { syncWireConnections } from './wireConnections'
import DocumentSession from './documentSession'
import LineVertexEditor from './lineVertexEditor'

type Option = {
  container: HTMLDivElement
}
export class EditorView extends EventDispatcher {
  domElement!: HTMLDivElement
  /** 相机 */
  camera!: Camera
  /** 背景层 */
  ground!: Scene
  /** 内容层 */
  tree!: Scene
  /** 变化层 */
  sky!: Scene
  /** 控制器 */
  orbitControler!: OrbitControler
  guideline = new Guideline({
    visible: false,
    style: {
      lineWidth: 1,
      strokeStyle: globalConfig.guidelineColor,
      lineDash: [5, 5],
    }
  })
  grid = new Grid()
  ruler!:Ruler
  maskGroup = new Group({ name: '遮罩', index: Infinity, enableCamera: false, style: { globalAlpha: 0.6 } })
  /**  */
  selector = new Selector(this)
  downing: boolean = false
  dragging: boolean = false
  shiftKey: boolean = false
  ctrlKey: boolean = false
  altKey: boolean = false
  rightClick: boolean = false
  downTime = 0
  tapCount = 0
  tapTimer = 0
  tool = new ToolManager(this)
  keybord = new KeybordManger(this)
  history = new HistoryManager(this)
  documentSession!: DocumentSession
  vertexEditor!: LineVertexEditor
  cursor = new CursorManger(this)
  pastetype = ''
  pasteData = new Group({ name: '粘贴组', hitBounds: false, style: { globalAlpha: 0.3 } })
  constructor(option: Option) {
    super()
    if (!option.container) return
    // 场景相关
    this.domElement = option.container
    this.camera = new Camera()
    this.ground = new Scene({ container: this.domElement, camera: this.camera })
    this.tree = new Scene({ container: this.domElement, camera: this.camera })
    this.sky = new Scene({ container: this.domElement, camera: this.camera })
    // 控制器相关
    this.orbitControler = new OrbitControler(this.tree)
    this.orbitControler.maxZoom = 50
    this.orbitControler.minZoom = 0.3

    this.ground.add(this.grid)
    this.ruler = new Ruler(this)
    // this.sky.add(this.maskGroup)
    this.sky.add(this.guideline)
    this.vertexEditor = new LineVertexEditor(this)

    this.exportJson(data.children)
    this.keybord.hotkeys.showAll()
    this.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('add'))
    this.render()

    this.documentSession = new DocumentSession(this)
    this.documentSession.restoreDraft()

    this.listen()

  }
  render = () => {
    syncWireConnections(this.tree)
    requestAnimationFrame(() => {
      this.ground.render()
      this.tree.render()
      this.sky.render()
    })
  }
  onWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      this.orbitControler.wheel(event)
    } else {
      if (!this.orbitControler.enablePan) return
      const down = new PointerEvent('pointerdown', { clientX: 0, clientY: 0 })
      this.orbitControler.pointerdown(down)
      const move = new PointerEvent('pointermove', {
        clientX: -event.deltaX,
        clientY: -event.deltaY
      })
      this.orbitControler.pointermove(move)
      this.orbitControler.pointerup()
    }
  }

  onPointerdown = (event: PointerEvent) => {
    this.downing = true
    this.downTime = Date.now()
    clearTimeout(this.tapTimer)
    this.dispatchEvent(MyPointerEvent.DOWN, new MyPointerEvent('down', event))
  }
  onPointermove = (event: PointerEvent) => {
    this.dispatchEvent(MyPointerEvent.MOVE, new MyPointerEvent('move', event))
    /** 右键按下 */
    if (this.rightClick) return
    if (this.downing) {
      if (!this.dragging) {
        this.dragging = true
        this.dispatchEvent(MyDragEvent.START, new MyDragEvent('start', event))
      } else {
        this.dispatchEvent(MyDragEvent.DRAG, new MyDragEvent('drag', event))
      }
    }
  }
  onPointerup = (event: PointerEvent) => {
    const wasDown = this.downing
    this.downing = false
    if (!wasDown) return
    this.dispatchEvent(MyPointerEvent.UP, new MyPointerEvent('up', event))
    /** 右键松开 */
    this.rightClick = false
    if (event.button === 2) return
    if (this.dragging) {
      this.dragging = false
      this.dispatchEvent(MyDragEvent.END, new MyDragEvent('end', event))
    } else if (event.target && this.domElement.contains(event.target as Node)) {
      this.onTap(event)
    }
  }
  onTap = (event: PointerEvent) => {
    const useTime = Date.now() - this.downTime
    if (useTime < 170) {
      this.tapCount++
      if (this.tapCount === 2) {
        this.tapWaitCancel()
        this.dispatchEvent(MyPointerEvent.DOUBLE_TAP, new MyPointerEvent('double_tap', event))
        this.tapCount = 0
      } else {
        this.tapWait(event)
      }
    } else {
      this.tapWaitCancel()
      this.dispatchEvent(MyPointerEvent.TAP, new MyPointerEvent('tap', event))
    }
  }

  protected tapWait(event: PointerEvent): void {
    clearTimeout(this.tapTimer)
    this.tapTimer = setTimeout(() => {
      this.tapWaitCancel()
      this.dispatchEvent(MyPointerEvent.TAP, new MyPointerEvent('tap', event))
    }, 120)
  }

  protected tapWaitCancel(): void {
    clearTimeout(this.tapTimer)
    this.tapCount = 0
  }
  /** 右键事件 */
  onContextMenu = (event: MouseEvent) => {
    event.preventDefault()
    this.rightClick = event.button === 2
    this.dispatchEvent(MyPointerEvent.MENU, new MyPointerEvent('menu', event))
  }

  onKeyDown = (event: KeyboardEvent) => {
    const { shiftKey, altKey, ctrlKey, metaKey } = event
    this.ctrlKey = ctrlKey || metaKey
    this.shiftKey = shiftKey
    this.altKey = altKey
    this.dispatchEvent(KeyEvent.DOWN, new KeyEvent('down', event))
    if (!event.repeat) {
      this.dispatchEvent(KeyEvent.HOLD, new KeyEvent('hold', event))
    }
  }
  onKeyUp = (event: KeyboardEvent) => {
    const { shiftKey, altKey, ctrlKey, metaKey } = event
    this.ctrlKey = ctrlKey || metaKey
    this.shiftKey = shiftKey
    this.altKey = altKey
    this.dispatchEvent(KeyEvent.UP, new KeyEvent('up', event))
  }


  /** 拖拽进入目标元素 */
  dragenter = (event: DragEvent) => {
    // 表示在当前位置放置拖拽元素将进行移动操作
    event.dataTransfer && (event.dataTransfer.dropEffect = 'move')
  }
  /** 拖拽离开目标元素 */
  dragleave = (event: DragEvent) => {
    // 表示在当前位置不允许放置拖拽元素，即拖放操作无效。
    event.dataTransfer && (event.dataTransfer.dropEffect = 'none')
  }
  /** 拖拽元素在目标元素上移动 */
  dragover = (event: DragEvent) => {
    // 如果默认行为没有被阻止,drop事件不会被触发
    event.preventDefault()
  }
  /** 拖拽元素在目标元素上松开鼠标 */
  drop = (event: DragEvent) => {
    const src = event.dataTransfer?.getData('img') || '';
    const name = event.dataTransfer?.getData('name') || '';

    const coord = this.tree.getWorldByClient(event.clientX, event.clientY)

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
      let x = getClosestTimesVal(coord.x - width / 2, globalConfig.moveSize)
      let y = getClosestTimesVal(coord.y - height / 2, globalConfig.moveSize)
      const defalutSrc = toURL(sourceFile, 'svg')
      const hoverSrc = toURL(updateFile, 'svg')
      const image = new Img({
        name: name,
        position: [x, y],
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
        userData: {
          ellipseData: data,
          portSize: [width, height]
        }
      })
      this.tree.add(image)
      this.dispatchEvent(EditorEvent.ADD, new EditorEvent('add', { target: image }))
    }).catch(error => console.error('Failed to place SVG:', error))
  }

  private prepareChildren(children: IObject[]): Object2D[] {
    const prepared = children.map(item => Creator.get(item.tag).one(item))
    // Compute geometry before touching the open document. Invalid nested data can throw here.
    const staging = new Group()
    staging.add(...prepared)
    staging.clear()
    return prepared
  }

  private replaceChildren(children: Object2D[]) {
    this.tree.clear()
    this.tree.add(...children)
    this.tree.render()
  }

  exportJson(children: IObject[]) {
    this.replaceChildren(this.prepareChildren(children))
  }

  importJson(data: unknown) {
    const children = (data as { children?: unknown } | null)?.children
    if (!Array.isArray(children)) throw new Error('图纸缺少 children 数组')
    for (const item of children) {
      if (!item || typeof item.tag !== 'string' || !Creator.get(item.tag)) {
        throw new Error('图纸包含不支持的图形')
      }
    }
    const prepared = this.prepareChildren(children)
    if (this.tool.toolMap.has('operationGraph')) this.tool.setActiveTool('operationGraph')
    this.selector.cancel()
    this.replaceChildren(prepared)
    this.history.reset()
    this.documentSession?.markSaved()
    this.render()
  }

  moveSelectionToEdge(edge: 'top' | 'bottom') {
    const selected = new Set(this.selector.list)
    const parents = new Set(this.selector.list.map(item => item.parent).filter(Boolean))
    let changed = false
    for (const parent of parents) {
      if (!parent) continue
      const moving = parent.children.filter(item => selected.has(item))
      const remaining = parent.children.filter(item => !selected.has(item))
      if (moving.length === 0 || remaining.length === 0) continue
      const order = edge === 'top' ? [...remaining, ...moving] : [...moving, ...remaining]
      if (order.every((item, index) => item === parent.children[index])) continue
      parent.children = order
      order.forEach((item, index) => { item.index = index })
      changed = true
    }
    if (changed) {
      this.tree.render()
      this.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
    }
  }

  findAll(query: string): Object2D[] {
    const value = query.trim().toLocaleLowerCase()
    if (!value) return []
    const found: Object2D[] = []
    this.tree.traverse(item => {
      if (item === this.tree) return
      let ancestor: Object2D | undefined = item
      while (ancestor && ancestor !== this.tree) {
        if (!ancestor.visible || ancestor.locked) return
        ancestor = ancestor.parent
      }
      const content = item instanceof Text ? item.getText() : ''
      if (item.name.toLocaleLowerCase().includes(value) || content.toLocaleLowerCase().includes(value)) found.push(item)
    })
    return found
  }

  focusObject(target: Object2D) {
    this.selector.select(target)
    this.orbitControler.zoomGraph([target])
    this.render()
  }

  find(query: string) {
    const found = this.findAll(query)[0]
    if (!found) return false
    this.focusObject(found)
    return true
  }

  /** 选中图形的遮罩 */
  private drawMask() {
    this.maskGroup.clear()
    const list = this.selector.list || []
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      const { minX, minY, width, height } = element.bounds
      const { x, y } = this.sky.getPageByWorld(minX, minY)
      const { x: w, y: h } = this.sky.getPageLenByWorld(width, height)
      const rectX = new Rect({
        width: w,
        height: 20,
        style: {
          fillStyle: globalConfig.rulerMaskColor,
        },
        position: [x, 0],
        index: 20
      })
      this.maskGroup.add(rectX)
      const rectY = new Rect({
        width: 20,
        height: h,
        style: {
          fillStyle: globalConfig.rulerMaskColor,
        },
        position: [0, y],
        index: 20
      })
      this.maskGroup.add(rectY)
    }
  }

  listen() {
    /* 滑动滚轮缩放 */
    this.domElement.addEventListener('wheel', this.onWheel, { passive: false })
    this.domElement.addEventListener('pointerdown', this.onPointerdown)
    window.addEventListener('pointermove', this.onPointermove)
    window.addEventListener('pointerup', this.onPointerup)
    window.addEventListener('contextmenu', this.onContextMenu)
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)

    this.addEventListener(MyPointerEvent.MOVE, (event) => {
      if (!globalConfig.guidelineVisible || !this.guideline.visible) return
      const origin = event.origin as IPointerEvent
      const worldPoint = this.sky.getWorldByClient(origin.clientX, origin.clientY)
      let x = getClosestTimesVal(worldPoint.x, globalConfig.moveSize)
      let y = getClosestTimesVal(worldPoint.y, globalConfig.moveSize)
      const pagePoint = this.sky.getPageByWorld(x, y)
      let pageX = pagePoint.x, pageY = pagePoint.y
      if (pagePoint.x <= 20) pageX = 20
      if (pagePoint.x >= this.sky.viewPort.viewportWidth) pageX = this.sky.viewPort.viewportWidth
      if (pagePoint.y <= 20) pageY = 20
      if (pagePoint.y >= this.sky.viewPort.viewportHeight) pageY = this.sky.viewPort.viewportHeight
      this.guideline.coord.set(pageX, pageY)
      this.sky.render()
    })

    this.orbitControler.addEventListener(OrbitEvent.CHANGE, (event) => {
      const origin = event.origin as IPointerEvent
      if (origin && event.type === 'wheel') {
        this.guideline.coord.y += origin.clientY
        this.guideline.coord.x += origin.clientX
      }
      this.render()
    })

   
  }

  destroy() {
    this.documentSession?.destroy()
    this.vertexEditor?.destroy()
    if (this.selector.editing) this.selector.closeInnerEditor()
    this.tool.activeTool?.inactive()
    this.tool.destroy()
    this.keybord.destroy()
    this.history.destroy()
    /* 滑动滚轮缩放 */
    this.domElement.removeEventListener('wheel', this.onWheel)
    this.domElement.removeEventListener('pointerdown', this.onPointerdown)
    window.removeEventListener('pointermove', this.onPointermove)
    window.removeEventListener('pointerup', this.onPointerup)
    window.removeEventListener('contextmenu', this.onContextMenu)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    this.selector.destroy()
    this.ground.destroy()
    this.tree.destroy()
    this.sky.destroy()
    this.guideline.destroy()
    this.ruler.destroy()

    this.removeAllListeners()
    this.orbitControler.removeAllListeners()
  }


}
