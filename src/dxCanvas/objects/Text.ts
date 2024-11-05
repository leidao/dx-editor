import { Matrix3, Vector2 } from '../math';
import { BasicStyle, TextStyle, TextStyleType } from '../style';
import { copyPrimitive, Creator } from '../utils';
import { IObject, Object2D, Object2DType } from './Object2D';
const chineseRegex = /[\u4e00-\u9fa5]/;

/* 构造参数的类型 */
export type TextType = Object2DType & {
  text?: string;
  maxWidth?: number | undefined;
  style?: TextStyleType;
  hoverStyle?: TextStyleType;
  selectStyle?: TextStyleType;
  offset?: [number, number];
};

/* 虚拟上下文对象 */
const virtuallyCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

/* 文字对齐方式引起的偏移量 */
export const alignRatio = {
  start: 0,
  left: 0,
  center: -0.5,
  end: -1,
  right: -1
};
export const baselineRatio = {
  top: 0,
  middle: -0.5,
  bottom: -1,
  hanging: -0.05,
  alphabetic: -0.78,
  ideographic: -1
};

export class Text extends Object2D {
  private text = '';
  maxWidth: number | undefined;
  _style: TextStyle = new TextStyle();
  style: TextStyleType = {};
  offset = new Vector2(0, 0);
  pickingBuffer = 4;
  name = '文本';
  /** 类型 */
  public get tag() { return 'Text'; }

  constructor(attr: TextType = {}) {
    super();
    this.setOption(attr);
  }

  /* 世界模型矩阵*偏移矩阵 */
  get worldMatrix(): Matrix3 {
    const { offset: { x, y } } = this;
    return super.worldMatrix.multiply(new Matrix3().makeTranslation(x, y));
  }

  /** 设置文字内容 */
  setText(text: string) {
    this.text = text;
    this.computeBoundsBox();
  }

  /** 获取文字内容 */
  getText(): string {
    return this.text;
  }

  /* 视图投影矩阵*世界模型矩阵*偏移矩阵  */
  get pvmMatrix(): Matrix3 {
    const { offset: { x, y } } = this;
    return super.pvmMatrix.multiply(new Matrix3().makeTranslation(x, y));
  }

  /* 属性设置 */
  setOption(attr: TextType) {
    for (const [key, val] of Object.entries(attr)) {
      switch (key) {
        case 'position':
        case 'scale':
        case 'offset':
          this[key].fromArray(val);
          break;
        case 'tag':
          break;
        case 'style':
          this.style = val
          this._style.setOption(val)
          break;
        default:
          this[key] = val;
      }
    }
  }

  /* 文本尺寸 */
  get size(): Vector2 {
    const { _style, text, maxWidth } = this;
    _style.setFont(virtuallyCtx);

    let width = 0;
    let height = 0;
    let currentLineWidth = 0;
    let maxLineWidth = 0;
    const fontSize = _style.fontSize || 12;

    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let lineWidth = 0;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        const charWidth = virtuallyCtx.measureText(char).width;
        lineWidth += charWidth;
      }

      maxLineWidth = Math.max(maxLineWidth, lineWidth);
      width = Math.max(width, lineWidth);
      height += fontSize;
    }

    const w = maxWidth === undefined ? maxLineWidth : Math.min(maxLineWidth, maxWidth);

    return new Vector2(w, height);
  }

  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const {
      text,
      offset: { x, y },
      maxWidth,
      _style
    } = this;
    // 应用样式
    this.applyStyle(ctx);
    const textBaseline = _style.textBaseline
    const lines = text.split('\n');
    let n = 0
    switch (textBaseline) {
      case 'top':
        n = 0
        break;
      case 'bottom':
        n = lines.length - 1
        break;
      default:
        n = Math.floor(lines.length / 2)
        break;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineY = y - (n - i) * (_style.fontSize || 12) + 1;

      for (const method of _style.drawOrder) {
        _style[`${method}Style`] && ctx[`${method}Text`](line, x, lineY, maxWidth);
      }
    }
  }

  /* 计算边界盒子 */
  computeBoundsBox(updateParentBoundsBox = true) {
    const {
      bounds: { min, max },
      size,
      offset,
      _style: { textAlign, textBaseline, fontSize = 12 }
    } = this;

    // 根据文本对齐方式计算水平偏移
    const horizontalOffset = size.x * alignRatio[textAlign];
    // 根据文本基线方式计算垂直偏移
    const verticalOffset = size.y * baselineRatio[textBaseline];

    min.set(
      offset.x + horizontalOffset,
      offset.y + verticalOffset
    );
    max.addVectors(min, size);

    // 先将包围盒的原始坐标应用世界矩阵变换
    min.applyMatrix3(this.worldMatrix);
    max.applyMatrix3(this.worldMatrix);

    // 扩展包围盒以包含所有可能的情况（例如旋转等变换后的情况）
    this.bounds.expand(min.clone(), max.clone());
    updateParentBoundsBox && this.parent?.computeBoundsBox();
  }

  /** 点位是否在图形中 */
  isPointInGraph(point: Vector2) {
    const isPointInBounds = this.isPointInBounds(point);
    return isPointInBounds ? this : false;
  }

  toJSON() {
    const object = super.toJSON();
    object.offset = this.offset.toArray();
    object.text = this.text;
    // object.style = JSON.parse(JSON.stringify(this.style))
    return object;
  }

  clone(): Text {
    const data = this.toJSON();
    return new Text(data);
  }

  static one(data: IObject): Text {
    return new Text(data);
  }


}

Creator.register(Text);
