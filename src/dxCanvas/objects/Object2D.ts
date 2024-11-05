import { EventDispatcher } from "../event/EventDispatcher";
import { Scene } from "../core/Scene";
import { generateUUID } from "../math/MathUtils";
import { Matrix3 } from "../math/Matrix3";
import { Vector2 } from "../math/Vector2";
import { Group } from "./Group";
import { Bounds } from "../math";
import { crtPath, crtPathByMatrix } from "./ObjectUtils";
import { BasicStyle, BasicStyleType } from "../style";


export type Object2DType = {
  position?: [number, number]
  rotate?: number
  scale?: [number, number]
  visible?: boolean
  locked?: boolean
  index?: number
  name?: string
  parent?: Scene | Group | undefined
  enableCamera?: boolean
  userData?: { [key: string]: any }
  hittable?: boolean
  editable?: boolean
  style?: BasicStyleType
  hoverStyle?: BasicStyleType
  selectStyle?: BasicStyleType
  state?: string
  [key: string]: any
}

export interface IObject {
  [key: string]: any;
}


abstract class Object2D extends EventDispatcher {
  /** 自定义属性 */
  [key: string]: any
  /** 位置 */
  position = new Vector2()
  /** 旋转 */
  rotate = 0
  /** 缩放 */
  scale = new Vector2(1, 1)
  /** 可见性 */
  visible = true
  /** 是否锁住 */
  locked = false
  /** 渲染顺序 */
  index = 0
  /** 名称 */
  abstract name: string
  // 边界盒子
  bounds = new Bounds()
  /** 元素是否响应交互事件，默认为 true */
  hittable = true
  /** editable 元素才能被选中 */
  editable = true
  /** 父级 */
  parent: Scene | Group | undefined
  /** 是否受相机影响 */
  enableCamera = true
  /** 是否会判断包围盒是否在视口内 */
  enableBoundsBoxOptimize = true
  /** UUID */
  uuid = generateUUID()
  /** 自定义数据 */
  userData: { [key: string]: any } = {}
  /** 状态 */
  state = 'none'
  /** 默认样式 */
  style: BasicStyleType = {}
  /** 鼠标hover样式 */
  hoverStyle: BasicStyleType = {}
  /** 鼠标选中样式 */
  selectStyle: BasicStyleType = {}
  /** 样式 */
  _style = new BasicStyle()
  /** 类型 */
  public get tag() { return 'Object2D' }
  /** 外编辑类型 */
  public get editOuter() { return 'EditTool' }
  /** 内编辑类型 */
  public get editInner() { return 'EditTool' }
  static setEditOuter(_toolName: string): void { }
  static setEditInner(_toolName: string): void { }


  /* 本地模型矩阵 */
  get matrix(): Matrix3 {
    const { position, rotate, scale } = this
    return new Matrix3()
      .scale(scale.x, scale.y)
      .rotate(rotate)
      .translate(position.x, position.y)
  }

  /* 世界模型矩阵 */
  get worldMatrix(): Matrix3 {
    const { parent, matrix } = this
    if (parent) {
      return parent.worldMatrix.multiply(matrix)
    } else {
      return matrix
    }
  }

  /* pvm 投影视图模型矩阵 */
  get pvmMatrix(): Matrix3 {
    const scene = this.getScene()
    if (scene) {
      const { camera } = scene
      return new Matrix3().multiplyMatrices(camera.pvMatrix, this.worldMatrix)
    } else {
      return this.worldMatrix
    }
  }

  /* 总缩放量 */
  get worldScale(): Vector2 {
    const { scale, parent } = this
    if (parent && parent instanceof Object2D) {
      return scale.clone().multiply(parent.worldScale)
    } else {
      return scale
    }
  }
  get isEnableCamera() {
    const { parent } = this
    if (!this.enableCamera) return false
    if (!parent?.enableCamera) return false
    return this.enableCamera
  }

  /* 设置属性 */
  setOption(attr: Object2DType) {
    for (const [key, val] of Object.entries(attr)) {
      switch (key) {
        case 'position':
        case 'scale':
          this[key].fromArray(val)
          break
        case 'tag':
          break
        default:
          this[key] = val
      }
    }
  }
  /** 应用样式 */
  applyStyle(ctx: CanvasRenderingContext2D) {
    const { style, hoverStyle, selectStyle, state, _style } = this
    switch (state) {
      case 'hoverEnter':
        _style.setOption({...style,...hoverStyle})
        break;
      case 'select':
        _style.setOption({...style,...selectStyle})
        break;
      case 'hoverLeave':
      case 'none':
      default:
        _style.setOption(style)
        break;
    }
    _style.apply(ctx)
  }

