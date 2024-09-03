/*
 * @Description: 文本设置
 * @Author: ldx
 * @Date: 2024-09-01 17:08:29
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-03 17:09:44
 */
import './index.scss'
import { useContext, useEffect, useState } from 'react';
import FontSize from './fontSize';
import { Collapse, Radio, Select, Tooltip } from 'antd'
import FontColor from '../color';
import { TextAlignLeft, TextAlignCenter, TextAlignRight, TextAlignJustify, TextAlignVTop, TextAlignVCenter, TextAlignVBottom, OmitText, FontItalic, LetterSpacing, LineHeight } from './icons'
import NumberInput from '../numberInput';
import EditorContext from '@/editor/context';
import { IUI, IFontWeight, IUnitData } from '@leafer-ui/interface';
import * as Leafer from 'leafer-ui';
// ITextDecoration
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
interface Props {
  selectList: IUI[]
}
const Text: React.FC<Props> = ({ selectList }) => {
  const [open1, setOpen1] = useState(false)
  const [open2, setOpen2] = useState(false)
  // 字体， 同 css，多个字体用逗号隔开。
  const [fontFamily, setFontFamily] = useState('L')
  // 文字大小。
  const [fontSize, setFontSize] = useState(12)
  // 文字粗细。
  const [fontWeight, setFontWeight] = useState<IFontWeight>(400)
  // 文字下划线或删除线。
  const [textDecoration, setTextDecoration] = useState('none')
  // 文本对齐方式。
  const [textAlign, setTextAlign] = useState('left')
  // 文本垂直对齐。
  const [verticalAlign, setVerticalAlign] = useState('top')
  // 文字是否倾斜
  const [italic, setItalic] = useState(false)
  // 省略文本
  const [textOverflow, setTextOverflow] = useState('show')
  // 字间距
  const [letterSpacing, setLetterSpacing] = useState(0)
  // 行间距
  const [lineHeight, setLineHeight] = useState(1.5)
  const [fontColor, setFontColor] = useState('#000')

  const view = useContext(EditorContext)

  useEffect(() => {
    if (selectList.length === 0) return
    const text = selectList.find(item => item.__tag === 'Text')
    if (text && text instanceof Leafer.Text) {
      setFontFamily(text.fontFamily || 'L')
      setFontSize(text.fontSize || 12)
      setFontWeight(typeof text.fontWeight === 'string' ? 400 : text.fontWeight || 400)
      setTextDecoration(text.textDecoration || 'none')
      setTextAlign(text.textAlign || 'left')
      setVerticalAlign(text.verticalAlign || 'top')
      setItalic(text.italic || false)
      setTextOverflow(text.textOverflow || 'show')
      setLetterSpacing(typeof text.letterSpacing === 'number' ? text.letterSpacing : text.letterSpacing?.value || 0)
      setLineHeight(typeof text.lineHeight === 'number' ? text.lineHeight : text.lineHeight?.value || 1.5)
    }
  }, [selectList])

  type Attr = 'fontFamily' | 'fontSize' | 'fontWeight' | 'textDecoration' | 'textAlign' | 'verticalAlign' | 'italic' | 'textOverflow' | 'letterSpacing' | 'lineHeight'
  const changeAttr = (attr: Attr, value: any) => {
    selectList.forEach(item => {
      if (item instanceof Leafer.Text && item.__tag === 'Text') {
        item[attr] = value
      }
    })
  }

  return <div className='panel_text'>
    <Collapse defaultActiveKey={['文本']} ghost expandIconPosition='end' items={[
      {
        key: '文本',
        label: '文本',
        children: (
          <div>
            <div className='mb-10px'>
              <Select
                value={fontFamily}
                className='w-100% bg-#fff'
                // variant="borderless"
                variant='filled'
                size='small'
                options={fontFamilyOptions}
                onChange={(value) => {
                  setFontFamily(value)
                  changeAttr('fontFamily', value)
                  view?.app.tree.emit('update')
                }}
                onFocus={() => {
                  if (!view) return
                  view.app.editor.config.keyEvent = false
                }}
                onBlur={() => {
                  if (!view) return
                  view.app.editor.config.keyEvent = true
                  view.app.tree.emit('update')
                }}
              />
            </div>
            <div className='mb-10px flex justify-between items-center'>
              <div className='flex justify-between items-center w-60px'>
                <Tooltip placement="bottom" title='倾斜' arrow={false}>
                  <span
                    className="flex justify-center items-center hover:bg-#f2f2f2 cursor-pointer  rounded-6px"
                    onClick={() => {
                      setItalic(!italic)
                      changeAttr('italic', !italic)
                      view?.app.tree.emit('update')
                    }}
                    style={{ background: italic ? '#e6e7eb' : '' }} >
                    <FontItalic />
                  </span>
                </Tooltip>
                <Tooltip placement="bottom" title='省略文本' arrow={false}>
                  <span
                    className="flex justify-center items-center hover:bg-#f2f2f2 cursor-pointer  rounded-6px w-24px h-24px"
                    onClick={() => {
                      setTextOverflow(textOverflow === '...' ? 'show' : '...')
                      changeAttr('textOverflow', textOverflow === '...' ? 'show' : '...')
                      view?.app.tree.emit('update')
                    }}
                    style={{ background: textOverflow === '...' ? '#e6e7eb' : '' }} >
                    <OmitText />
                  </span>
                </Tooltip>
              </div>
              <div className='flex justify-between items-center ml-20px'>
                <Tooltip open={open1} placement="bottom" title='字间距' arrow={false}>
                  <span
                    onMouseEnter={() => {
                      setOpen1(true)
                    }}
                    onMouseLeave={() => {
                      setOpen1(false)
                    }}
                  >
                    <NumberInput
                      className="w-80px mr-10px"
                      value={letterSpacing}
                      prefix={<LetterSpacing />}
                      min={0}
                      step={0.1}
                      onFocus={() => {
                        setOpen1(false)
                        if (!view) return
                        view.app.editor.config.keyEvent = false
                      }}
                      onBlur={() => {
                        if (!view) return
                        view.app.editor.config.keyEvent = true
                        view.app.tree.emit('update')
                      }}
                      onChange={(value) => {
                        setLetterSpacing(value)
                        changeAttr('letterSpacing', {
                          type: 'percent',
                          value: value,
                        })
                      }}
                    />
                  </span>
                </Tooltip>
                <Tooltip open={open2} placement="bottom" title='行间距' arrow={false}>
                  <span
                    onMouseEnter={() => {
                      setOpen2(true)
                    }}
                    onMouseLeave={() => {
                      setOpen2(false)
                    }}
                  >
                    <NumberInput
                      className="w-80px"
                      value={lineHeight}
                      prefix={<LineHeight />}
                      min={0}
                      step={0.5}
                      onFocus={() => {
                        setOpen2(false)
                        if (!view) return
                        view.app.editor.config.keyEvent = false
                      }}
                      onBlur={() => {
                        if (!view) return
                        view.app.editor.config.keyEvent = true
                        view.app.tree.emit('update')
                      }}
                      onChange={(value) => {
                        setLineHeight(value)
                        changeAttr('lineHeight', {
                          type: 'percent',
                          value: value,
                        })
                      }}

                    />
                  </span>
                </Tooltip>
              </div>
            </div>
            <div className='mb-10px flex items-center'>
              <div>
                <FontSize value={fontSize}
                  onChange={(value) => {
                    setFontSize(value)
                    changeAttr('fontSize', value)
                    view?.app.tree.emit('update')
                  }}
                ></FontSize>
              </div>
              <div className='ml-16px h-24px'>
                <Select
                  className='w-80px bg-#fff'
                  size='small'
                  value={fontWeight}
                  options={fontWeightOptions}
                  variant='filled'
                  onChange={(value) => {
                    setFontWeight(value)
                    changeAttr('fontWeight', value)
                    view?.app.tree.emit('update')
                  }}
                  onFocus={() => {
                    if (!view) return
                    view.app.editor.config.keyEvent = false
                  }}
                  onBlur={() => {
                    if (!view) return
                    view.app.editor.config.keyEvent = true
                    view.app.tree.emit('update')
                  }}
                />
              </div>
              <div className='ml-16px h-24px'>
                <Select
                  className='w-80px bg-#fff'
                  size='small'
                  variant='filled'
                  value={textDecoration}
                  options={textDecorationOptions}
                  onChange={(value) => {
                    setTextDecoration(value)
                    changeAttr('textDecoration', value)
                    view?.app.tree.emit('update')
                  }}
                  onFocus={() => {
                    if (!view) return
                    view.app.editor.config.keyEvent = false
                  }}
                  onBlur={() => {
                    if (!view) return
                    view.app.editor.config.keyEvent = true
                    view.app.tree.emit('update')
                  }}
                />
              </div>
            </div>
            <div className='flex items-center justify-between mb-10px'>
              <Radio.Group value={textAlign}  size='small'
                onChange={(e) => {
                  setTextAlign(e.target.value)
                  changeAttr('textAlign', e.target.value)
                  view?.app.tree.emit('update')
                }}
              >
                <Tooltip placement="bottom" title='左对齐' arrow={false}>
                  <Radio.Button value="left">
                    <TextAlignLeft />
                  </Radio.Button>
                </Tooltip>
                <Tooltip placement="bottom" title='水平居中' arrow={false}>
                  <Radio.Button value="center"><TextAlignCenter /></Radio.Button>
                </Tooltip>
                <Tooltip placement="bottom" title='右对齐' arrow={false}>
                  <Radio.Button value="right"><TextAlignRight /></Radio.Button>
                </Tooltip>
                <Tooltip placement="bottom" title='两端对齐' arrow={false}>
                  <Radio.Button value="justify"><TextAlignJustify /></Radio.Button>
                </Tooltip>
              </Radio.Group>
              <Radio.Group value={verticalAlign} size='small'
                onChange={(e) => {
                  setVerticalAlign(e.target.value)
                  changeAttr('verticalAlign', e.target.value)
                  view?.app.tree.emit('update')
                }}
              >
                <Tooltip placement="bottom" title='上对齐' arrow={false}>
                  <Radio.Button value="top"><TextAlignVTop /></Radio.Button>
                </Tooltip>
                <Tooltip placement="bottom" title='垂直居中' arrow={false}>
                  <Radio.Button value="middle"><TextAlignVCenter /></Radio.Button>
                </Tooltip>
                <Tooltip placement="bottom" title='下对齐' arrow={false}>
                  <Radio.Button value="bottom"><TextAlignVBottom /></Radio.Button>
                </Tooltip>
              </Radio.Group>
            </div>

          </div>
        ),
      }
    ]} />
  </div>


}
export default Text