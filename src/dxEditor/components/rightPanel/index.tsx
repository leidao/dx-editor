/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-06 15:31:46
 */
import globalConfig from '@/dxEditor/config'
import { Collapse, Empty, Slider } from 'antd'
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/dxEditor/context'
import { Text, Line, Img, Box, IPointerEvent } from '@/dxCanvas'
import { EditorEvent,PointerEvent } from '@/dxEditor/event'
import CanvasSettings from './canvasSetting'
import BusbarSetting from './busbar'
import WireSetting from './wire'
import TextSetting from './text'
import CircuitSetting from './circuit'
import BtnSetting from './btn'
import { getClosestTimesVal, toFixed } from '@/dxEditor/utils'

const Panel = () => {
  const editor = useContext(EditorContext)
  const [selectList, setSelectList] = useState<(any[])>([])
  const [x,setX] = useState<number>()
  const [y,setY] = useState<number>()
  const [wx,setWX] = useState<number>()
  const [wy,setWY] = useState<number>()
  const change = () => {
    if (!editor) return
    setSelectList(editor.selector.list.slice())
  }
  const onMove = (event:PointerEvent)=>{
    if (!editor) return
    if((event.origin?.target as any)?.tagName !== 'CANVAS' ) return
    const { clientX, clientY } = event.origin as IPointerEvent
    const worldPoint = editor.tree.getWorldByClient(clientX, clientY)
    let x = getClosestTimesVal(worldPoint.x, globalConfig.moveSize)
    let y = getClosestTimesVal(worldPoint.y, globalConfig.moveSize)
    setX(x)
    setY(y)
    setWX(+toFixed(worldPoint.x))
    setWY(+toFixed(worldPoint.y))
  }
  useEffect(() => {
    if (!editor) return
    editor.addEventListener(EditorEvent.SELECT, change)
    editor.addEventListener(PointerEvent.MOVE, onMove)    
    return () => {
      editor.removeEventListener(EditorEvent.SELECT, change)
    }
  }, [editor])

  const renderComponent = () => {
    if (selectList.every(element => element instanceof Line && element.name === '母线')) {
      return <BusbarSetting selectList={selectList} />
    } else if (selectList.every(element => element instanceof Line && element.name === '导线')) {
      return <WireSetting selectList={selectList} />
    } else if (selectList.every(element => element instanceof Text && element.name === '文本')) {
      return <TextSetting selectList={selectList} />
    } else if (selectList.every(element => element instanceof Img)) {
      return <CircuitSetting selectList={selectList} />
    }else if (selectList.every(element => element instanceof Box)) {
      return <BtnSetting selectList={selectList} />
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
        <div className="w-100% flex justify-center items-center">
          {/* <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无选中的图形"
          /> */}
          <CanvasSettings></CanvasSettings>
        </div>
      ) : (
        <div className="w-100% box-border">
          {renderComponent()}
        </div>
      )}
      <div className='mt-20px bg-#eee mx-6px text-#333'>
        <div className='flex items-center h-24px  border-b-solid border-b-1px border-#d1d1d1'>
          <div className='w-50% px-6px h-24px flex items-center border-r-solid border-r-1px border-#d1d1d1'>光标X</div>
          <div className='w-50% px-6px h-24px flex items-center'>{x}</div>
        </div>
        <div className='flex items-center h-24px  border-b-solid border-b-1px border-#d1d1d1'>
          <div className='w-50% px-6px h-24px flex items-center border-r-solid border-r-1px border-#d1d1d1'>光标Y</div>
          <div className='w-50% px-6px h-24px flex items-center'>{y}</div>
        </div>
        <div className='flex items-center h-24px  border-b-solid border-b-1px border-#d1d1d1'>
          <div className='w-50% px-6px h-24px flex items-center border-r-solid border-r-1px border-#d1d1d1'>光标WX</div>
          <div className='w-50% px-6px h-24px flex items-center'>{wx}</div>
        </div>
        <div className='flex items-center h-24px'>
          <div className='w-50% px-6px h-24px flex items-center border-r-solid border-r-1px border-#d1d1d1'>光标WY</div>
          <div className='w-50% px-6px h-24px flex items-center'>{wy}</div>
        </div>
      </div>
    </div>
  )
}
export default Panel
