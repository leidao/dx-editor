/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-14 10:18:38
 */
import { Collapse, ColorPicker, Empty, Select, Slider } from 'antd'
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/dxEditor/context'
import { IStroke, IUI } from '@leafer-ui/interface'
import { EditorEvent, EditorMoveEvent, EditorRotateEvent, EditorScaleEvent, Line } from 'leafer-editor'
import _ from 'lodash'
import NumberInput from '../components/numberInput'

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
  const [color, setColor] = useState<string>()
  // 线宽
  const [strokeWidth, setStrokeWidth] = useState<number>()

  // 样式
  const [pattern, setPattern] = useState<string>('solid')


  useEffect(() => {
    if (!editor) return
    const colors = selectList.map(element => element.stroke as string)
    setColor(colors.every(color => color === colors[0]) ? colors[0] : undefined)
    const strokeWidths = selectList.map(element => element.strokeWidth || 1) as number[]
    setStrokeWidth(strokeWidths.every(strokeWidth => strokeWidth === strokeWidths[0]) ? strokeWidths[0] : undefined)
    const dashOffsets = selectList.map(element => element.dashOffset)
    const dashPatterns = selectList.map(element => element.dashPattern)
    const flag1 = dashOffsets.every(dashOffset=>typeof dashOffset !== 'undefined')
    const flag2 = dashPatterns.every(dashPattern=>dashPattern)
    if(flag1 && flag2){
      setPattern('dash')
    }else{
      setPattern('solid')
    }
    
  }, [editor])

  type Attr = 'fill' | 'stroke' | 'strokeWidth' | 'strokeAlign' | 'strokeWidthFixed' | 'dashPattern' | 'dashOffset'
  const changeAttr = (attr: Attr, value: any) => {
    selectList.forEach(item => {
      item[attr] = value
    })
  }


  return (
    <div className="w-100% h-100%">
      <Collapse defaultActiveKey={['导线']} ghost expandIconPosition='end' items={[
        {
          key: '导线',
          label: '导线',
          children: (
            <div>
              <div className='flex mb-10px pt-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>颜色</div>
                <div className='ml-14px flex items-center'>
                  <ColorPicker
                    className='w-180px'
                    value={color}
                    size='small'
                    // allowClear
                    // showText
                    showText={() => color ? <span>{color}</span> : <span style={{ color: '#00000040' }}>混合</span>}
                    // mode={['single', 'gradient']}
                    onChange={(value) => {
                      setColor(value.toHexString())
                      changeAttr('stroke', value.toHexString())
                      selectList.forEach(item => {
                        item.data.sourceColor = value.toHexString()
                      })
                    }}
                    onOpenChange={(value) => {
                      if (!value) {
                        selectList.forEach(item => {
                          item.stroke = item.data.selectColor
                        })
                        editor?.app.tree.emit('update')
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
                    value={strokeWidth}
                    min={0.5}
                    step={1}
                    onChange={(value) => {
                      setStrokeWidth(value)
                      changeAttr('strokeWidth', value)
                      editor?.app.tree.emit('update')
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
                        changeAttr('dashPattern', undefined)
                        changeAttr('dashOffset', 0)
                      } else {
                        changeAttr('dashPattern', [20,10])
                        changeAttr('dashOffset', 0)
                      }
                      editor?.app.tree.emit('update')
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
