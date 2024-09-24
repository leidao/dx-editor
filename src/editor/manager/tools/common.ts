/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-11 14:59:53
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-24 17:00:04
 */
import _ from 'lodash'
import { AABB, getDistance, getMaxMin } from '@/editor/utils';
import { App, Bounds, Direction9, Ellipse, Group, Keyboard, LeafList, Line, Point, Event } from 'leafer-editor'
import { IEditor, IEditorMoveEvent, ILeafer, IUI } from '@leafer-in/interface';
const { left, right } = Direction9


/** 极轴锁定 */
export const updateLinePoints = (line: Line, point: { x: number, y: number }, direction: number) => {
  const { x = 0, y = 0 } = line
  let currentX = point.x, currentY = point.y
  if (direction === right) {
    let toPointX = currentX - x
    let toPointY = currentY - y
    /** 是否按住了shift健 */
    if (Keyboard.isHold('ShiftLeft') || Keyboard.isHold('ShiftRight')) {
      // 极轴锁定
      const angle = new Point(x, y).getAngle(new Point(currentX, currentY))
      const width = new Point(currentX, currentY).getDistance(new Point(x, y))
      if (angle > -22.5 && angle < 22.5) {
        toPointY = 0
      } else if (angle > 22.5 && angle < 67.5) {
        const radian = 45 * Math.PI / 180;
        const oppositeSide = width * Math.sin(radian)
        toPointX = oppositeSide
        toPointY = oppositeSide
      } else if (angle > 67.5 && angle < 112.5) {
        toPointX = 0
      } else if (angle > 112.5 && angle < 157.5) {
        const radian = 135 * Math.PI / 180;
        const oppositeSide = width * Math.sin(radian)
        toPointX = -oppositeSide
        toPointY = oppositeSide
      } else if (angle > 157.5 || angle < -157.5) {
        toPointY = 0
      } else if (angle > -157.5 && angle < -112.5) {
        const radian = -135 * Math.PI / 180;
        const oppositeSide = width * Math.sin(radian)
        toPointX = oppositeSide
        toPointY = oppositeSide
      } else if (angle > -112.5 && angle < -67.5) {
        toPointX = 0
      } else if (angle > -67.5 && angle < 22.5) {
        const radian = -45 * Math.PI / 180;
        const oppositeSide = width * Math.sin(radian)
        toPointX = -oppositeSide
        toPointY = oppositeSide
      }
    }
    line.toPoint = { x: toPointX, y: toPointY }
  } else if (direction === left) {
    const { x: lastPointX, y: lastPointY } = line.toPoint
    /** 是否按住了shift健 */
    if (Keyboard.isHold('ShiftLeft') || Keyboard.isHold('ShiftRight')) {
      // 极轴锁定
      const angle = new Point(x + lastPointX, y + lastPointY).getAngle(new Point(currentX, currentY))
      const width = new Point(currentX, currentY).getDistance(new Point(x + lastPointX, y + lastPointY))
      // console.log('angle', angle);
      if (angle > -22.5 && angle < 22.5) {
        currentY = y + lastPointY
      } else if (angle > 22.5 && angle < 67.5) {
        const radian = 45 * Math.PI / 180;
        const oppositeSide = width * Math.sin(radian)
        currentX = x + lastPointX + oppositeSide
        currentY = y + lastPointY + oppositeSide
      } else if (angle > 67.5 && angle < 112.5) {
        currentX = x + lastPointX
      } else if (angle > 112.5 && angle < 157.5) {
        const radian = 135 * Math.PI / 180;
        const oppositeSide = width * Math.sin(radian)
        currentX = x + lastPointX - oppositeSide
        currentY = y + lastPointY + oppositeSide
      } else if (angle > 157.5 || angle < -157.5) {
        currentY = y + lastPointY
      } else if (angle > -157.5 && angle < -112.5) {
        const radian = -135 * Math.PI / 180;
        const oppositeSide = width * Math.sin(radian)
        currentX = x + lastPointX + oppositeSide
        currentY = y + lastPointY + oppositeSide
      } else if (angle > -112.5 && angle < -67.5) {
        currentX = x + lastPointX
      } else if (angle > -67.5 && angle < 22.5) {
        const radian = -45 * Math.PI / 180;
        const oppositeSide = width * Math.sin(radian)
        currentX = x + lastPointX - oppositeSide
        currentY = y + lastPointY + oppositeSide
      }
    }
    let toPointX = x + lastPointX - currentX
    let toPointY = y + lastPointY - currentY
    line.x = currentX
    line.y = currentY
    line.toPoint = { x: toPointX, y: toPointY }
  }
}
const bounds = new Bounds()
// 辅助线生效距离范围
export const DISTANCE = 5;
/** 更新辅助线 */
export const updateAuxiliaryLine = (editor: IEditor, event: IEditorMoveEvent): { lines: number[][], moveX: number, moveY: number } => {
  let { moveX, moveY } = event
  const { app, list, element } = editor
  if (!element) return { lines: [], moveX, moveY }
  /**
   * 辅助线实现
   * 先获取选中元素的包围盒，在获取所有可视区域内的包围盒，记得把选中的元素排除，否则会出现自己和自己比对的情况
   * 用选中元素的包围盒的六条线和可视区域内的图形包围盒的六条线进行求最小值，找到最小值就是辅助线的生成逻辑
   */

  const children = app.tree?.children || []
  const guide = new Map<number, AABB>();
  for (let i = 0; i < children.length; i++) {
    const item = children[i];
    // 排除选中元素
    if (list.some(graph => graph.innerId === item.innerId) || item.name === '辅助线') continue
    // 查找可视范围内的图形
    const inBounds = bounds.set(app.canvas.bounds).hit(item.__world)

    if (inBounds) {
      const otherPoints = item.getLayoutPoints('box', 'world')
      const viewportAABB = getMaxMin(otherPoints)
      // 将视口内图形的 AABB 边界和中心辅助线加入到 guideLines 中
      guide.set(item.innerId, viewportAABB)
    }
  }

  // 获取选中图形的包围盒点位
  const points = element.getLayoutPoints('box', 'world')
  const selectedAABB = getMaxMin(points)
  // console.log('selectedAABB',selectedAABB);

  // 获取六条边
  const { minX, minY, maxX, maxY } = selectedAABB
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const data = {
    /** 垂直比较x轴 */
    vertical: [minX, centerX, maxX],
    /** 水平比较y轴 */
    horizontal: [minY, centerY, maxY]
  }

  /** 辅助线数组 */
  const lines: number[][] = [];


  (Object.keys(data) as ['vertical' | 'horizontal']).forEach((key, index) => {
    const array = data[key]
    let closestGuideData: any[] = [];
    let minDistance = Infinity;
    for (let i = 0; i < array.length; i++) {
      const closestGuide = findClosestGuideLine(array[i], guide, key)
      if (!closestGuide) continue

      if (closestGuide.distance === minDistance) {
        // 辅助线生效距离相同就展示多条
        closestGuideData.push({
          value: array[i],
          closestGuide
        })
      } else if (closestGuide.distance < minDistance) {
        minDistance = closestGuide.distance;
        // 有更短生效距离就重置
        closestGuideData = [{
          value: array[i],
          closestGuide
        }]
      }
    }
    // 如果有约定范围内的最小值，说明需要生成辅助线
    if (closestGuideData.length > 0) {
      closestGuideData.forEach(item => {
        const { closestMin, closestMax, value } = item.closestGuide
        if (key === 'vertical') {
          const min = Math.min(closestMin, closestMax, minY, maxY)
          const max = Math.max(closestMin, closestMax, minY, maxY)
          lines.push([value, min, value, max])
          const x = value - item.value
          moveX = Math.abs(moveX) > DISTANCE ? moveX : x

        } else {
          const min = Math.min(closestMin, closestMax, minX, maxX)
          const max = Math.max(closestMin, closestMax, minX, maxX)
          lines.push([min, value, max, value])
          const y = value - item.value
          moveY = Math.abs(moveY) > DISTANCE ? moveY : y

        }
      })

    }
  })
  return {
    lines,
    moveX,
    moveY
  }
}


