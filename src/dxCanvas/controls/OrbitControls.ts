

import { Camera } from "../core/Camera";
import { EventDispatcher } from "../event/EventDispatcher";
import { Scene } from "../core/Scene";
import { Vector2 } from "../math/Vector2";
import { OrbitEvent } from "../event/OrbitEvent";
import { Object2D } from "../objects";
import { Bounds } from "../math";

/* 暂存数据类型 */
type Stage = {
  cameraZoom: number
  cameraPosition: Vector2
  panStart: Vector2
}

/* 配置项 */
type Option = {
  enableZoom?: boolean
  zoomSpeed?: number
  enablePan?: boolean
  panSpeed?: number
  /** 最小缩放值 */
  minZoom?: number
  /** 最大缩放值 */
  maxZoom?: number
}

const bounds = new Bounds()

/* 相机轨道控制 */
export class OrbitControler extends EventDispatcher {
  /** 相机 */
  camera: Camera
  scene: Scene
  /** 允许缩放 */
  enableZoom = true
  /** 缩放速度 */
  zoomSpeed = 3.0

  /** 允许位移 */
  enablePan = true
  /** 位移速度 */
  panSpeed = 1.0

  /** 是否正在拖拽中 */
  panning = false
  /** 最小缩放值 */
  minZoom = -Infinity
  /** 最大缩放值 */
  maxZoom = Infinity
  /** 是否以鼠标为中心缩放 */
  scaleForMouse = false
  //变换相机前的暂存数据
  stage: Stage = {
    cameraZoom: 1,
    cameraPosition: new Vector2(),
    panStart: new Vector2()
  }

  constructor(scene: Scene, option: Option = {}) {
    super()
    this.camera = scene.camera
    this.scene = scene
    this.setOption(option)
  }

  /* 设置属性 */
  setOption(option: Option) {
    Object.assign(this, option)
  }

  /* 缩放 */
  wheel = (event: WheelEvent) => {
    const { deltaY, clientX, clientY } = event
    const { enableZoom, camera, stage, scene } = this
    if (!enableZoom) return
    stage.cameraZoom = camera.zoom

    const origin = scene.getPageByClient(clientX, clientY)
    if (deltaY < 0) {
      this.zoomIn(origin, event)
    } else {
      this.zoomOut(origin, event)
    }
  }
  zoom(scale: number, origin?: Vector2, event?: WheelEvent) {
    const { enableZoom, camera, zoomSpeed, stage, scene } = this
    camera.zoom *= scale
    if (!origin) {
      const { viewportWidth, viewportHeight } = scene.viewPort
      origin = new Vector2().set(viewportWidth / 2, viewportHeight / 2)
    }
    const P1 = new Vector2().addVectors(origin, camera.position)
    const P2 = P1.clone().multiplyScalar(scale)
    camera.position.add(P2.sub(P1))
    // const type = scale > 1 ? 'in' : 'out'
    this.dispatchEvent(OrbitEvent.CHANGE, new OrbitEvent('wheel', event))
  }
  zoomIn(origin?: Vector2, event?: WheelEvent) {
    const { camera, zoomSpeed } = this
    if (camera.zoom >= this.maxZoom) return
    const scale = Math.pow(0.95, zoomSpeed)
    this.zoom(1 / scale, origin, event)
  }
  zoomOut(origin?: Vector2, event?: WheelEvent) {
    const { camera, zoomSpeed } = this
    if (camera.zoom <= this.minZoom) return
    const scale = Math.pow(0.95, zoomSpeed)
    this.zoom(scale, origin, event)
  }
  zoomGraph(graph: Object2D[]) {
    const { camera, scene } = this
    // 计算图形的包围盒
    bounds.clear()
    graph.forEach(item => {
      bounds.expand(item.bounds.min, item.bounds.max)
    })
    const { x, y, width, height } = bounds
    // 获取画布的宽高
    const { viewportWidth, viewportHeight } = scene.viewPort

    // 计算缩放比例，保持纵横比
    const zoom = Math.min(viewportWidth / width, viewportHeight / height)

    const P1 = new Vector2(x, y).multiplyScalar(zoom)
    const P2 = new Vector2(viewportWidth / 2, viewportHeight / 2)
    camera.zoom = zoom
    camera.position.copy(P1.sub(P2))

    this.dispatchEvent(OrbitEvent.CHANGE, new OrbitEvent('change'))

  }

  /* 鼠标按下 */
  pointerdown = (event: PointerEvent) => {
    const { clientX: cx, clientY: cy } = event
    const {
      enablePan,
      stage: { cameraPosition, panStart },
      camera: { position }
    } = this
    if (!enablePan) return
    this.panning = true
    cameraPosition.copy(position)
    panStart.set(cx, cy)
  }

  /* 鼠标抬起 */
  pointerup = () => {
    this.panning = false
  }

  /* 位移 */
  pointermove = (event: PointerEvent) => {
    const { clientX: cx, clientY: cy } = event
    const {
      enablePan,
      camera: { position },
      stage: {
        panStart: { x, y },
        cameraPosition
      },
      panning
    } = this
    if (!enablePan || !panning) return
    // 相机的变换方向和canvas的坐标方向相反的
    position.copy(cameraPosition.clone().add(new Vector2(x - cx, y - cy)))
    this.dispatchEvent(OrbitEvent.CHANGE, new OrbitEvent('move',event))
  }
}
