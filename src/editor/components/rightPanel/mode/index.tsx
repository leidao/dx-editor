/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-11 16:21:53
 */
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/editor/context'
import { IUI } from '@leafer-ui/interface'
import { Image } from 'leafer-ui'

type Props = {
  selectList: Image[]
}
const ModeSetting:React.FC<Props> = () => {
  const editor = useContext(EditorContext)
  const [selectList, setSelectList] = useState<(IUI[])>([])


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
export default ModeSetting