function findClosestGuideLine(value: number, guide: Map<number, AABB>, type: 'horizontal' | 'vertical' = 'horizontal'): any {
  let minDistance = DISTANCE
  let data: any[] = []
  // console.log('guide',guide);

  // 查找距离最小的辅助线
  guide.forEach((bounds) => {
    const { minX, minY, maxX, maxY } = bounds
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const array = type === 'vertical' ? [minX, centerX, maxX] : [minY, centerY, maxY]
    for (let i = 0; i < array.length; i++) {
      // 用屏幕坐标去对比
      const distance = Math.abs(value - array[i])
      if (distance === minDistance) {
        // 如果相等，考虑可能存在多条距离相等的辅助线，需要都展示
        data.push({
          value: array[i],
          distance: distance,
          closestMin: type === 'vertical' ? minY : minX,
          closestMax: type === 'vertical' ? maxY : maxX
        })
      } else if (distance < minDistance) {
        // 求最小距离,有距离更短的辅助线，上面相等的辅助线都放弃
        minDistance = distance;
        data = [{
          value: array[i],
          distance: distance,
          closestMin: type === 'vertical' ? minY : minX,
          closestMax: type === 'vertical' ? maxY : maxX
        }]
      }
    }
  });
  return data.length > 0 ?
    {
      closestMin: Math.min(...data.map(item => item.closestMin)),
      closestMax: Math.max(...data.map(item => item.closestMax)),
      value: data[0].value,
      distance: data[0].distance,
    } : undefined
}
export const leafList = new LeafList()
/** 计算吸附效应 */
export const calculatedAdsorptionEffect = (e: Event, app: ILeafer, direction: number) => {
  const moveWorldPoint = app.getWorldPointByClient(e.origin as any)
  const { target } = app.tree?.pick(moveWorldPoint, { exclude: leafList })!
  let lastTarget: Ellipse | any = {}

  // lastTarget && (lastTarget.opacity = 0)
  /** 吸附的点位坐标 */
  let adsorbPoint = null
  if (target && (target.name === '图元_内容' || target.name === '图元_圆点')) {
    const parent = target.parent as Group
    parent.children.forEach(item => {
      if (item instanceof Ellipse) {
        const circleWorldPoint = item.getWorldPointByLocal({ x: item.x || 0, y: item.y || 0 })
        const circle = item.getWorldPoint({ x: item.width || 0, y: item.height || 0 }, undefined, true)
        const distance = getDistance(circleWorldPoint.x, circleWorldPoint.y, moveWorldPoint.x, moveWorldPoint.y)
        const line = leafList.indexAt(0)
        if (circle.x / 2 + DISTANCE > distance || circle.y / 2 + DISTANCE > distance) {
          lastTarget = item
          lastTarget.opacity = 1
          adsorbPoint = item.getPagePoint(circleWorldPoint)
          if (!line || item.data?.lineId === line?.innerId) return
          item.data = {
            lineId: line?.innerId,
            direction: direction
          }
        } else {
          item.opacity = 0
          if (!line || item.data?.lineId !== line?.innerId || item.data?.direction !== direction) return
          item.data = {
            lineId: null,
            direction: direction
          }
        }
      }
    })
  }
  return { adsorbPoint, lastTarget }
}