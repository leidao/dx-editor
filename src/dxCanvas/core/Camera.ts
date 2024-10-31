/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-10-13 20:05:16
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-20 12:20:35
 */

import { Vector2 } from '../math/Vector2'
import { Matrix3 } from '../math/Matrix3'
export class Camera {
  position: Vector2
  zoom: number
  constructor(x = 0, y = 0, zoom = 1) {
    this.position = new Vector2(x, y)
    this.zoom = zoom
  }

  /* 视图投影矩阵：先逆向缩放，再逆向平移 */
  get pvMatrix() {
    const {
      position: { x, y },
      zoom
    } = this
    return new Matrix3().scale( zoom,  zoom).translate(-x, -y)
  }

  /* 使用视图投影矩阵变换物体 */
  transformInvert(ctx: CanvasRenderingContext2D) {
    const {
      position: { x, y },
      zoom
    } = this
    ctx.translate(-x, -y)
    ctx.scale(zoom, zoom)
  }

}