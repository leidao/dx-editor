/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-04 11:25:58
 */
import { Collapse, ColorPicker, Empty, Select, Slider } from 'antd'
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/dxEditor/context'
import _ from 'lodash'
import NumberInput from '../components/numberInput'
import { Line, StandStyleType } from '@/dxCanvas'
import { EditorEvent } from '@/dxEditor/event'

const patternOptions = [
  { value: 'solid', label: '实线' },
  { value: 'dash', label: '虚线' },
]

type Props = {
  selectList: Line[]
}
const Busbar: React.FC<Props> = ({ selectList }) => {
  const editor = useContext(EditorContext)

  // 颜色
  const [strokeStyle, setStrokeStyle] = useState<string>()
  // 线宽
  const [lineWidth, setLineWidth] = useState<number>()

  // 样式
  const [pattern, setPattern] = useState<string>('solid')


  useEffect(() => {
    if (!editor) return
    const colors = selectList.map(element => element.style.strokeStyle as string)
    setStrokeStyle(colors.every(color => color === colors[0]) ? colors[0] : undefined)
    const lineWidths = selectList.map(element => element.style.lineWidth || 1) as number[]
    setLineWidth(lineWidths.every(lineWidth => lineWidth === lineWidths[0]) ? lineWidths[0] : undefined)
    // const dashOffsets = selectList.map(element => element.dashOffset)
    const lineDashs = selectList.map(element => element.style.lineDash)
    // const flag1 = dashOffsets.every(dashOffset => typeof dashOffset !== 'undefined')
    const flag = lineDashs.every(lineDash => lineDash)
    if (flag) {
      setPattern('dash')
    } else {
      setPattern('solid')
    }

  }, [editor])

  type Attr = keyof StandStyleType
  const changeAttr = (attr: Attr, value: any) => {
    selectList.forEach(item => {
      item.style[attr] = value
    })
    editor?.tree.render()
  }


  return (
    <div className="w-100% h-100%">
      <Collapse defaultActiveKey={['母线']} ghost expandIconPosition='end' items={[
        {
          key: '母线',
          label: '母线',
          children: (
            <div>
              <div className='flex mb-10px pt-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>颜色</div>
                <div className='ml-14px flex items-center'>
                  <ColorPicker
                    className='w-180px'
                    value={strokeStyle}
                    size='small'
                    // allowClear
                    // showText
                    showText={() => strokeStyle ? <span>{strokeStyle}</span> : <span style={{ color: '#00000040' }}>混合</span>}
                    // mode={['single', 'gradient']}
                    onChange={(value) => {
                      setStrokeStyle(value.toHexString())
                      changeAttr('strokeStyle', value.toHexString())
                    }}
                    onOpenChange={(value) => {
                      if (!value) {
                        editor?.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
                      }
                    }}
                  />
                </div>
              </div>
              <div className='flex mb-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>线宽</div>
                <div className='ml-14px flex items-center'>
                  <NumberInput
                    className="w-180px"
                    value={lineWidth}
                    min={0.5}
                    step={1}
                    onChange={(value) => {
                      setLineWidth(value)
                      changeAttr('lineWidth', value)
                      editor?.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
                    }}
                  />
                </div>
              </div>
              <div className='flex mb-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>样式</div>
                <div className='ml-14px flex items-center'>
                  <Select
                    value={pattern}
                    className='w-180px'
                    size='small'
                    options={patternOptions}
                    placeholder='混合'
                    onChange={(value) => {
                      setPattern(value)
                      if (value === 'solid') {
                        changeAttr('lineDash', undefined)
                        changeAttr('lineDashOffset', 0)
                      } else {
                        changeAttr('lineDash', [20, 10])
                        changeAttr('lineDashOffset', 0)
                      }
                      editor?.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
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
export default Busbar
