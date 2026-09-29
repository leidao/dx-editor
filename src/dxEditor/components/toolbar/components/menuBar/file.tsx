import { Button, Dropdown, MenuProps, message, Spin, Upload } from 'antd'
import { useContext, useRef, useState } from 'react'
import FileSaver from 'file-saver'
import EditorContext from '@/dxEditor/context'

import 新建 from '@/dxEditor/components/toolbar/icons/新建.svg?react'
import 打开 from '@/dxEditor/components/toolbar/icons/打开.svg?react'
import 保存 from '@/dxEditor/components/toolbar/icons/保存.svg?react'
import 另存为 from '@/dxEditor/components/toolbar/icons/另存为.svg?react'
import 导入 from '@/dxEditor/components/toolbar/icons/导入.svg?react'
import 导出 from '@/dxEditor/components/toolbar/icons/导出.svg?react'

const File = () => {
  const editor = useContext(EditorContext)
  const inputRef = useRef<HTMLInputElement>(null)
  const [spinning, setSpinning] = useState(false)
  const [filename, setFilename] = useState('dx_editor.json')

  const save = (name = filename) => {
    if (!editor) return
    const finalName = name.endsWith('.json') ? name : `${name}.json`
    const blob = new Blob([JSON.stringify(editor.tree.toJSON())], { type: 'application/json' })
    FileSaver.saveAs(blob, finalName)
    setFilename(finalName)
  }

  const readFile = (file: File, options?: { onSuccess?: (value: null) => void; onError?: (error: Error) => void }) => {
    const reader = new FileReader()
    setSpinning(true)
    reader.onload = () => {
      try {
        if (!editor || typeof reader.result !== 'string') throw new Error('图纸读取失败')
        editor.importJson(JSON.parse(reader.result))
        setFilename(file.name)
        options?.onSuccess?.(null)
      } catch (error) {
        message.error('文件错误，导入失败')
        options?.onError?.(error instanceof Error ? error : new Error('导入失败'))
      } finally {
        setSpinning(false)
      }
    }
    reader.onerror = () => {
      message.error('文件读取失败')
      options?.onError?.(reader.error || new Error('文件读取失败'))
      setSpinning(false)
    }
    reader.readAsText(file)
  }

  const items: MenuProps['items'] = [
    {
      key: 'new', label: <span className="text-12px ml-10px">新建</span>, icon: <新建 />,
      onClick: () => {
        if (!editor || (editor.tree.children.length > 0 && !window.confirm('新建图纸会清空当前内容，继续吗？'))) return
        editor.importJson({ children: [] })
        setFilename('dx_editor.json')
      }
    },
    {
      key: 'open', label: <span className="text-12px ml-10px">打开</span>, icon: <打开 />,
      onClick: () => inputRef.current?.click()
    },
    { type: 'divider' },
    {
      key: 'save', label: <span className="text-12px ml-10px">保存</span>, icon: <保存 />,
      onClick: () => save()
    },
    {
      key: 'saveAs', label: <span className="text-12px ml-10px">另存为</span>, icon: <另存为 />,
      onClick: () => {
        const name = window.prompt('文件名', filename)
        if (name?.trim()) save(name.trim())
      }
    },
    { type: 'divider' },
    {
      key: 'import', label: <Upload showUploadList={false} maxCount={1} accept="application/json,.json"
        customRequest={options => readFile(options.file as File, options)}>
        <span className="text-12px ml-10px">导入</span>
      </Upload>, icon: <导入 />
    },
    {
      key: 'export', label: <span className="text-12px ml-10px">导出</span>, icon: <导出 />,
      onClick: () => save('dx_editor.json')
    }
  ]

  return (
    <>
      <Dropdown menu={{ items }} placement="bottomLeft" overlayStyle={{ minWidth: '188px' }}>
        <Button type="text">文件</Button>
      </Dropdown>
      <input ref={inputRef} type="file" accept="application/json,.json" hidden onChange={event => {
        const file = event.target.files?.[0]
        if (file) readFile(file)
        event.target.value = ''
      }} />
      <Spin spinning={spinning} fullscreen />
    </>
  )
}

export default File
