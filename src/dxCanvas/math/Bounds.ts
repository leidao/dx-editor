/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-10-21 17:05:41
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-30 15:42:22
 */
import { Vector2 } from "./Vector2"

export class Bounds {
  min = new Vector2(Infinity,Infinity)
  max = new Vector2(-Infinity,-Infinity)
  // /** 最小 x 轴坐标 */
  get minX(): number { return this.min.x }
  // /** 最小 y 轴坐标 */
  get minY(): number { return this.min.y }
  // /** 最大 x 轴坐标 */
  get maxX(): number { return this.max.x }
  // /** 最大 y 轴坐标 */
  get maxY(): number { return this.max.y }
  get x(): number { return (this.min.x + this.max.x) / 2 }
  get y(): number { return (this.min.y + this.max.y) / 2 }
  get width(): number { return this.max.x - this.min.x }
  get height(): number { return this.max.y - this.min.y }

  set(min: Vector2, max: Vector2) {
    this.min.x = min.x
    this.min.y = min.y
    this.max.x = max.x
    this.max.y = max.y
  }
  expand(...values:Vector2[]){
    for (const value of values) {
      this.min.expandMin(value)
      this.max.expandMax(value)
    }
  }
  clear(){
    this.min.x = Infinity
    this.min.y = Infinity
    this.max.x = -Infinity
    this.max.y = -Infinity
  }
  hit(bounds: Bounds): boolean {
    return (
      this.minX <= bounds.maxX && // A的右边大于等于B的左边
      this.maxX >= bounds.minX && // A的左边小于等于B的右边
      this.minY <= bounds.maxY && // A的下边大于等于B的上边
      this.maxY >= bounds.minY // A的上边小于等于B的下边
    );
  }
  hitPoint(point: Vector2): boolean {
    return (
      point.x >= this.minX && // 点的x坐标大于等于包围盒的左边
      point.x <= this.maxX && // 点的x坐标小于等于包围盒的右边
      point.y >= this.minY && // 点的y坐标大于等于包围盒的上边
      point.y <= this.maxY // 点的y坐标小于等于包围盒的下边
    );
  }
}