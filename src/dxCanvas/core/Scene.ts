/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-10-13 19:15:15
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-04 17:59:33
 */


import { Vector2 } from "../math/Vector2";
import { Group } from "../objects/Group";
import { getDprScale } from "../utils";
import { Camera } from "./Camera";

type SceneType = {
  container: HTMLDivElement
  camera?: Camera
  autoCenter?: boolean
}

class Scene extends Group {
  /** canvas元素 */
  _canvas = document.createElement('canvas')
  /** canvas 上下文对象 */
  ctx: CanvasRenderingContext2D = this._canvas.getContext('2d') as CanvasRenderingContext2D
  /** 相机 */
  camera = new Camera()
  /** 是否自动清理画布 */
  autoClear = true
  /** 类型 */
  public get tag() { return 'Scene' }
  /** 名称 */
  name = '场景'
  dpr = getDprScale()
  constructor(attr: SceneType) {
    super()
    this.setOption(attr)
    this._canvas.style.position = 'absolute'
    this._canvas.style.left = '0px'
    this._canvas.style.top = '0px'
    this.container.style.position = 'relative'
    this.container.appendChild(this._canvas)
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.setViewPort(width, height)
    this.listen()
  }

  /** 设置视口大小 */
  setViewPort(width = 300, height = 150) {
    this._canvas.style.width = width + 'px'
    this._canvas.style.height = height + 'px'
    this._canvas.width = width * this.dpr
    this._canvas.height = height * this.dpr
  }
  /** 获取视口大小 */
  get viewPort() {
    return {
      width: this._canvas.width,
      height: this._canvas.height,
      viewportWidth: this._canvas.clientWidth,
      viewportHeight: this._canvas.clientHeight
    }
  }

  render = () => {
    requestAnimationFrame(() => {
      const { ctx, children, autoClear, camera,_style } = this
      const { width, height } = this.viewPort
      this.computeBoundsBox()
      ctx.save()
      autoClear && ctx.clearRect(0, 0, width, height)
      ctx.scale(this.dpr, this.dpr);
      // 渲染子对象
      for (let obj of children) {
        ctx.save()
         // 视图投影矩阵
         obj.enableCamera && camera.transformInvert(ctx)
        // 绘图
        obj.draw(ctx)
        ctx.restore()
      }
      ctx.restore()
    })
  }

  computeBoundsBox = () => {
    const { bounds, viewPort } = this
    bounds.min = this.getWorldByPage(0, 0)
    bounds.max = this.getWorldByPage(viewPort.viewportWidth, viewPort.viewportHeight)
  }

  // page坐标指canvas坐标
  /* client坐标转page坐标 */
  getPageByClient(clientX: number, clientY: number) {
    const { container } = this
    const { left, top } = container.getBoundingClientRect()
    return new Vector2(clientX - left, clientY - top)
  }

  /* page坐标转世界坐标*/
  getWorldByPage(x: number, y: number): Vector2 {
    const {
      camera: { zoom, position }
    } = this
    return new Vector2(x, y).add(position).divideScalar(zoom)
  }
  /* client坐标转世界坐标*/
  getWorldByClient(clientX: number, clientY: number): Vector2 {
    return this.getWorldByPage(...this.getPageByClient(clientX, clientY).toArray())
  }

  /* 世界坐标转page坐标 */
  getPageByWorld(x: number, y: number): Vector2 {
    const {
      camera: { zoom, position }
    } = this
    return new Vector2(x, y).multiplyScalar(zoom).sub(position)
  }

  getPageLenByWorld(x: number, y: number): Vector2 {
    const { camera } = this
    return new Vector2(x, y).multiplyScalar(camera.zoom)
  }
  getWorldLenByPage(x: number, y: number): Vector2 {
    const { camera } = this
    return new Vector2(x, y).divideScalar(camera.zoom)
  }

  /** 点位是否在图形中 */
  isPointInGraph(mp: Vector2) {
    const { children, ctx } = this
    for (let obj of [...children].reverse()) {
      // ctx.beginPath()
      // obj.crtPath(ctx)
      const flag = obj.isPointInGraph(mp)
      if (flag) return obj
    }
    return null
  }
  toJSON() {
    const object = super.toJSON();
    object.children = this.children.map(item => item.toJSON())
    return object
  }

  resize = () => {
    this.dpr = getDprScale()
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    this.setViewPort(width, height)
    this.render()
  }
  listen() {
    window.addEventListener('resize', this.resize)
  }
  destroy() {
    window.removeEventListener('resize', this.resize)
    this.children.forEach((obj) => obj.destroy())
  }

}
export { Scene }