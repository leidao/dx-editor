/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-06 09:47:09
 */
import '../index.scss'
import { Collapse, ColorPicker, Empty, Select, Slider } from 'antd'
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/dxEditor/context'
import { Box, Text, TextStyleType } from '@/dxCanvas'
// import { IFontWeight, ITextDecoration } from '@leafer-ui/interface'
import FontSize from '../text/fontSize'
import { EditorEvent } from '@/dxEditor/event'
import NumberInput from '../components/numberInput'
import { fontFamilyOptions, fontWeightOptions, textStyleOptions } from '../text'




type Props = {
  selectList: Box[]
}
const TextSetting: React.FC<Props> = ({ selectList }) => {
  const editor = useContext(EditorContext)
  // 背景颜色
  const [bgcolor, setBgColor] = useState<string>()
  // 圆角
  const [radius, setRadius] = useState<number>()
  // 颜色
  const [color, setColor] = useState<string>()
  // 字体， 同 css，多个字体用逗号隔开。
  const [fontFamily, setFontFamily] = useState<string>()
  // 文字大小。
  const [fontSize, setFontSize] = useState<number>()
  // 文字粗细。
  const [fontWeight, setFontWeight] = useState<number>()
  // 文字下划线或删除线。
  const [textDecoration, setTextDecoration] = useState()
  // 文字是否倾斜
  const [fontStyle, setFontStyle] = useState<string>()
  // 字间距
  const [letterSpacing, setLetterSpacing] = useState<number>()
  // 行间距
  const [lineHeight, setLineHeight] = useState<number>()

  useEffect(() => {
    if (selectList.length === 0) return
    const bgColors = selectList.map(element => element.style.fillStyle as string)
    setBgColor(bgColors.every(color => color === bgColors[0]) ? bgColors[0] : undefined)
    const radiuss = selectList.map(element => element.cornerRadius)
    setRadius(radiuss.every(radius => radius === radiuss[0]) ? radiuss[0] : undefined)

    const child = selectList.map(element=>element.children[0]) as Text[]
    const colors = child.map(element => element.style.fillStyle as string)
    setColor(colors.every(color => color === colors[0]) ? colors[0] : undefined)
    const fontFamilys = child.map(element => element._style.fontFamily || '')
    setFontFamily(fontFamilys.every(fontFamily => fontFamily === fontFamilys[0]) ? fontFamilys[0] : undefined)
    const fontSizes = child.map(element => element._style.fontSize || 12)
    setFontSize(fontSizes.every(fontSize => fontSize === fontSizes[0]) ? fontSizes[0] : undefined)
    const fontWeights = child.map(element => element._style.fontWeight)
    setFontWeight(fontWeights.every(fontWeight => fontWeight === fontWeights[0]) ? fontWeights[0] : undefined)
    const fontStyles = child.map(element => element._style.fontStyle)
    setFontStyle(fontStyles.every(fontStyle => fontStyle === fontStyles[0]) ? fontStyles[0] : undefined)
    
  }, [selectList])

  type Attr = keyof TextStyleType
  const changeChildAttr = (attr: Attr, value: any) => {
    const child = selectList.map(element=>element.children[0]) as Text[]
    child.forEach(item => {
      if (item instanceof Text) {
        item.style[attr] = value
      }
    })
    editor?.tree.render()
  }

  return (
    <div className="w-100% h-100%">
      <Collapse defaultActiveKey={['按钮']} ghost expandIconPosition='end' items={[
        {
          key: '按钮',
          label: '按钮',
          children: (
            <div>
              <div className='flex mb-10px pt-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>背景颜色</div>
                <div className='ml-14px flex items-center'>
                  <ColorPicker
                    className='w-180px'
                    value={bgcolor}
                    size='small'
                    // allowClear
                    // showText
                    showText={() => bgcolor ? <span>{bgcolor}</span> : <span style={{ color: '#00000040' }}>混合</span>}
                    // mode={['single', 'gradient']}
                    onChange={(value) => {
                      const color = value.toHexString()
                      setBgColor(color)
                      selectList.forEach(item => {
                        if (item instanceof Box) {
                          item.style.fillStyle = color
                        }
                      })
                      editor?.tree.render()
                    }}
                    onOpenChange={(value) => {
                      if (!value) {
                        editor?.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
                      }
                    }}
                  />
                </div>
              </div>
              <div className='flex my-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>圆角大小</div>
                <div className='ml-14px flex items-center'>
                  <NumberInput
                    min={1}
                    className='w-180px h-24px'
                    size='small'
                    value={radius}
                    placeholder='混合'
                    onChange={(value) => {
                      selectList.forEach(item => {
                        if (item instanceof Box) {
                          item.cornerRadius = value
                        }
                      })
                      editor?.tree.render()
                      editor?.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
                    }}
                  />
                </div>
              </div>
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
                      changeChildAttr('fillStyle', value.toHexString())
                    }}
                    onOpenChange={(value) => {
                      if (!value) {
                        editor?.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
                      }
                    }}
                  />
                </div>
              </div>
              <div className='flex my-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>字体</div>
                <div className='ml-14px flex items-center'>
                  <Select
                    value={fontFamily}
                    className='w-180px'
                    size='small'
                    options={fontFamilyOptions}
                    placeholder='混合'
                    onChange={(value) => {
                      setFontFamily(value)
                      changeChildAttr('fontFamily', value)
                      editor?.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
                    }}
                  />
                </div>
              </div>
              <div className='flex my-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>字体大小</div>
                <div className='ml-14px flex items-center'>
                  <FontSize value={fontSize}
                    onChange={(value) => {
                      setFontSize(value)
                      changeChildAttr('fontSize', value)
                      editor?.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
                    }}
                  />
                </div>
              </div>
              <div className='flex my-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>字体粗细</div>
                <div className='ml-14px flex items-center'>
                  <Select
                    className='w-180px bg-#fff'
                    size='small'
                    value={fontWeight}
                    options={fontWeightOptions}
                    placeholder='混合'
                    onChange={(value) => {
                      setFontWeight(value)
                      changeChildAttr('fontWeight', value)
                      editor?.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
                    }}
                  />
                </div>
              </div>
              <div className='flex my-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>样式</div>
                <div className='ml-14px flex items-center'>
                  <Select
                    className='w-180px bg-#fff'
                    size='small'
                    placeholder='混合'
                    value={fontStyle}
                    options={textStyleOptions}
                    onChange={(value) => {
                      setFontStyle(value)
                      changeChildAttr('fontStyle', value)
                      editor?.dispatchEvent(EditorEvent.UPDATE, new EditorEvent('update'))
                    }}
                  />
                </div>
              </div>
              {/* <div className='flex my-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>字间距</div>
                <div className='ml-14px flex items-center'>
                  <NumberInput
                    className="w-180px"
                    value={letterSpacing}
                    min={0}
                    step={0.1}
                    placeholder='混合'
                    onChange={(value) => {
                      setLetterSpacing(value)
                      changeChildAttr('letterSpacing', {
                        type: 'percent',
                        value: value,
                      })
                      // editor?.app.tree.emit('update')
                    }}
                  />
                </div>
              </div> */}
              {/* <div className='flex my-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>行间距</div>
                <div className='ml-14px flex items-center'>
                  <NumberInput
                    className="w-180px"
                    value={lineHeight}
                    min={1}
                    step={0.5}
                    placeholder='混合'
                    onChange={(value) => {
                      setLineHeight(value)
                      changeChildAttr('lineHeight', {
                        type: 'percent',
                        value: value,
                      })
                      // editor?.app.tree.emit('update')
                    }}
                  />
                </div>
              </div> */}

            </div>
          ),
        }
      ]} />
    </div>
  )
}
export default TextSetting
