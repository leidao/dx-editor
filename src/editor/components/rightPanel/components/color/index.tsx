/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-04 14:26:55
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-11 16:56:05
 */
import { Popover } from 'antd'
import CustomColor from './customColor'
import tinycolor from 'tinycolor2'
interface Props {
  color: string
  onChange: (v: any) => void
  onOpenChange: (v: any) => void
}

const ColorPicker: React.FC<Props> = ({ color, onChange, onOpenChange }) => {
  return <Popover
    overlayClassName='custom_color_picker'
    placement="left"
    trigger='click'
    arrow={false}
    onOpenChange={onOpenChange}
    content={
      <div className='custom_color_picker'>
          <CustomColor color={color} onChange={onChange} />
      </div>
    }>
    <div className='w-18px h-18px border-1px border-solid border-#cfcfcf p-2px rounded-4px cursor-pointer' >
    <div className='w-100% h-100% rounded-4px' style={{ background: tinycolor(color||'transparent') }}></div>
    </div>
  </Popover>
}

export default ColorPicker

