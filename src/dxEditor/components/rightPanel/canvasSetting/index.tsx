/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-06 14:10:08
 */
import { Collapse, ColorPicker, Empty, Select, Slider } from 'antd'
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/dxEditor/context'
import _ from 'lodash'
import NumberInput from '../components/numberInput'
import globalConfig from '@/dxEditor/config'


const adsorbOptions = [
  { value: 1, label: '是' },
  { value: 0, label: '否' },
]
const CanvasSettings = () => {
  const editor = useContext(EditorContext)

  // 背景颜色
  const [bgColor, setBgColor] = useState<string>()
  // 网格颜色
  const [gridColor, setGridColor] = useState<string>()
  // 网格大小
  const [gridSize, setGridSize] = useState<number>()
  const [isAdsorb, setIsAdsorb] = useState(1)
  // 标尺背景颜色
  const [rulerBgColor, setRulerBgColor] = useState<string>()
  // 标尺文字颜色
  const [rulerTextColor, setRulerTextColor] = useState<string>()
  useEffect(() => {
    if (!editor) return
    const container = document.getElementById('dx_container')
    const backgroundColor = getComputedStyle(container!).backgroundColor
    setBgColor(backgroundColor)
    setGridColor(globalConfig.gridColor)
    setGridSize(globalConfig.gridSize)
    setRulerBgColor(globalConfig.rulerBgColor)
    setRulerTextColor(globalConfig.rulerTextColor)
  }, [editor])


  return (
    <div className="w-100% h-100%">
      <Collapse defaultActiveKey={['画布属性']} ghost expandIconPosition='end' items={[
        {
          key: '画布属性',
          label: '画布属性',
          children: (
            <div>
              <div className='flex mb-10px pt-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>背景色</div>
                <div className='ml-14px flex items-center'>
                  <ColorPicker
                    className='w-180px'
                    value={bgColor}
                    size='small'
                    // allowClear
                    // showText
                    showText={() => bgColor ? <span>{bgColor}</span> : <span style={{ color: '#00000040' }}>混合</span>}
                    // mode={['single', 'gradient']}
                    onChange={(value) => {
                      const color = value.toHexString()
                      setBgColor(color)
                      const container = document.getElementById('dx_container')
                      if (!container) return
                      container.style.backgroundColor = color
                    }}
                  />
                </div>
              </div>
              <div className='flex my-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>网格颜色</div>
                <div className='ml-14px flex items-center'>
                  <ColorPicker
                    className='w-180px'
                    value={gridColor}
                    size='small'
                    // allowClear
                    // showText
                    showText={() => gridColor ? <span>{gridColor}</span> : <span style={{ color: '#00000040' }}>混合</span>}
                    // mode={['single', 'gradient']}
                    onChange={(value) => {
                      const color = value.toHexString()
                      setGridColor(color)
                      globalConfig.gridColor = color
                      editor?.ground.render()
                    }}
                  />
                </div>
              </div>
              <div className='flex my-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>网格大小</div>
                <div className='ml-14px flex items-center'>
                  <NumberInput
                    min={1}
                    className='w-180px h-24px'
                    size='small'
                    value={gridSize}
                    placeholder='混合'
                    onChange={(value) => {
                      setGridSize(value)
                      globalConfig.gridSize = value
                      editor?.ground.render()
                    }}
                  />
                </div>
              </div>
              <div className='flex my-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>吸附</div>
                <div className='ml-14px flex items-center'>
                  <Select
                    className='w-180px bg-#fff'
                    size='small'
                    value={isAdsorb}
                    options={adsorbOptions}
                    placeholder='混合'
                    onChange={(value) => {
                      setIsAdsorb(value)
                      if (value) {
                        globalConfig.moveSize = globalConfig.gridSize / 2
                      } else {
                        globalConfig.moveSize = 0.5
                      }
                    }}
                  />
                </div>
              </div>
              <div className='flex mb-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>标尺背景色</div>
                <div className='ml-14px flex items-center'>
                  <ColorPicker
                    className='w-180px'
                    value={rulerBgColor}
                    size='small'
                    // allowClear
                    // showText
                    showText={() => rulerBgColor ? <span>{rulerBgColor}</span> : <span style={{ color: '#00000040' }}>混合</span>}
                    // mode={['single', 'gradient']}
                    onChange={(value) => {
                      const color = value.toHexString()
                      setRulerBgColor(color)
                      globalConfig.rulerBgColor = color
                      editor?.sky.render()
                    }}
                  />
                </div>
              </div>
              <div className='flex mb-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>标尺文字色</div>
                <div className='ml-14px flex items-center'>
                  <ColorPicker
                    className='w-180px'
                    value={rulerTextColor}
                    size='small'
                    // allowClear
                    // showText
                    showText={() => rulerTextColor ? <span>{rulerTextColor}</span> : <span style={{ color: '#00000040' }}>混合</span>}
                    // mode={['single', 'gradient']}
                    onChange={(value) => {
                      const color = value.toHexString()
                      setRulerTextColor(color)
                      globalConfig.rulerTextColor = color
                      editor?.sky.render()
                    }}
                  />
                </div>
              </div>
            </div>
          ),
        }
      ]} />
    </div>
  )
}
export default CanvasSettings
