/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-24 13:54:38
 */
import { Collapse, Empty, Slider } from 'antd'
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/dxEditor/context'
import { Text, Line, Img } from '@/dxCanvas'
// import CanvasSettings from './canvasSetting'
// import BusbarSetting from './busbar'
// import WireSetting from './wire'
// import TextSetting from './text'
// import ModeSetting from './mode'

const Panel = () => {
  const editor = useContext(EditorContext)
  const [selectList, setSelectList] = useState<(any[])>([])

  const change = () => {
    if (!editor) return
    setSelectList(editor.selector.list.slice())
  }
  useEffect(() => {
    if (!editor) return
    // editor.app.on('selectChange', change)
    return () => {
      // editor.app.off('selectChange', change)
    }
  }, [editor])

  const renderComponent = () => {
    if (selectList.every(element => element instanceof Line && element.name === '母线')) {
      return <BusbarSetting selectList={selectList} />
    } else if (selectList.every(element => element instanceof Line && element.name === '导线')) {
      return <WireSetting selectList={selectList} />
    } else if (selectList.every(element => element instanceof Text && element.name === '文字')) {
      return <TextSetting selectList={selectList} />
    } else if (selectList.every(element => element instanceof Img)) {
      return <ModeSetting selectList={selectList} />
    } else {
      return <div className="w-100% h-100% flex justify-center items-center">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="多对象不能修改"
        />
      </div>
    }
  }


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
          {/* {renderComponent()} */}
          123
        </div>
      )}
    </div>
  )
}
export default Panel
