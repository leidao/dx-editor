/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-08-30 16:23:14
 * @LastEditors: ldx
 * @LastEditTime: 2024-08-31 10:18:41
 */

import { InputNumber } from "antd";
import { toFixed } from '@/editor/utils'
import './index.scss'
interface INumberInputProps {
  value: string | number;
  placeholder?: string;
  min?: number;
  max?: number;
  onChange?: (newValue: number) => void;
  onBlur?: (event: any) => void;
  onFocus?: (event: any) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  className?:string
}

const NumberInput: React.FC<INumberInputProps> = ({
  value,
  placeholder = '',
  min = -Infinity,
  max = Infinity,
  onChange,
  onFocus,
  onBlur,
  prefix,
  suffix,
  className
}) => {
  return <InputNumber
    size="small"
    value={value}
    min={min}
    max={max}
    step={1}
    controls={false}
    placeholder={placeholder}
    formatter={(value) => `${toFixed(value, 2)}`}
    className={`h-26px border-transparent hover:border-#d9d9d9 text-#00000066 ${className}`}
    onPressEnter={(event: any) => {
      const value = event.target?.value
      if (!isNaN(value - parseFloat(value))) {
        onChange && onChange(value)
      }
    }}
    onStep={(value: any) => {
      if (!isNaN(value - parseFloat(value))) {
        onChange && onChange(value)
      }
    }}
    onBlur={(event: any) => {
      const value = event.target?.value
      console.log('value',value);
      
      if (!isNaN(value - parseFloat(value))) {
        onChange && onChange(value)
      }
      onBlur && onBlur(event)
    }}
    onFocus={(event: any) =>
      onFocus && onFocus(event)
    }
    prefix={prefix}
    suffix={suffix}
  />
}

export default NumberInput