  /* 先变换(缩放+旋转)后位移 */
  transform(ctx: CanvasRenderingContext2D) {
    const { position, rotate, scale } = this
    // translate/rotate/scale执行顺序，从后往前执行
    ctx.translate(position.x, position.y)
    ctx.rotate(rotate)
    ctx.scale(scale.x, scale.y)
  }

  /* 从父级中删除自身 */
  remove() {
    const { parent } = this
    if (parent) parent.remove(this)
  }


  /* 获取场景 */
  getScene(): Scene | null {
    if (this.tag === 'Scene') {
      return this as unknown as Scene
    } else if (this.parent) {
      return this.parent.getScene()
    } else {
      return null
    }
  }

  /* 基于矩阵变换 */
	transformByMatrix(ctx: CanvasRenderingContext2D, matrix: Matrix3) {
		const { position, rotate, scale } = matrix.decompose()
		ctx.translate(position.x, position.y)
		ctx.rotate(rotate)
		ctx.scale(scale.x, scale.y)
    return this
	}

	/* 将矩阵分解到当期对象的position, rotate, scale中 */
	decomposeModelMatrix(m: Matrix3) {
		m.decompose(this)
    return this
	}

  /* 绘图 */
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.visible) return
    if (this.isEnableCamera) {
      const scene = this.getScene()
      if (!scene) return
      // 判断是否在视口内
      if (!scene.bounds.hit(this.bounds)) return
    }
    ctx.save()
    /*  矩阵变换 */
    this.transformByMatrix(ctx,this.worldMatrix)
    /* 绘制图形 */
    this.drawShape(ctx)
    ctx.restore()
  }
  /* 绘制图像边界 */
  crtPath(ctx: CanvasRenderingContext2D, matrix = this.pvmMatrix) {
    // this.computeBoundsBox()
    const {
      bounds: {
        min: { x: x0, y: y0 },
        max: { x: x1, y: y1 },
      },
    } = this
    crtPath(ctx, [x0, y0, x1, y0, x1, y1, x0, y1])
  }
  /** 点位是否在包围盒 */
  isPointInBounds({ x, y }: Vector2) {
    const {
      bounds: {
        min: { x: minX, y: minY },
        max: { x: maxX, y: maxY },
      },
    } = this
    return x >= minX && x <= maxX && y >= minY && y <= maxY
  }

  /* 绘制图形-接口 */
  abstract drawShape(ctx: CanvasRenderingContext2D): void

  /** 计算包围盒 */
  public computeBoundsBox(updateParentBoundsBox?: boolean) { }
  /** 数据转换 */
  toJSON() {
    const object: IObject = {};
    object.position = this.position.toArray()
    object.scale = this.scale.toArray()
    object.rotate = this.rotate
    object.tag = this.tag
    object.name = this.name
    object.index = this.index
    object.uuid = this.uuid
    // object.state = this.state
    object.userData = JSON.parse(JSON.stringify(this.userData))
    object.style = JSON.parse(JSON.stringify(this.style))
    object.hoverStyle = JSON.parse(JSON.stringify(this.hoverStyle))
    object.selectStyle = JSON.parse(JSON.stringify(this.selectStyle))
    if (!this.visible) object.visible = this.visible
    if (this.locked) object.locked = this.locked
    if (!this.enableCamera) object.enableCamera = this.enableCamera
    if (!this.hittable) object.hittable = this.hittable
    if (!this.editable) object.editable = this.editable
    if (!this.enableBoundsBoxOptimize) object.enableBoundsBoxOptimize = this.enableBoundsBoxOptimize
    return object
  }

  /** 克隆 */
  abstract clone(): Object2D

  destroy() {
    // 移除所有事件监听器
    this.removeAllListeners()
    // 从父级中移除
    const parent = this.parent;
    if (parent) {
      parent.remove(this);
    }

    // 将对象置为 null，方便垃圾回收
    this.parent = undefined;
    // 其他属性也根据需要置为 null
  }
}

export { Object2D }