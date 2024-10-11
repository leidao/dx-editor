/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-11 16:28:28
 */
import { Collapse, Empty, Slider } from 'antd'
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/editor/context'
import { IUI } from '@leafer-ui/interface'
import { EditorEvent, EditorMoveEvent, EditorRotateEvent, EditorScaleEvent, Line } from 'leafer-editor'
import _ from 'lodash'

type Props = {
  selectList: Line[]
}
const BusbarSetting:React.FC<Props> = () => {
  const editor = useContext(EditorContext)
  const [selectList, setSelectList] = useState<(IUI[])>([])


  useEffect(() => {
    if (!editor) return
    return () => {
    }

  }, [editor])


  return (
    <div className="w-100% h-100%">
      123
    </div>
  )
}
export default BusbarSetting
