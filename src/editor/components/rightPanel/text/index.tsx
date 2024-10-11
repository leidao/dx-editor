/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-11 18:05:08
 */
import '../index.scss'
import { Collapse, Empty, Select, Slider } from 'antd'
import { useContext, useEffect, useState } from 'react'
import EditorContext from '@/editor/context'
import { Text } from 'leafer-ui'
import ColorPicker from '../components/color'
import { IFontWeight } from '@leafer-ui/interface'
import FontSize from './fontSize'
import NumberInput from '../components/numberInput'

const fontWeightOptions = [100, 200, 300, 400, 500, 600, 700, 800, 900].map(item => ({ value: item, label: item }))
const textDecorationOptions = [
  { value: 'under', label: '下划线' },
  { value: 'delete', label: '删除线' },
  { value: 'none', label: '默认' },
]

const fontFamilyOptions = [
  {
    value: 'L', label: '默认字体',
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
  const [color, setColor] = useState('#000')
  // 字体， 同 css，多个字体用逗号隔开。
  const [fontFamily, setFontFamily] = useState('L')
  // 文字大小。
  const [fontSize, setFontSize] = useState(12)
  // 文字粗细。
  const [fontWeight, setFontWeight] = useState<IFontWeight>(400)
  // 文字下划线或删除线。
  const [textDecoration, setTextDecoration] = useState('none')
  // 文字是否倾斜
  // const [italic, setItalic] = useState(false)
  // 字间距
  const [letterSpacing, setLetterSpacing] = useState(0)
  // 行间距
  const [lineHeight, setLineHeight] = useState(1.5)

  useEffect(() => {
    if (selectList.length === 0) return
    setColor(selectList[0].data.sourceColor)
    setFontFamily(selectList[0].fontFamily||'')
    setFontSize(selectList[0].fontSize || 12)
    setFontWeight(selectList[0].fontWeight || 400)
    setTextDecoration(selectList[0].textDecoration || 'none')
    setLetterSpacing(typeof selectList[0].letterSpacing === 'number' ? selectList[0].letterSpacing : selectList[0].letterSpacing?.value || 0)
    setLineHeight(typeof selectList[0].lineHeight === 'number' ? selectList[0].lineHeight : selectList[0].lineHeight?.value || 1.5)
  }, [selectList])

  type Attr = 'fontFamily' | 'fontSize' | 'fontWeight' | 'textDecoration' | 'textAlign' | 'verticalAlign' | 'italic' | 'textOverflow' | 'letterSpacing' | 'lineHeight' | 'fill'
  const changeAttr = (attr: Attr, value: any) => {
    selectList.forEach(item => {
      if (item instanceof Text && item.__tag === 'Text') {
        item[attr] = value
      }
    })
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
                    color={color}
                    onChange={(value: any) => {
                      setColor(value.rgb)
                      changeAttr('fill', value.rgb)
                      selectList.forEach(item => {
                        item.data.sourceColor = value.rgb
                      })
                    }}
                    onOpenChange={(value) => {
                      if (value) {
                        // editor.selector.visible = false
                        // editor.app.editor.config.keyEvent = false
                      } else {
                        // editor.app.editor.visible = true
                        // editor.app.editor.config.keyEvent = true
                        selectList.forEach(item => {
                          item.fill = item.data.selectColor
                        })
                        editor?.app.tree.emit('update')
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
                    onChange={(value) => {
                      setFontFamily(value)
                      changeAttr('fontFamily', value)
                      editor?.app.tree.emit('update')
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
                      editor?.app.tree.emit('update')
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
                    onChange={(value) => {
                      setFontWeight(value)
                      changeAttr('fontWeight', value)
                      editor?.app.tree.emit('update')
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
                    value={textDecoration}
                    options={textDecorationOptions}
                    onChange={(value) => {
                      setTextDecoration(value)
                      changeAttr('textDecoration', value)
                      editor?.app.tree.emit('update')
                    }}
                  />
                </div>
              </div>
              <div className='flex my-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>字间距</div>
                <div className='ml-14px flex items-center'>
                  <NumberInput
                    className="w-180px"
                    value={letterSpacing}
                    min={0}
                    step={0.1}
                    onChange={(value) => {
                      setLetterSpacing(value)
                      changeAttr('letterSpacing', {
                        type: 'percent',
                        value: value,
                      })
                      editor?.app.tree.emit('update')
                    }}
                  />
                </div>
              </div>
              <div className='flex my-10px'>
                <div className='w-60px text-12px text-#00000099 mt-2px'>行间距</div>
                <div className='ml-14px flex items-center'>
                  <NumberInput
                    className="w-180px"
                    value={lineHeight}
                    min={1}
                    step={0.5}
                    onChange={(value) => {
                      setLineHeight(value)
                      changeAttr('lineHeight', {
                        type: 'percent',
                        value: value,
                      })
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
export default TextSetting
