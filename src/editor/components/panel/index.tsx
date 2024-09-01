/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-01 17:43:02
 */
import { Collapse, Empty, Slider } from 'antd'
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/editor/context'
import { IUI } from '@leafer-ui/interface'
import { EditorEvent, EditorMoveEvent, EditorRotateEvent, EditorScaleEvent } from 'leafer-editor'
import _ from 'lodash'
import Stats from './components/stats'
import NumberInput from './components/numberInput'
import Flow from './components/flow'
import Opacity from './components/opacity'
import Text from './components/text'
export interface Attr {
  x: number | string
  y: number | string
  rotation: number | string
  width: number | string
  height: number | string
}
const getAttr0 = (element?: IUI) => {
  return {
    x: element?.x !== undefined ? element?.x : '',
    y: element?.y !== undefined ? element?.y : '',
    rotation: element?.rotation !== undefined ? element.rotation : '',
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
        // 比较属性是否发生变化
        // console.log('_.isEqual',attr, newAttr);
        // if (!_.isEqual(attr, newAttr)) {
        // setAttr(newAttr)
        // console.log('x');
        // }
        setAttr(newAttr)
        setSelectList(list.slice())
      })
    }, 60)
    view.app.editor.on(EditorEvent.SELECT, change)
    view.app.editor.on(EditorMoveEvent.MOVE, change)
    view.app.editor.on(EditorScaleEvent.SCALE, change)
    view.app.editor.on(EditorRotateEvent.ROTATE, change)
    view.app.editor.on('opacityChange', change)

    return () => {
      view.app.editor.off(EditorEvent.SELECT, change)
      view.app.editor.off(EditorMoveEvent.MOVE, change)
      view.app.editor.off(EditorScaleEvent.SCALE, change)
      view.app.editor.off(EditorRotateEvent.ROTATE, change)
      view.app.editor.off('opacityChange', change)
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
          <div className='border-b-solid border-1px border-#dee0e2'>
            <Flow selectList={selectList} />
          </div>
          <div className='border-b-solid border-1px border-#dee0e2'>
            <Stats selectList={selectList} attr={attr}></Stats>
          </div>
          <div className='border-b-solid border-1px border-#dee0e2'>
            <Opacity selectList={selectList} opacity={opacity} ></Opacity>
          </div>
          <div className='border-b-solid border-1px border-#dee0e2'>
            <Collapse defaultActiveKey={['文本']} ghost expandIconPosition='end' items={[
              {
                key: '文本',
                label: '文本',
                children: <Text></Text>,
              }
            ]} />

          </div>
        </div>
      )}
    </div>
  )
}
export default Panel
