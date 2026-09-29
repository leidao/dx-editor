import assert from 'node:assert/strict'
import path from 'node:path'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'

globalThis.document = { createElement: () => ({ getContext: () => ({}) }) }
globalThis.Image = class { src = '' }
globalThis.HTMLInputElement = class {}
globalThis.HTMLTextAreaElement = class {}

let server
let Selector
let Hotkeys
let PasteGraph
let OrbitControler
let AddPic
let KeybordManager
let EditorView
let Rect
let Group
let Vector2
let Text
let loadSVG
let HistoryManager
let Scene
let Img
let Line
let ToolDrawWire
let syncWireConnections
let ToolDrawRect
let ToolDrawText
let ToolDrawEllipse
let LineVertexEditor
let DocumentSession
let Ellipse
let EditorEvent

before(async () => {
  server = await createServer({
    configFile: false,
    logLevel: 'silent',
    plugins: [{
      name: 'ignore-scss-in-node-tests',
      enforce: 'pre',
      resolveId(id) { if (id.endsWith('.scss')) return `\0test-style:${id}.js` },
      load(id) { if (id.startsWith('\0test-style:')) return 'export default ""' }
    }],
    resolve: { alias: { '@': path.resolve('src') } },
    server: { middlewareMode: true, hmr: false },
    appType: 'custom'
  })
  ;[
    { default: Selector },
    { default: Hotkeys },
    { default: PasteGraph },
    { OrbitControler },
    { default: AddPic },
    { default: KeybordManager },
    { EditorView },
    { Rect, Group, Vector2, Text, Scene, Img, Line, Ellipse },
    { loadSVG },
    { default: HistoryManager },
    { default: ToolDrawWire },
    { syncWireConnections },
    { default: ToolDrawRect },
    { default: ToolDrawText },
    { default: ToolDrawEllipse },
    { default: LineVertexEditor },
    { default: DocumentSession },
    { EditorEvent }
  ] = await Promise.all([
    server.ssrLoadModule('/src/dxEditor/selector/index.ts'),
    server.ssrLoadModule('/src/dxEditor/keybord/hotkeys.ts'),
    server.ssrLoadModule('/src/dxEditor/tools/pasteGraph.ts'),
    server.ssrLoadModule('/src/dxCanvas/controls/OrbitControls.ts'),
    server.ssrLoadModule('/src/dxEditor/tools/addPic.ts'),
    server.ssrLoadModule('/src/dxEditor/keybord/keybordManger.ts'),
    server.ssrLoadModule('/src/dxEditor/index.ts'),
    server.ssrLoadModule('/src/dxCanvas/index.ts'),
    server.ssrLoadModule('/src/dxEditor/utils/index.ts'),
    server.ssrLoadModule('/src/dxEditor/history/historyManager.ts'),
    server.ssrLoadModule('/src/dxEditor/tools/drawWire.ts'),
    server.ssrLoadModule('/src/dxEditor/wireConnections.ts'),
    server.ssrLoadModule('/src/dxEditor/tools/drawRect.ts'),
    server.ssrLoadModule('/src/dxEditor/tools/drawText.ts'),
    server.ssrLoadModule('/src/dxEditor/tools/drawEllipse.ts'),
    server.ssrLoadModule('/src/dxEditor/lineVertexEditor.ts'),
    server.ssrLoadModule('/src/dxEditor/documentSession.ts'),
    server.ssrLoadModule('/src/dxEditor/event/editorEvent.ts')
  ])
})

after(async () => { await server?.close() })

function makeSelectorEditor() {
  const events = []
  const editor = {
    shiftKey: false,
    tree: { getPageLenByWorld: value => ({ x: value }), render() {} },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent(type) { events.push(type) },
    render() {},
    cursor: { setCursor() {} }
  }
  const selector = new Selector(editor)
  editor.selector = selector
  return { editor, selector, events }
}

