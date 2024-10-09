/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-08 10:10:50
 */
import { Collapse, Empty, Slider } from 'antd'
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/editor/context'
import { IUI } from '@leafer-ui/interface'
import { EditorEvent, EditorMoveEvent, EditorRotateEvent, EditorScaleEvent } from 'leafer-editor'
import _ from 'lodash'

export interface Attr {
  x: number | string
  y: number | string
  rotation: number | string
  width: number | string
  height: number | string
}
const getAttr0 = (element?: IUI) => {
  const rotation = element?.rotation !== undefined ? element.rotation : ''
  return {
    x: element?.x !== undefined ? element?.x : '',
    y: element?.y !== undefined ? element?.y : '',
    rotation: +rotation < 0 ? +rotation + 360 : rotation,
    width: element?.width !== undefined ? element?.width : '',
    height: element?.height !== undefined ? element?.height : '',
  }
}
const Panel = () => {
  const view = useContext(EditorContext)
  const [selectList, setSelectList] = useState<(IUI[])>([])

  const [attr, setAttr] = useState({} as Attr)
  const [opacity, setOpacity] = useState(100)

  const getAttr = (list: IUI[]): Attr => {
    if (list.length === 1) {
      setOpacity((list[0]?.opacity !== undefined ? list[0].opacity : 1) * 100)
      return getAttr0(list[0])
    } else {
      if (!view) return getAttr0(list[0])
      setOpacity((list[0]?.opacity !== undefined ? list[0].opacity : 1) * 100)
      const { element } = view.app.editor
      return getAttr0(element)
    }
  }

  useEffect(() => {
    if (!view) return

    // 获取选中的图形的属性
    const change = _.throttle((e) => {
      const list = view.app.editor.list
      // getAttr中element.x/y需要异步
      setTimeout(() => {
        const newAttr = getAttr(list)
        setAttr(newAttr)
        setSelectList(list.slice())
      })
    }, 60)
    // view.app.editor.on(EditorEvent.SELECT, change)
    // view.app.editor.on(EditorMoveEvent.MOVE, change)
    // view.app.editor.on(EditorScaleEvent.SCALE, change)
    // view.app.editor.on(EditorRotateEvent.ROTATE, change)
    // view.app.editor.on('opacityChange', change)

    return () => {
      // view.app.editor.off(EditorEvent.SELECT, change)
      // view.app.editor.off(EditorMoveEvent.MOVE, change)
      // view.app.editor.off(EditorScaleEvent.SCALE, change)
      // view.app.editor.off(EditorRotateEvent.ROTATE, change)
      // view.app.editor.off('opacityChange', change)
    }

  }, [view])


  return (
    <div className="w-100% h-100%">
      {selectList.length === 0 ? (
        <div className="w-100% h-100% flex justify-center items-center">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无选中的图形"
          />
        </div>
      ) : (
        <div className="w-100% h-100% box-border">
          111
        </div>
      )}
    </div>
  )
}
export default Panel
