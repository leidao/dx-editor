/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-08-20 14:50:58
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-30 15:11:06
 */

import _ from 'lodash'
import { v4 } from 'uuid'
import Manager from './manager/index'
import Ruler from './objects/ruler'
import Grid from './objects/grid'
import HelpLine from './objects/helpLine'
import globalConfig from './config'

import './service/customEditTool'

import { getClosestTimesVal, loadSVG } from './utils'
import { Line, Image, Text, Ellipse, Group, App, Platform, UI } from 'leafer-ui'

type Option = {
  container: HTMLDivElement
}
export class EditorView {
  domElement!: HTMLDivElement
  app!: App
  /** 管理器 */
  manager!: Manager
  /** 标尺 */
  ruler!: Ruler
  /** 网格 */
  grid!: Grid
  /** 辅助线 */
  helpLine!: HelpLine
  /** 全局配置 */
  config = globalConfig
  constructor(option: Option) {
    if (!option.container) return
    // 场景相关
    this.domElement = option.container

    this.app = new App({
      view: this.domElement,
      // 会自动创建 editor实例、tree层、sky层
      ground: { type: 'draw' }, // 可选
      zoom: { min: 0.2, max: 50 },
      editor: {}
    })
    this.ruler = new Ruler(this.app)
    this.grid = new Grid(this.app)
    this.helpLine = new HelpLine(this.app)

    // 管理器
    this.manager = new Manager(this)

    // CustomEditTool.registerEditTool()
    UI.setEditOuter('CustomEditTool')

    // this.app.tree.emit('update')

  }

  /** 拖拽进入目标元素 */
  dragenter = (event: any) => {
    // 表示在当前位置放置拖拽元素将进行移动操作
    event.dataTransfer && (event.dataTransfer.dropEffect = 'move')
  }
  /** 拖拽离开目标元素 */
  dragleave = (event: any) => {
    // 表示在当前位置不允许放置拖拽元素，即拖放操作无效。
    event.dataTransfer && (event.dataTransfer.dropEffect = 'none')
  }
  /** 拖拽元素在目标元素上移动 */
  dragover = (event: any) => {
    // 如果默认行为没有被阻止,drop事件不会被触发
    event.preventDefault()
    this.helpLine.visible = true
  }
  /** 拖拽元素在目标元素上松开鼠标 */
  drop = (event: any) => {
    this.helpLine.visible = false
    const src = event.dataTransfer.getData('img');
    const coord = this.app.getPagePointByClient(event)

    loadSVG(src).then(svgDocument => {
      const svg = svgDocument.querySelectorAll('svg');
      // 获取svg的大小
      const width = +(svg[0].getAttribute('width') || 70)
      const height = +(svg[0].getAttribute('height') || 50)
      // 查找所有灰色圆点
      const viewBox = svg[0].getAttribute('viewBox')
      const pixel = (viewBox?.split(' ') || []).map(Number)
      const circles = svgDocument.querySelectorAll('ellipse[fill="#4F4F4F"]');

      // 使用 XMLSerializer 将 SVG 文档转换为字符串
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgDocument);

      let data: any[] = []
      circles.forEach((circle) => {
        const cx = +(circle.getAttribute('cx') || 0);
        const cy = +(circle.getAttribute('cy') || 0);
        data.push({ x: cx - pixel[0], y: cy - pixel[1] })
      });

      // 让图元坐标为网格的倍数
      let x = getClosestTimesVal(coord.x - width / 2, globalConfig.moveSize)
      let y = getClosestTimesVal(coord.y - height / 2, globalConfig.moveSize)
     
      const group = new Group({
        id: v4(),
        name: '图元',
        editable: true,
        x: x,
        y: y,
        lockRatio: true,
        zIndex: Infinity,
        // hitFill: 'pixel'
      })

      const image = new Image({
        url: Platform.toURL(svgString, 'svg'),
        x: 0,
        y: 0,
        width: width,
        height: height,
        // editable: true,
        name: '图元_内容',
        // hitFill: 'pixel'
      })

      group.add(image)
      data.forEach(item => {
        const ellipse = new Ellipse({
          width: 4,
          height: 4,
          x: item.x,
          y: item.y,
          offsetX: -2,
          offsetY: -2,
          name: '图元_圆点',
          fill: "rgb(255,5,5)",
          opacity: 0
          // editable: true,
        })
        group.add(ellipse)
      })
      group.editable = true
      group.hitChildren = false
      this.app.tree.add(group)
      // this.app.editor.select(group)
      // this.app.editor.group()

      this.app.tree.emit('add')
      this.config.moveType = 1
    })
    // console.log('this.app.tree.toJSON()',this.app.tree.toJSON());
  }

  destroy() {
    this.app.destroy()
    this.manager.destroy()
  }

}