test('dragging an already selected object keeps the multi-selection', () => {
  const { selector } = makeSelectorEditor()
  const first = new Rect({ width: 10, height: 10 })
  const second = new Rect({ width: 10, height: 10 })
  selector.select(first, second)
  selector.findUI = () => first

  selector.onDown({ origin: { clientX: 0, clientY: 0 } })

  assert.deepEqual(selector.list, [first, second])
})

test('selector can be created again after the editor is remounted', () => {
  assert.doesNotThrow(() => makeSelectorEditor())
})

test('destroying the editor removes its global keydown listener', t => {
  const originalWindow = globalThis.window
  const removed = []
  globalThis.window = { removeEventListener(type) { removed.push(type) } }
  t.after(() => { globalThis.window = originalWindow })
  const editor = Object.create(EditorView.prototype)
  editor._listeners = new Map()
  editor.domElement = { removeEventListener() {} }
  editor.selector = { destroy() {} }
  editor.tool = { activeTool: null, destroy() {} }
  editor.keybord = { destroy() {} }
  editor.history = { destroy() {} }
  editor.ground = { destroy() {} }
  editor.tree = { destroy() {} }
  editor.sky = { destroy() {} }
  editor.guideline = { destroy() {} }
  editor.ruler = { destroy() {} }
  editor.orbitControler = { removeAllListeners() {} }

  editor.destroy()

  assert.ok(removed.includes('keydown'))
})

test('import replaces the document and resets selection and undo history', () => {
  const tree = new Group()
  tree.render = () => {}
  tree.add(new Rect({ width: 10, height: 10 }))
  const editor = Object.create(EditorView.prototype)
  editor.tree = tree
  editor.selector = { canceled: false, cancel() { this.canceled = true } }
  editor.tool = { toolMap: new Map() }
  editor.addEventListener = () => {}
  editor.removeEventListener = () => {}
  editor.dispatchEvent = () => {}
  editor.render = () => {}
  editor.history = new HistoryManager(editor)
  editor.history.change()

  assert.throws(() => editor.importJson({ children: [{ tag: 'unknown' }] }))
  assert.equal(tree.children.length, 1)

  editor.importJson({ children: [new Rect({ width: 20, height: 20 }).toJSON()] })

  assert.equal(tree.children.length, 1)
  assert.equal(tree.children[0].width, 20)
  assert.equal(editor.selector.canceled, true)
  assert.equal(editor.history.current, -1)
  assert.deepEqual(editor.history.queue, {})
})

test('malformed imported geometry leaves the current document intact', () => {
  const tree = new Group()
  tree.render = () => {}
  const original = new Rect({ width: 10, height: 10 })
  tree.add(original)
  const editor = Object.create(EditorView.prototype)
  editor.tree = tree
  let selectionCanceled = false
  editor.selector = { cancel() { selectionCanceled = true } }
  editor.tool = { toolMap: new Map() }
  editor.history = { reset() {} }

  assert.throws(() => editor.importJson({ children: [{ tag: 'Line', points: [null] }] }))

  assert.deepEqual(tree.children, [original])
  assert.equal(selectionCanceled, false)
})

test('move to top changes render order while preserving selected order', () => {
  const tree = new Group()
  tree.render = () => {}
  const first = new Rect({ width: 10, height: 10 })
  const second = new Rect({ width: 10, height: 10 })
  const third = new Rect({ width: 10, height: 10 })
  tree.add(first, second, third)
  const editor = Object.create(EditorView.prototype)
  editor.tree = tree
  editor.selector = { list: [first, second] }
  editor.dispatchEvent = () => {}

  editor.moveSelectionToEdge('top')

  assert.deepEqual(tree.children, [third, first, second])
  assert.deepEqual(tree.children.map(item => item.index), [0, 1, 2])
})

test('scene destruction visits every child and removes its canvas', t => {
  const originalWindow = globalThis.window
  globalThis.window = { removeEventListener() {} }
  t.after(() => { globalThis.window = originalWindow })
  const scene = Object.create(Scene.prototype)
  let destroyed = 0
  let canvasRemoved = false
  scene.children = Array.from({ length: 3 }, () => ({
    destroy() { destroyed++; scene.children.shift() }
  }))
  scene._listeners = new Map()
  scene._canvas = { remove() { canvasRemoved = true } }
  scene.destroy()
  assert.equal(destroyed, 3)
  assert.equal(canvasRemoved, true)
})

