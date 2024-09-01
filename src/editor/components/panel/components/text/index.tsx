/*
 * @Description: 文本设置
 * @Author: ldx
 * @Date: 2024-09-01 17:08:29
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-01 17:48:24
 */
import { Select } from 'antd'
import './index.scss'

const Text = () => {
  return <div>
    <div>
      <Select
        defaultValue="思源黑体"
        className='w-100% mb-10px'
        size='small'
        options={[
          { value: '思源黑体', label: '思源黑体' },
          { value: 'Aa厚底黑', label: 'Aa厚底黑' },
        ]}
      />
    </div>
  </div>
}
export default Text