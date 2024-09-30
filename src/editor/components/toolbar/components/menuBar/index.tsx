/*
 * @Description: 工具按钮
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-30 13:39:49
 */

import { Button, Dropdown, MenuProps, Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'

import EditorContext from '@/editor/context'

import File from './file'
import Edit from './edit'
import Insert from './insert'
import Format from './format'
import View from './view'
import Preferences from './preferences'
import logo from '../../icons/logo.svg'
const MenuBar = () => {
  const [selectedName, setSelectedName] = useState('')
  const [tools, setTools] = useState<any[]>([])
  const view = useContext(EditorContext)

  useEffect(() => {
    if (!view) return

  }, [view])


  return (
    <div className="flex-1 flex items-center h-30px py-4px">
      <div className='mr-20px'><img src={logo} alt="dx-editor" /></div>
      <div>
        <File></File>
        <Edit></Edit>
        <Insert></Insert>
        <Format></Format>
        <View></View>
        <Preferences></Preferences>
      </div>
    </div>
  )
}

export default MenuBar