test('arrow movement records an undoable update and prevents page scrolling', () => {
  const { editor, selector, events } = makeSelectorEditor()
  const item = new Rect({ width: 10, height: 10 })
  selector.select(item)
  selector.editToolList.EditTool = {
    onDrag(event) { event.target.position.x += event.moveX }
  }
  events.length = 0
  let prevented = false

  selector.onKeyDown({ origin: { code: 'ArrowRight', preventDefault() { prevented = true } } })

  assert.equal(item.position.x, 5)
  assert.equal(prevented, true)
  assert.ok(events.includes('editor.update'))
})

test('arrow keys inside an input do not move the selected graphic', () => {
  const { selector, events } = makeSelectorEditor()
  const item = new Rect({ width: 10, height: 10 })
  selector.select(item)
  selector.editToolList.EditTool = {
    onDrag(event) { event.target.position.x += event.moveX }
  }
  events.length = 0

  selector.onKeyDown({ origin: { code: 'ArrowRight', target: { tagName: 'INPUT' }, preventDefault() {} } })

  assert.equal(item.position.x, 0)
  assert.equal(events.includes('editor.update'), false)
})

test('shortcuts do not interrupt another contenteditable field', () => {
  const editor = { selector: { editing: false }, addEventListener() {} }
  const keyboard = new KeybordManager(editor)
  let calls = 0
  keyboard.register({ name: 'copy-test', keyboard: 'ctrl+c', action: () => { calls++ } })

  keyboard.onKeydown({ origin: {
    key: 'c', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false,
    target: { isContentEditable: true },
    stopPropagation() {}, preventDefault() {}
  } })

  assert.equal(calls, 0)
})

function makeClipboardEditor() {
  const tree = new Group()
  tree.render = () => {}
  const sky = new Group()
  sky.render = () => {}
  const original = new Rect({ width: 10, height: 10, position: [20, 30] })
  tree.add(original)
  const events = []
  let selected = [original]
  const editor = {
    tree, sky,
    pasteData: new Group(),
    selector: {
      get list() { return selected },
      select(...items) { selected = items },
      cancel() { selected = [] }
    },
    guideline: { visible: false },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent(type) { events.push(type) }
  }
  return { editor, original, events }
}

test('copy replaces the clipboard and repeated placement creates distinct objects', () => {
  const { editor, original } = makeClipboardEditor()
  const hotkeys = new Hotkeys(editor)
  hotkeys.copy()
  hotkeys.copy()
  assert.equal(editor.pasteData.children.length, 1)

  const paste = new PasteGraph(editor)
  editor.tool = { setActiveTool() { paste.inactive() } }
  paste.active()
  editor.pasteData.position.set(40, 50)
  paste.onTap()
  assert.equal(editor.pasteData.children.length, 1)
  paste.active()
  editor.pasteData.position.set(60, 70)
  paste.onTap()

  assert.equal(editor.tree.children.length, 3)
  assert.equal(new Set(editor.tree.children.map(item => item.uuid)).size, 3)
  assert.deepEqual(original.position.toArray(), [20, 30])
})

test('cut removes the selection through history while retaining clipboard contents', () => {
  const { editor, original, events } = makeClipboardEditor()
  new Hotkeys(editor).cut()

  assert.equal(editor.tree.children.includes(original), false)
  assert.equal(editor.pasteData.children.length, 1)
  assert.ok(events.includes('editor.remove'))
})

test('copying a child keeps its world position in the clipboard', () => {
  const { editor } = makeClipboardEditor()
  const parent = new Group({ position: [100, 100] })
  const child = new Rect({ width: 10, height: 10, position: [10, 20] })
  editor.tree.add(parent)
  parent.add(child)
  editor.selector.select(child)

  new Hotkeys(editor).copy()

  assert.deepEqual(editor.pasteData.children[0].position.toArray(), [110, 120])
})

