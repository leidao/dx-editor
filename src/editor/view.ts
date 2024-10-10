/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-08-20 14:50:58
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-09 17:31:12
 */

import _ from 'lodash'
import { v4 } from 'uuid'
import Manager from './manager/index'
import Ruler from './objects/ruler'
import Grid from './objects/grid'
import HelpLine from './objects/helpLine'
import globalConfig from './config'

// import './service/customEditTool'
import './service/imageEditTool'
import './service/lineEditTool'
// import { hoverAndSelectDraw } from './service/operation'
import EditSelect from './service/editSelect'


import { getClosestTimesVal, loadSVG } from './utils'
import { Line, Image, Text, Ellipse, Group, App, Platform, UI, Leafer } from 'leafer-ui'
// import { EditorEvent, EditSelect, Stroker } from 'leafer-editor'
import { ILeaferCanvas, IRenderOptions, IUI } from '@leafer-in/interface'

type Option = {
  container: HTMLDivElement
}
export class EditorView {
  domElement!: HTMLDivElement
  app!: App
  selector!: EditSelect
  layer!:Leafer
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
  lastTarget: IUI[] = []
  constructor(option: Option) {
    if (!option.container) return
    // 场景相关
    this.domElement = option.container

    this.app = new App({
      view: this.domElement,
      // // 会自动创建 editor实例、tree层、sky层
      // ground: { type: 'draw' }, // 可选
      zoom: { min: 0.3, max: 50 },
      // editor: {
      //   rotateable: false,
      //   resizeable: false,
      //   // stroke: '#00000000'
      // }
    })
    this.selector = new EditSelect(this.app)
    this.app.ground = new Leafer({ type: 'draw' })
    this.app.tree = new Leafer()
    this.layer = new Leafer()
    this.app.sky = new Leafer({ type: 'draw', usePartRender: false })
    this.app.add(this.app.ground)
    this.app.add(this.app.tree)
    this.app.add(this.layer)
    this.app.add(this.app.sky)


    
    this.ruler = new Ruler(this.app)
    this.grid = new Grid(this.app)
    this.helpLine = new HelpLine(this.app)

    // 管理器
    this.manager = new Manager(this)

    // CustomEditTool.registerEditTool()
    Image.setEditOuter('ImageEditTool');
    Line.setEditOuter('LineEditTiil');

    // this.app.tree.emit('update')

    // (this.app.editor.selector as EditSelect).hoverStroker.__draw = hoverAndSelectDraw('#a00');
    // (this.app.editor.selector as EditSelect).targetStroker.__draw = hoverAndSelectDraw('#ff0000');

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
    const name = event.dataTransfer.getData('name');
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

      let data: any[] = []
      circles.forEach((circle) => {
        circle.setAttribute('fillOpacity','0')
        circle.setAttribute('fill','none')
        // circle.fill = 'none'
        const cx = +(circle.getAttribute('cx') || 0);
        const cy = +(circle.getAttribute('cy') || 0);
        data.push({ x: cx - pixel[0], y: cy - pixel[1] })
      });

      // 使用 XMLSerializer 将 SVG 文档转换为字符串
      const serializer = new XMLSerializer();
      const sourceFile = serializer.serializeToString(svgDocument);

      let updateFile = sourceFile
      if (/stroke="#A00100"/.test(updateFile)) {
        updateFile = updateFile.replace(/stroke="#A00100"/g, `stroke="#ff0000"`);
      }
      if (/fill="#A00100"/.test(updateFile)) {
        updateFile = updateFile.replace(/fill="#A00100"/g, `fill="#ff0000"`);
      }
      if (/fill="none"/.test(updateFile)) {
        updateFile = updateFile.replace(/fill="none"/g, `fill="#4f4f4f4d"`);
      }
      

      // 让图元坐标为网格的倍数
      let x = getClosestTimesVal(coord.x - width / 2, globalConfig.moveSize)
      let y = getClosestTimesVal(coord.y - height / 2, globalConfig.moveSize)

      // const group = new Group({
      //   id: v4(),
      //   name: name,
      //   editable: true,
      //   x: x,
      //   y: y,
      //   lockRatio: true,
      //   zIndex: Infinity,
      //   // hitFill: 'pixel'
      // })

      const image = new Image({
        id: v4(),
        name: name,
        url: Platform.toURL(sourceFile, 'svg'),
        x: x,
        y: y,
        width: width,
        height: height,
        editable: true,
        // name: '图元_内容',
        data: {
          sourceUrl: Platform.toURL(sourceFile, 'svg'),
          hoverUrl: Platform.toURL(updateFile, 'svg'),
          selectUrl: Platform.toURL(updateFile, 'svg'),
          ellipseData:data
        },
        // hitFill: 'pixel'
      })
      // group.add(image)
      // data.forEach(item => {
      //   const ellipse = new Ellipse({
      //     width: 6,
      //     height: 6,
      //     x: item.x,
      //     y: item.y,
      //     offsetX: -3,
      //     offsetY: -3,
      //     name: '图元_圆点',
      //     fill: "rgb(255,5,5)",
      //     opacity: 0
      //     // editable: true,
      //   })
      //   group.add(ellipse)
      // })
      // group.editable = true
      // group.hitChildren = false
      this.app.tree.add(image)
      // this.app.editor.select(group)
      // this.app.editor.group()
      this.app.tree.emit('add')
    })
    // console.log('this.app.tree.toJSON()',this.app.tree.toJSON());
  }

  destroy() {
    this.app.destroy()
    this.manager.destroy()
  }

}
