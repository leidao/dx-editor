/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-04 15:57:57
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-04 17:45:37
 */
import { useState } from 'react'
import { Button, Select, Upload } from "antd"

interface Props {
  url: string
  bgUrl: string
  mode: string
  onUpload: (v: any) => void
  onImageModeChange: (v: any) => void
}

const options = [
  {
    label: '正常',
    value: 'normal',
  },
  {
    label: '覆盖',
    value: 'cover',
  },
  {
    label: '适应',
    value: 'fit',
  },
  {
    label: '拉伸',
    value: 'strench',
  },
  {
    label: '裁剪',
    value: 'clip',
  },
  {
    label: '平铺',
    value: 'repeat',
  },
]
const UploadImage: React.FC<Props> = ({ url, bgUrl, mode, onUpload,onImageModeChange }) => {
  console.log('url', url, url || bgUrl);

  const customRequest = (options: any) => {
    const url = URL.createObjectURL(options.file)
    onUpload(url)
  }
  return <div>
    <div>
      <Upload
        showUploadList={false}
        maxCount={1}
        accept="image/png, image/jpeg"
        customRequest={customRequest}>
        <div className='w-246px h-150px cursor-pointer '>
          <div className='imgBg h-100% flex justify-center items-center relative '>
            <img src={url || bgUrl} className='w-135px h-135px absolute z-0' />
            <div className='w-100% h-100% bg-#101116bf absolute left-0px top-0px opacity-0 hover:opacity-100 z-10 flex justify-center items-center'>
              <Button>替换图片</Button>
            </div>
          </div>
        </div>
      </Upload>
    </div>
    <div className='mt-10px'>
      <Select
        value={mode}
        className='w-160px'
        // variant="borderless"
        variant='filled'
        size='small'
        options={options}
        onChange={(value) => {
          onImageModeChange(value)
        }}
      />
    </div>
  </div>
}

export default UploadImage