test('copying nested text does not apply its drawing offset twice', () => {
  const { editor } = makeClipboardEditor()
  const parent = new Group({ position: [100, 100] })
  const text = new Text({ position: [10, 20], offset: [5, 0], text: '' })
  editor.tree.add(parent)
  parent.add(text)
  editor.selector.select(text)

  new Hotkeys(editor).copy()

  assert.deepEqual(editor.pasteData.children[0].position.toArray(), [110, 120])
  assert.deepEqual(editor.pasteData.children[0].offset.toArray(), [5, 0])
})

test('canceling placement leaves copied objects available for another paste', () => {
  const { editor } = makeClipboardEditor()
  new Hotkeys(editor).copy()
  const paste = new PasteGraph(editor)
  editor.tool = { setActiveTool() { paste.inactive() } }
  paste.active()

  paste.onKeydown({ origin: { code: 'Escape' } })

  assert.equal(editor.pasteData.children.length, 1)
})

test('moving a placement preview updates its bounds without drifting', () => {
  const { editor } = makeClipboardEditor()
  editor.tree.getWorldByClient = (x, y) => new Vector2(x, y)
  new Hotkeys(editor).copy()
  const paste = new PasteGraph(editor)
  paste.active()

  paste.onMove({ origin: { clientX: 100, clientY: 100 } })
  const position = editor.pasteData.position.toArray()
  assert.equal(editor.pasteData.bounds.x, 100)
  assert.equal(editor.pasteData.bounds.y, 100)
  paste.onMove({ origin: { clientX: 100, clientY: 100 } })
  assert.deepEqual(editor.pasteData.position.toArray(), position)
})

test('moving a grouped placement preview updates nested bounds', () => {
  const { editor } = makeClipboardEditor()
  editor.tree.getWorldByClient = (x, y) => new Vector2(x, y)
  const group = new Group({ position: [40, 40] })
  group.add(new Rect({ width: 10, height: 10, position: [10, 10] }))
  editor.tree.add(group)
  editor.selector.select(group)
  new Hotkeys(editor).copy()
  const paste = new PasteGraph(editor)
  paste.active()

  paste.onMove({ origin: { clientX: 100, clientY: 100 } })

  assert.equal(editor.pasteData.bounds.x, 100)
  assert.equal(editor.pasteData.bounds.y, 100)
})

test('zoom stays within limits and keeps the pointer anchor fixed', () => {
  const camera = { zoom: 1, position: new Vector2() }
  const scene = { camera, viewPort: { viewportWidth: 500, viewportHeight: 400 } }
  const orbit = new OrbitControler(scene)
  orbit.minZoom = 0.5
  orbit.maxZoom = 4

  orbit.zoom(100, new Vector2(100, 50))

  assert.equal(camera.zoom, 4)
  assert.deepEqual(camera.position.toArray(), [300, 150])
})

test('fitting a zero-size object leaves a finite camera zoom', () => {
  const camera = { zoom: 1, position: new Vector2() }
  const scene = { camera, viewPort: { viewportWidth: 500, viewportHeight: 400 } }
  const orbit = new OrbitControler(scene)
  orbit.minZoom = 0.5
  orbit.maxZoom = 4

  orbit.zoomGraph([{ bounds: { min: new Vector2(20, 30), max: new Vector2(20, 30) } }])

  assert.equal(Number.isFinite(camera.zoom), true)
  assert.ok(camera.zoom >= orbit.minZoom && camera.zoom <= orbit.maxZoom)
})

test('image placement commits the preview only when tapped', () => {
  const { editor, events } = makeClipboardEditor()
  editor.tree.getWorldByClient = (x, y) => new Vector2(x, y)
  const tool = new AddPic(editor)
  const preview = new Rect({ width: 10, height: 10 })
  preview.size = new Vector2(10, 10)
  tool.image = preview
  editor.sky.add(preview)
  editor.tool = { setActiveTool() { tool.inactive() } }

  tool.onTap({ origin: { clientX: 100, clientY: 100 } })

  assert.equal(editor.tree.children.includes(preview), true)
  assert.equal(editor.sky.children.includes(preview), false)
  assert.ok(events.includes('editor.add'))
})

