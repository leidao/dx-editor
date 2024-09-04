/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-04 14:26:55
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-04 17:45:22
 */
import { Popover } from 'antd'
import CustomColor from './customColor'
import tinycolor from 'tinycolor2'
import SwitchHeader from './switchHeader'
import UploadImage from './upload'
interface Props {
  option: {
    color: string
    type: string
    url: string
    bgUrl: string
    mode: string
  }
  onChange: (v: any) => void
  onSwitchChange: (v: any) => void
  onUpload: (v: any) => void
  onImageModeChange: (v: any) => void
}

// const 

const ColorPicker: React.FC<Props> = ({ option, onChange, onSwitchChange, onUpload ,onImageModeChange}) => {

  return <Popover
    overlayClassName='custom_color_picker'
    placement="left"
    trigger='click'
    arrow={false}
    content={
      <div className='custom_color_picker'>
        <SwitchHeader type={option.type} onChange={onSwitchChange} />
        {option.type === 'image' ? <UploadImage url={option.url} bgUrl={option.bgUrl} mode={option.mode} onUpload={onUpload} onImageModeChange={onImageModeChange}/> : <CustomColor color={option.color} onChange={onChange} />}
      </div>
    }>
    <div className='w-18px h-18px border-1px border-solid border-#cfcfcf p-2px rounded-4px cursor-pointer' >
      {
        option.url ?
          <img src={option.url} className='w-100% h-100% rounded-4px' /> :
          <div className='w-100% h-100% rounded-4px' style={{ background: tinycolor(option.color) }}></div>
      }
    </div>
  </Popover>
}

export default ColorPicker

