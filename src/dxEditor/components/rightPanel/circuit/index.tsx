/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-04 13:39:32
 */
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/dxEditor/context'
import { Img, Object2D } from '@/dxCanvas'

type Props = {
  selectList: Img[]
}
const CircuitSetting:React.FC<Props> = () => {
  const editor = useContext(EditorContext)
  const [selectList, setSelectList] = useState<(Img[])>([])


  useEffect(() => {
    if (!editor) return
    return () => {
    }

  }, [editor])


  return (
    <div className="w-100% h-100%">

    </div>
  )
}
export default CircuitSetting