test('leaving image placement before SVG loading finishes does not insert an image', async t => {
  const { editor } = makeClipboardEditor()
  let request
  const originalXHR = globalThis.XMLHttpRequest
  const originalParser = globalThis.DOMParser
  const originalSerializer = globalThis.XMLSerializer
  t.after(() => {
    globalThis.XMLHttpRequest = originalXHR
    globalThis.DOMParser = originalParser
    globalThis.XMLSerializer = originalSerializer
  })
  globalThis.XMLHttpRequest = class {
    status = 200
    open() {}
    send() { request = this }
  }
  globalThis.DOMParser = class {
    parseFromString() {
      return {
        querySelectorAll(selector) {
          if (selector === 'svg') return [{ getAttribute(name) { return name === 'viewBox' ? '0 0 10 10' : '10' } }]
          return []
        }
      }
    }
  }
  globalThis.XMLSerializer = class { serializeToString() { return '<svg width="10" height="10" />' } }
  const tool = new AddPic(editor)

  tool.active('image.svg')
  tool.inactive()
  request.onload()
  await Promise.resolve()
  await Promise.resolve()

  assert.equal(editor.tree.children.length, 1)
  assert.equal(editor.sky.children.length, 0)
})

test('an unavailable SVG rejects so placement can exit cleanly', async t => {
  let request
  const originalXHR = globalThis.XMLHttpRequest
  t.after(() => { globalThis.XMLHttpRequest = originalXHR })
  globalThis.XMLHttpRequest = class {
    status = 404
    statusText = 'Not Found'
    open() {}
    send() { request = this }
  }

  const loading = loadSVG('missing.svg')
  request.onload()
  const result = await Promise.race([
    loading.then(() => 'resolved', () => 'rejected'),
    new Promise(resolve => setTimeout(() => resolve('pending'), 0))
  ])

  assert.equal(result, 'rejected')
})

test('wire endpoints follow transformed image ports without changing middle vertices', () => {
  const tree = new Group()
  const image = new Img({ position: [10, 20], size: [20, 20], userData: { ellipseData: [{ x: 5, y: 5 }] } })
  const wire = new Line({ position: [0, 0], points: [[15, 25], [40, 25], [40, 60]], userData: {
    connections: { start: { targetId: image.uuid, portIndex: 0 } }
  } })
  tree.add(image, wire)

  image.position.set(30, 40)
  image.rotate = Math.PI / 2
  syncWireConnections(tree)

  assert.deepEqual(wire.toJSON().points, [[25, 45], [40, 25], [40, 60]])
  assert.deepEqual(wire.userData._points[0], { x: 25, y: 45 })
})

test('removing a connected image leaves the wire at its last position and detaches it', () => {
  const tree = new Group()
  const image = new Img({ position: [10, 20], userData: { ellipseData: [{ x: 5, y: 5 }] } })
  const wire = new Line({ points: [[15, 25], [30, 25]], userData: {
    connections: { start: { targetId: image.uuid, portIndex: 0 } }
  } })
  tree.add(image, wire)
  tree.remove(image)

  syncWireConnections(tree)

  assert.deepEqual(wire.toJSON().points, [[15, 25], [30, 25]])
  assert.deepEqual(wire.userData.connections, {})
})

