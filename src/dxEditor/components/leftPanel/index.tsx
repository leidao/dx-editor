/*
 * @Description: 结构
 * @Author: ldx
 * @Date: 2023-12-21 15:31:25
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-24 11:01:25
 */

import './index.scss'
import { Tabs, TabsProps } from 'antd'

import Assets from './metafile/index'
// import Layer from './layer'
const items: TabsProps['items'] = [
  {
    key: 'element',
    label: '图元',
    forceRender:true,
    children: <Assets />
  },
  // {
  //   key: 'layer',
  //   label: '图层',
  //   forceRender:true,
  //   children: <Layer />
  // }
]

const Structure = () => {
  return (
    <div className="structure w-100% h-100%">
      <Tabs className='h-100%' defaultActiveKey="element" centered items={items} size="small"></Tabs>
    </div>
  )
}
export default Structure

