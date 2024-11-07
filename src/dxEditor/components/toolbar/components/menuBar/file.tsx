/*
 * @Description: 文件
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-07 09:54:13
 */

import { Button, Dropdown, MenuProps, message, Spin, Tooltip, Upload } from 'antd'
import { useContext, useEffect, useState } from 'react'
import FileSaver from "file-saver"
import EditorContext from '@/dxEditor/context'

import 新建 from '@/dxEditor/components/toolbar/icons/新建.svg?react'
import 打开 from '@/dxEditor/components/toolbar/icons/打开.svg?react'
import 保存 from '@/dxEditor/components/toolbar/icons/保存.svg?react'
import 另存为 from '@/dxEditor/components/toolbar/icons/另存为.svg?react'
import 导入 from '@/dxEditor/components/toolbar/icons/导入.svg?react'
import 导出 from '@/dxEditor/components/toolbar/icons/导出.svg?react'



const File = () => {
  const [spinning, setSpinning] = useState(false);
  const editor = useContext(EditorContext)

  useEffect(() => {
    if (!editor) return

  }, [editor])

  const customRequest = (options: any) => {
    console.log('options.file', options);
    const file = options.file
    if (file) {
      const reader = new FileReader();
      setSpinning(true)
      reader.onload = function (e) {
        try {
          const fileContent = e.target?.result || '{}'
          const data = JSON.parse(fileContent as string);
          console.log('解析后的JSON数据：', data);
          editor?.exportJson(data.children)
        } catch (e) {
          message.error('文件错误，导入失败')
        }
        setSpinning(false)
      };

      reader.readAsText(file);
    }
  }

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <span className='text-12px ml-10px'>新建</span>,
      icon: <新建 />,
    },
    {
      key: '2',
      label: <span className='text-12px ml-10px'>打开</span>,
      icon: <打开 />,
    },
    {
      type: 'divider',
    },
    {
      key: '3',
      label: <span className='text-12px ml-10px'>保存</span>,
      icon: <保存 />,
    },
    {
      key: '4',
      label: <span className='text-12px ml-10px'>另存为</span>,
      icon: <另存为 />,
    },
    {
      type: 'divider',
    },
    {
      key: '5',
      label: <div>
        <Upload
          showUploadList={false}
          maxCount={1}
          accept="application/json"
          customRequest={customRequest}>
          <span className='text-12px ml-10px'>导入</span>
        </Upload>
      </div>,
      icon: <导入 />,
    },
    {
      key: '6',
      label: <span className='text-12px ml-10px'>导出</span>,
      icon: <导出 />,
      onClick: () => {
        const data = editor?.tree.toJSON()
        const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
        FileSaver.saveAs(blob, "dx_editor.json");
        console.log('===', data);
      }
    },
  ];
  return (
    <>
      <Dropdown menu={{ items }} placement="bottomLeft" overlayStyle={{ minWidth: '188px' }}>
        <Button type="text">文件</Button>
      </Dropdown>
      <Spin spinning={spinning} fullscreen />
    </>
  )
}

export default File