test('drawing between image ports persists both endpoint references', () => {
  const tree = new Group()
  tree.render = () => {}
  tree.getWorldByClient = (x, y) => new Vector2(x, y)
  tree.getWorldLenByPage = x => new Vector2(x, x)
  const sky = new Group()
  sky.render = () => {}
  const first = new Img({ position: [10, 20], size: [20, 20], userData: { ellipseData: [{ x: 5, y: 5 }] } })
  const second = new Img({ position: [70, 60], size: [20, 20], userData: { ellipseData: [{ x: 5, y: 5 }] } })
  tree.add(first, second)
  const events = []
  const editor = { tree, sky, dispatchEvent(type) { events.push(type) } }
  const tool = new ToolDrawWire(editor)

  tool.onTap({ origin: { clientX: 16, clientY: 25 } })
  tool.onMove({ origin: { clientX: 74, clientY: 65 } })
  tool.onTap({ origin: { clientX: 74, clientY: 65 } })

  const wire = tree.children.find(item => item instanceof Line)
  assert.deepEqual(wire.userData.connections, {
    start: { targetId: first.uuid, portIndex: 0 },
    end: { targetId: second.uuid, portIndex: 0 }
  })
  assert.deepEqual(wire.toJSON().points.at(-1), [60, 40])
  assert.ok(events.includes('editor.add'))
})

test('copying connected images and wires links each pasted set to its own images', () => {
  const { editor } = makeClipboardEditor()
  const image = new Img({ position: [10, 20], userData: { ellipseData: [{ x: 5, y: 5 }] } })
  const wire = new Line({ points: [[15, 25], [30, 25]], userData: {
    connections: { start: { targetId: image.uuid, portIndex: 0 } }
  } })
  editor.tree.add(image, wire)
  editor.selector.select(image, wire)
  new Hotkeys(editor).copy()
  const clipboardImage = editor.pasteData.children.find(item => item instanceof Img)
  const clipboardWire = editor.pasteData.children.find(item => item instanceof Line)
  assert.equal(clipboardWire.userData.connections.start.targetId, clipboardImage.uuid)

  const paste = new PasteGraph(editor)
  editor.tool = { setActiveTool() {} }
  editor.pasteData.position.set(100, 0)
  paste.onTap()

  const placedImage = editor.tree.children.filter(item => item instanceof Img).at(-1)
  const placedWire = editor.tree.children.filter(item => item instanceof Line).at(-1)
  assert.equal(placedWire.userData.connections.start.targetId, placedImage.uuid)
  assert.notEqual(placedWire.userData.connections.start.targetId, image.uuid)
  placedImage.position.x += 10
  syncWireConnections(editor.tree)
  assert.deepEqual(placedWire.toJSON().points[0], [25, 25])
  assert.deepEqual(wire.toJSON().points[0], [15, 25])
})

test('copying a wire alone keeps its geometry but removes external links', () => {
  const { editor } = makeClipboardEditor()
  const wire = new Line({ points: [[15, 25], [30, 25]], userData: {
    connections: { start: { targetId: 'another-image', portIndex: 0 } }
  } })
  editor.tree.add(wire)
  editor.selector.select(wire)

  new Hotkeys(editor).copy()

  assert.deepEqual(editor.pasteData.children[0].userData.connections, {})
  assert.deepEqual(editor.pasteData.children[0].toJSON().points, [[15, 25], [30, 25]])
})

test('image resizing moves connected ports by the image size ratio', () => {
  const tree = new Group()
  const image = new Img({ position: [10, 20], size: [20, 20], userData: {
    ellipseData: [{ x: 5, y: 5 }], portSize: [20, 20]
  } })
  const wire = new Line({ points: [[15, 25], [30, 25]], userData: {
    connections: { start: { targetId: image.uuid, portIndex: 0 } }
  } })
  tree.add(image, wire)
  image.size.set(40, 40)

  syncWireConnections(tree)

  assert.deepEqual(wire.toJSON().points[0], [20, 30])
})

