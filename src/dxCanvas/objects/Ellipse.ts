import { IObject, Object2D, Object2DType } from './Object2D';
import { StandStyle, StandStyleType } from '../style';
import { Vector2 } from '../math';
import { Creator } from '../utils';

export type EllipseType = Object2DType & {
  style?: StandStyleType
  hoverStyle?: StandStyleType
  selectStyle?: StandStyleType
  width?: number
  height?: number
  innerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  offset?: [number, number]
}


export class Ellipse extends Object2D {
  name = '椭圆';
  width = 0;
  height = 0;
  innerRadius = 0;
  startAngle = 0;
  endAngle = 360;
  offset = new Vector2(0, 0)
  _style: StandStyle = new StandStyle();
  public get tag() { return 'Ellipse'; }
  constructor(attr: EllipseType = {}) {
    super();
    this.setOption(attr);
  }

  /* 属性设置 */
  setOption(attr: EllipseType) {
    for (const [key, val] of Object.entries(attr)) {
      switch (key) {
        case 'position':
        case 'scale':
        case 'offset':
          this[key].fromArray(val)
          break
        case 'tag':
          break
        default:
          this[key] = val
      }
    }
  }

  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const { width, height, innerRadius, startAngle, endAngle, _style } = this;
    // 应用样式
    this.applyStyle(ctx);

    ctx.beginPath();
    const centerX = 0;
    const centerY = 0;
    const a = width / 2;
    const b = height / 2;

    // 将角度转换为弧度
    const startRad = startAngle * (Math.PI / 180);
    const endRad = endAngle * (Math.PI / 180);

    ctx.moveTo(centerX, centerY);

    // 绘制到起始角度对应的椭圆上的点
    let startX = centerX + a * Math.cos(startRad);
    let startY = centerY + b * Math.sin(startRad);
    ctx.lineTo(startX, startY);
    // 绘制椭圆
    ctx.ellipse(centerX,centerY,a,b,0,startRad,endRad)
    // 绘制到结束角度对应的椭圆上的点
    let endX = centerX + a * Math.cos(endRad);
    let endY = centerY + b * Math.sin(endRad);
    ctx.lineTo(endX, endY);
    // 闭合路径回到圆心
    ctx.closePath();

    for (const method of _style.drawOrder) {
      _style[`${method}Style`] &&
        ctx[method]();
    }
  }

  /** 获取包围盒数据 */
  computeBoundsBox(updateParentBoundsBox = true) {
    const {
      width,
      height,
      bounds: { min, max },
    } = this;
    min.set(-Math.abs(width) / 2, -Math.abs(height) / 2)
    max.set(Math.abs(width) / 2, Math.abs(height) / 2)
    min.applyMatrix3(this.worldMatrix);
    max.applyMatrix3(this.worldMatrix);
    this.bounds.expand(min.clone(),max.clone())
    updateParentBoundsBox && this.parent?.computeBoundsBox();
  }

  /** 点位是否在图形中 */
  isPointInGraph(point: Vector2) {
    const isPointInBounds = this.isPointInBounds(point);
    return isPointInBounds ? this : false
  }

  toJSON() {
    const object = super.toJSON();
    object.width = this.width;
    object.height = this.height;
    object.innerRadius = this.innerRadius;
    object.startAngle = this.startAngle;
    object.endAngle = this.endAngle;
    return object;
  }

  clone(): Ellipse {
    const data = this.toJSON();
    return new Ellipse(data);
  }
  static one(data: IObject): Ellipse {
    return new Ellipse(data);
  }
}

Creator.register(Ellipse);