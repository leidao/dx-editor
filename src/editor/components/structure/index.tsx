/*
 * @Description: 结构
 * @Author: ldx
 * @Date: 2023-12-21 15:31:25
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-01 17:37:54
 */
import { Tabs, TabsProps } from 'antd'

import Assets from './element/index'
import Layer from './layer'
const items: TabsProps['items'] = [
  {
    key: 'element',
    label: '图元',
    forceRender:true,
    children: <Assets />
  },
  {
    key: 'layer',
    label: '图层',
    forceRender:true,
    children: <Layer />
  }
]

const Structure = () => {
  return (
    <div className="w-100% h-100%">
      <Tabs defaultActiveKey="element" centered items={items} size="small"></Tabs>
    </div>
  )
}
export default Structure