test('moving a connected image and undoing restores the image and wire together', () => {
  const tree = new Group()
  tree.render = () => {}
  const image = new Img({ position: [10, 20], userData: { ellipseData: [{ x: 5, y: 5 }] } })
  const wire = new Line({ points: [[15, 25], [30, 25]], userData: {
    connections: { start: { targetId: image.uuid, portIndex: 0 } }
  } })
  tree.add(image, wire)
  const editor = Object.create(EditorView.prototype)
  editor.tree = tree
  editor.selector = { cancel() {} }
  editor.addEventListener = () => {}
  editor.removeEventListener = () => {}
  editor.dispatchEvent = () => {}
  const history = new HistoryManager(editor)
  history.change()
  image.position.x += 10
  history.change()
  assert.deepEqual(wire.toJSON().points[0], [25, 25])

  history.undo()
  assert.deepEqual(tree.children.find(item => item instanceof Img).position.toArray(), [10, 20])
  assert.deepEqual(tree.children.find(item => item instanceof Line).toJSON().points[0], [15, 25])
  history.redo()
  assert.deepEqual(tree.children.find(item => item instanceof Line).toJSON().points[0], [25, 25])
})

test('rectangle preview appears on the first drag event', () => {
  const tree = new Group()
  tree.render = () => {}
  tree.getWorldByClient = (x, y) => new Vector2(x, y)
  const tool = new ToolDrawRect({ tree })
  tool.onDown({ origin: { clientX: 0, clientY: 0 } })

  tool.onDragStart({ origin: { clientX: 20, clientY: 30 } })

  assert.equal(tree.children[0].width, 20)
  assert.equal(tree.children[0].height, 30)
})

test('canceling or leaving a new text empty removes the uncommitted object', () => {
  const tree = new Group()
  tree.render = () => {}
  tree.getWorldByClient = (x, y) => new Vector2(x, y)
  const editor = {
    tree,
    guideline: { visible: false },
    selector: { openInnerEditor() {}, cancel() {} },
    removeEventListener() {},
    tool: { setActiveTool() {} }
  }
  const tool = new ToolDrawText(editor)
  tool.onTap({ origin: { clientX: 10, clientY: 20 } })
  assert.equal(tree.children.length, 1)
  tool.onCloseInnerEditor({ cancel: true })
  assert.equal(tree.children.length, 0)

  tool.onTap({ origin: { clientX: 10, clientY: 20 } })
  tool.onCloseInnerEditor({ cancel: false })
  assert.equal(tree.children.length, 0)
})

test('local draft marks unsaved work and can be restored without marking it saved', t => {
  const originalWindow = globalThis.window
  const originalStorage = globalThis.localStorage
  const values = new Map()
  globalThis.localStorage = {
    getItem: key => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  }
  globalThis.window = { addEventListener() {}, removeEventListener() {}, confirm: () => true }
  t.after(() => { globalThis.window = originalWindow; globalThis.localStorage = originalStorage })
  let document = { children: [] }
  const listeners = new Map()
  const editor = {
    tree: { toJSON: () => document },
    addEventListener(type, callback) { listeners.set(type, callback) },
    removeEventListener(type) { listeners.delete(type) },
    importJson(value) { document = value; session.markSaved() }
  }
  const session = new DocumentSession(editor)
  document = { children: [{ tag: 'Rect' }] }
  listeners.get(EditorEvent.UPDATE)()
  assert.equal(session.dirty, true)
  let prevented = false
  session.beforeUnload({ preventDefault() { prevented = true }, returnValue: null })
  assert.equal(prevented, true)
  assert.ok(values.has('dx-editor-draft-v1'))
  document = { children: [] }
  session.markSaved()
  values.set('dx-editor-draft-v1', JSON.stringify({ version: 1, document: { children: [{ tag: 'Rect' }] } }))
  session.restoreDraft()
  assert.equal(session.dirty, true)
  assert.equal(document.children.length, 1)
  session.destroy()
})

test('editing line vertices detaches a moved endpoint and preserves intermediate points', () => {
  const line = new Line({ points: [[0, 0], [10, 0], [20, 0]], userData: {
    connections: { start: { targetId: 'image', portIndex: 0 } }
  } })
  const editor = {
    selector: { single: true, element: line },
    render() {},
    dispatchEvent() {}
  }
  const vertices = Object.create(LineVertexEditor.prototype)
  vertices.editor = editor
  vertices.refresh = () => {}
  vertices.changeCoordinate(0, 'x', 5)
  assert.deepEqual(line.getPoints(), [[5, 0], [10, 0], [20, 0]])
  assert.equal(line.userData.connections.start, undefined)
  vertices.insertAfter(1)
  assert.deepEqual(line.getPoints()[2], [15, 0])
  vertices.remove(2)
  assert.deepEqual(line.getPoints(), [[5, 0], [10, 0], [20, 0]])
})

