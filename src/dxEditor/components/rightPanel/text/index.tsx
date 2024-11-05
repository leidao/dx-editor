/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-04 14:03:00
 */
import '../index.scss'
import { Collapse, ColorPicker, Empty, Select, Slider } from 'antd'
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/dxEditor/context'
import { Text, TextStyleType } from '@/dxCanvas'
// import { IFontWeight, ITextDecoration } from '@leafer-ui/interface'
import FontSize from './fontSize'
import NumberInput from '../components/numberInput'
import { EditorEvent } from '@/dxEditor/event'

const fontWeightOptions = [100, 200, 300, 400, 500, 600, 700, 800, 900].map(item => ({ value: item, label: item }))
const textStyleOptions = [
  { value: 'normal', label: '正常' },
  { value: 'italic', label: '斜体' },
]
const textDecorationOptions = [
  { value: 'under', label: '下划线' },
  { value: 'delete', label: '删除线' },
  { value: 'none', label: '默认' },
]

const fontFamilyOptions = [
  {
    value: 'arial', label: '默认字体',
  },
  {
    value: 'AlimamaDaoLiTi', label: '刀隶体',
  },
  {
    value: 'AlimamaFangYuanTiVF', label: '方圆体',
  },
  {
    value: 'bailufeiyunshouxieti', label: '白路飞云手写体',
  },
]


type Props = {
  selectList: Text[]
}
const TextSetting: React.FC<Props> = ({ selectList }) => {
  const editor = useContext(EditorContext)
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
    const colors = selectList.map(element => element.style.fillStyle as string)
    setColor(colors.every(color => color === colors[0]) ? colors[0] : undefined)
    const fontFamilys = selectList.map(element => element._style.fontFamily || '')
    setFontFamily(fontFamilys.every(fontFamily => fontFamily === fontFamilys[0]) ? fontFamilys[0] : undefined)
    const fontSizes = selectList.map(element => element._style.fontSize || 12)
    setFontSize(fontSizes.every(fontSize => fontSize === fontSizes[0]) ? fontSizes[0] : undefined)
    const fontWeights = selectList.map(element => element._style.fontWeight)
    setFontWeight(fontWeights.every(fontWeight => fontWeight === fontWeights[0]) ? fontWeights[0] : undefined)
    const fontStyles = selectList.map(element => element._style.fontStyle)
    setFontStyle(fontStyles.every(fontStyle => fontStyle === fontStyles[0]) ? fontStyles[0] : undefined)
    // const textDecorations = selectList.map(element => element.textDecoration || 'none')
    // setTextDecoration(textDecorations.every(textDecoration => textDecoration === textDecorations[0]) ? textDecorations[0] : undefined)
    // const letterSpacings = selectList.map(element => typeof element.letterSpacing === 'number' ? element.letterSpacing : element.letterSpacing?.value || 0)
    // setLetterSpacing(letterSpacings.every(letterSpacing => letterSpacing === letterSpacings[0]) ? letterSpacings[0] : undefined)
    // const lineHeights = selectList.map(element => typeof element.lineHeight === 'number' ? element.lineHeight : element.lineHeight?.value || 0)
    // setLineHeight(lineHeights.every(lineHeight => lineHeight === lineHeights[0]) ? lineHeights[0] : undefined)
  }, [selectList])

  type Attr = keyof TextStyleType
  const changeAttr = (attr: Attr, value: any) => {
    selectList.forEach(item => {
      if (item instanceof Text) {
        item.style[attr] = value
      }
    })
    editor?.tree.render()
  }

  return (
    <div className="w-100% h-100%">
      <Collapse defaultActiveKey={['文本']} ghost expandIconPosition='end' items={[
        {
          key: '文本',
          label: '文本',
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
                      setColor(value.toRgbString())
                      changeAttr('fillStyle', value.toRgbString())
                     
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
                      changeAttr('fontFamily', value)
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
                      changeAttr('fontSize', value)
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
                      changeAttr('fontWeight', value)
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
                      changeAttr('fontStyle', value)
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
                      changeAttr('letterSpacing', {
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
                      changeAttr('lineHeight', {
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
