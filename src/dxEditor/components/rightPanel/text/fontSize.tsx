/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-02 14:28:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-12 09:56:50
 */
import { Dropdown } from "antd";
import NumberInput from "../components/numberInput"
import { CheckOutlined, DownOutlined } from '@ant-design/icons';
import { useContext } from "react";
import EditorContext from "@/dxEditor/context";
const fontSizeList = [12, 13, 14, 16, 18, 20, 28, 36, 48, 72]

interface Props {
  value: number|undefined
  onChange?: (event: any) => void
}
const FontSize: React.FC<Props> = ({ value, onChange }) => {
  const editor = useContext(EditorContext)
  const items = fontSizeList.map(size => ({
    label: (
      <div className='flex justify-between items-center text-12px w-140px'>
        <div className="w-16px h-16px">
          {value === size && <CheckOutlined />}
        </div>
        <span className="mr-20px">{size}</span>
      </div>
    ),
    key: size,
    onClick: () => onChange && onChange(+size)
  }))

  const dropdown = (
    <Dropdown overlayStyle={{ height: '240px' }} trigger={['click']} menu={{ items }} placement='bottomRight' >
      <DownOutlined className='w-22px h-22px flex items-center justify-center' />
    </Dropdown>
  );

  return <NumberInput
    min={1}
    className='w-180px h-24px'
    size='small'
    addonAfter={dropdown}
    value={value}
    placeholder='混合'
    onChange={(value) => {
      onChange && onChange(+value)
    }}
  />
}

export default FontSize