test('one pointer move is enough to drag a line vertex and record an update', () => {
  const line = new Line({ points: [[0, 0], [10, 0]] })
  const events = []
  const editor = {
    selector: { single: true, element: line },
    camera: { zoom: 1 },
    tree: {
      getPageByClient: (x, y) => new Vector2(x, y),
      getPageByWorld: (x, y) => new Vector2(x, y),
      getWorldByClient: (x, y) => new Vector2(x, y)
    },
    sky: { add() {}, remove() {}, render() {} },
    orbitControler: { addEventListener() {}, removeEventListener() {} },
    addEventListener() {}, removeEventListener() {},
    dispatchEvent(type) { events.push(type) },
    render() {}
  }
  const vertices = new LineVertexEditor(editor)
  assert.equal(vertices.capture({ origin: { clientX: 0, clientY: 0 } }), true)
  vertices.onDragStart({ origin: { clientX: 20, clientY: 20 } })
  vertices.onDragEnd({ origin: { clientX: 20, clientY: 20 } })
  assert.deepEqual(line.getPoints()[0], [20, 20])
  assert.equal(events.filter(type => type === EditorEvent.UPDATE).length, 1)
  vertices.destroy()
})

test('ellipse bounds and hit testing account for rotation', () => {
  const ellipse = new Ellipse({ width: 100, height: 50, rotate: Math.PI / 4 })
  ellipse.computeBoundsBox()
  assert.ok(ellipse.bounds.minX < -50)
  assert.ok(ellipse.bounds.maxX > 50)
  assert.equal(ellipse.isPointInGraph(new Vector2(0, 0)), ellipse)
  assert.equal(ellipse.isPointInGraph(new Vector2(50, 50)), false)
})

test('rotated rectangle and image bounds include all four corners', () => {
  const rect = new Rect({ width: 100, height: 40, rotate: Math.PI / 4 })
  rect.computeBoundsBox()
  assert.ok(rect.bounds.minX < -20)
  assert.ok(rect.bounds.maxY > 90)
  assert.equal(rect.isPointInGraph(new Vector2(0, 80)), false)

  const image = new Img({ size: [100, 40], rotate: Math.PI / 4 })
  image.computeBoundsBox()
  assert.ok(image.bounds.minX < -20)
  assert.ok(image.bounds.maxY > 90)
  assert.equal(image.isPointInGraph(new Vector2(0, 80)), false)
})

test('search returns every matching visible unlocked graphic', () => {
  const tree = new Group()
  const first = new Rect({ name: 'Breaker A' })
  const second = new Rect({ name: 'Breaker B' })
  const hidden = new Rect({ name: 'Breaker hidden', visible: false })
  tree.add(first, second, hidden)
  const results = EditorView.prototype.findAll.call({ tree }, 'breaker')
  assert.deepEqual(results, [first, second])
})

test('circle tool creates equal dimensions from a drag', () => {
  const tree = new Group()
  tree.render = () => {}
  tree.getWorldByClient = (x, y) => new Vector2(x, y)
  const editor = { tree, dispatchEvent() {}, tool: { setActiveTool() {} } }
  const tool = new ToolDrawEllipse(editor, true)
  tool.onDown({ origin: { clientX: 0, clientY: 0 } })
  tool.onDragStart({ origin: { clientX: 30, clientY: 20 } })
  assert.equal(tree.children[0].width, 20)
  assert.equal(tree.children[0].height, 20)
  tool.onDragEnd({ origin: { clientX: 30, clientY: 20 } })
  assert.equal(tree.children.length, 1)
})
