import { IObject, Object2D, Object2DType } from './Object2D';
import { StandStyle, StandStyleType } from '../style';
import { generateUUID, Vector2 } from '../math';
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
    const { width, height, startAngle, endAngle, _style } = this;
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

    if (Math.abs(endAngle - startAngle) < 360) ctx.moveTo(centerX, centerY)
    ctx.ellipse(centerX, centerY, Math.abs(a), Math.abs(b), 0, startRad, endRad)
    ctx.closePath();

    for (const method of _style.drawOrder) {
      _style[`${method}Style`] &&
        ctx[method]();
    }
  }

  /** 获取包围盒数据 */
  computeBoundsBox(updateParentBoundsBox = true) {
    const halfWidth = Math.abs(this.width) / 2
    const halfHeight = Math.abs(this.height) / 2
    this.bounds.clear()
    for (const x of [-halfWidth, halfWidth]) for (const y of [-halfHeight, halfHeight]) {
      const point = new Vector2(x, y).applyMatrix3(this.worldMatrix)
      this.bounds.expand(point, point)
    }
    updateParentBoundsBox && this.parent?.computeBoundsBox();
  }

  /** 点位是否在图形中 */
  isPointInGraph(point: Vector2) {
    if (!this.isPointInBounds(point) || !this.width || !this.height) return false
    if (Math.abs(this.endAngle - this.startAngle) < 360) return this
    const local = point.clone().applyMatrix3(this.worldMatrix.clone().invert())
    const x = local.x / (this.width / 2)
    const y = local.y / (this.height / 2)
    return x * x + y * y <= 1 ? this : false
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
    data.uuid = generateUUID()
    return Ellipse.one(data);
  }
  static one(data: IObject): Ellipse {
    return new Ellipse(data);
  }
}

Creator.register(Ellipse);
