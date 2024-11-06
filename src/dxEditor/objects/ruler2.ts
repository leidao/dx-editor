/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-10-20 10:41:20
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-05 15:44:08
 */
import globalConfig from '../config'
import { getClosestTimesVal, getStepByZoom } from '../utils';
import { EditorView } from '..';
import { degToRad, Group, Line, OrbitEvent, Rect, Text, Vector2 } from '@/dxCanvas';
import { EditorEvent } from '../event';

export class Ruler {
  name = '标尺'
  group = new Group({ name: '标尺组', enableCamera: false,index:Infinity })

  get visible(): boolean {
    return this.group.visible || false
  }
  set visible(visible: boolean) {
    this.group.visible = visible
    this.drawShape()
  }
  constructor(private editor: EditorView) {
    this.drawShape()
    editor.sky.add(this.group)
    this.listen()
  }
  /** 绘图 */
  drawShape = () => {
    if (this.visible) {
      this.group.clear()
      this.drawRect()
      this.drawXRuler()
      this.drawYRuler()
      this.drawMask()
    }
    this.editor.sky.render()
  }

  /** 绘制背景 */
  drawRect() {
    const { viewportWidth, viewportHeight } = this.editor.sky.viewPort
    // 背景色
    this.group.add(new Rect({

      width: viewportWidth,
      height: 20,
      index: 10,
      style: {
        fillStyle: globalConfig.rulerBgColor,
      }
    }))
    this.group.add(new Rect({

      width: 20,
      height: viewportHeight,
      index: 10,
      style: {
        fillStyle: globalConfig.rulerBgColor,
      }
    }))
    // 线条
    this.group.add(new Line({

      points: [[0, 20], [viewportWidth, 20]],
      index: 50,
      style: {
        lineWidth: 1,
        strokeStyle: globalConfig.rulerBorderColor,
      }
    }))
    this.group.add(new Line({

      points: [[20, 0], [20, viewportHeight]],
      index: 50,
      style: {
        lineWidth: 1,
        strokeStyle: globalConfig.rulerBorderColor,
      }
    }))
    // 背景+文字
    this.group.add(new Rect({

      width: 20,
      height: 20,
      index: 40,
      style: {
        fillStyle: globalConfig.rulerBgColor,
      }
    }))
    this.group.add(new Text({
      position: [9,9],
      text: `px`,
      index: 40,
      style: {
        fillStyle: globalConfig.rulerTextColor,
        fontSize: 10,
        textAlign: 'center',
        textBaseline: 'middle',
      }
    }))
  }

  drawXRuler() {
    const scene = this.editor.sky.getScene()
    if (!scene) return
    const { viewportWidth } = scene.viewPort
    const zoom = scene.camera.zoom
    const stepInScene = getStepByZoom(zoom)
    const { x: x1 } = scene.getWorldByPage(0, 0)
    let startX = getClosestTimesVal(x1, stepInScene)
    const { x: x2 } = scene.getWorldByPage(viewportWidth, 0)
    const endX = getClosestTimesVal(x2, stepInScene)
    // console.log('drawXRuler', x1, startX, x2, endX, zoom, stepInScene);
    while (startX <= endX) {
      const x = (startX - x1) * zoom
      const line = new Line({
        points: [[x, 14], [x, 20]],
        index: 30,
        style: {
          lineWidth: 1,
          strokeStyle: globalConfig.rulerLineColor
        }
      })
      this.group.add(line)
      const text = new Text({
        position: [x,8],
        text: `${startX}`,
        index: 30,
        style: {
          fillStyle: globalConfig.rulerTextColor,
          fontSize: 10,
          textAlign: 'center',
          textBaseline: 'middle',
        }
      })
      this.group.add(text)
      startX += stepInScene
    }
  }
  drawYRuler() {
    const scene = this.editor.sky.getScene()
    if (!scene) return
    const { viewportHeight } = scene.viewPort
    const zoom = scene.camera.zoom
    const stepInScene = getStepByZoom(zoom)
    const { y: y1 } = scene.getWorldByPage(0, 0)
    let startY = getClosestTimesVal(y1, stepInScene)
    const { y: y2 } = scene.getWorldByPage(0, viewportHeight)
    const endY = getClosestTimesVal(y2, stepInScene)
    // console.log('startXY',y1,startY,y2,endY,zoom,stepInScene);
    while (startY <= endY) {
      const y = (startY - y1) * zoom
      const line = new Line({
        points: [[14, y], [20, y]],
        index: 30,
        style: {
          lineWidth: 1,
          strokeStyle: globalConfig.rulerLineColor
        }
      })
      this.group.add(line)
      const text = new Text({
        index: 30,
        text: `${startY}`,
        position: [8,y],
        rotate: degToRad(-90),
        style: {
          fillStyle: globalConfig.rulerTextColor,
          fontSize: 10,
          textAlign: 'center',
          textBaseline: 'middle',
        }
      })
      this.group.add(text)
      startY += stepInScene
    }

  }
  /** 选中图形的遮罩 */
  drawMask() {
    const list = this.editor.selector.list || []
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      const { minX, minY, width, height } = element.bounds
      const { x, y } = this.editor.sky.getPageByWorld(minX, minY)
      const { x: w, y: h } = this.editor.sky.getPageLenByWorld(width, height)
      const rectX = new Rect({
        width: w,
        height: 20,
        style: {
          fillStyle: globalConfig.rulerMaskColor,
        },
        position: [x,0],
        index: 20
      })
      this.group.add(rectX)
      const rectY = new Rect({
        width: 20,
        height: h,
        style: {
          fillStyle: globalConfig.rulerMaskColor,
        },
        position: [0,y],
        index: 20
      })
      this.group.add(rectY)
    }
  }
  listen() {
    this.editor.orbitControler.addEventListener(OrbitEvent.CHANGE, this.drawShape)
    this.editor.addEventListener(EditorEvent.SELECT, this.drawShape)
    this.editor.addEventListener(EditorEvent.DRAG,this.drawShape)
    this.editor.addEventListener(EditorEvent.HISTORY_CHANGE,this.drawShape)
  }
  destroy() {
    this.editor.orbitControler.removeEventListener(OrbitEvent.CHANGE, this.drawShape)
    this.editor.removeEventListener(EditorEvent.SELECT, this.drawShape)
    this.editor.removeEventListener(EditorEvent.DRAG,this.drawShape)
    this.editor.removeEventListener(EditorEvent.HISTORY_CHANGE,this.drawShape)
  }
}