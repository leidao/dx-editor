import { Button, Dropdown, Empty, MenuProps, message, Modal, Spin, Upload } from 'antd'
import { useContext, useEffect, useRef, useState } from 'react'
import FileSaver from 'file-saver'
import EditorContext from '@/dxEditor/context'
import { EditorEvent } from '@/dxEditor/event'
import type { RecoverySummary } from '@/dxEditor/documentSession'

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
  const [recoveryOpen, setRecoveryOpen] = useState(false)
  const [recoveries, setRecoveries] = useState<RecoverySummary[]>([])

  const refreshRecoveries = () => setRecoveries(editor?.documentSession.getRecoveryCopies() || [])
  const openRecovery = () => {
    refreshRecoveries()
    setRecoveryOpen(true)
  }

  const save = (name = filename) => {
    if (!editor) return
    const finalName = name.endsWith('.json') ? name : `${name}.json`
    try {
      const blob = new Blob([JSON.stringify(editor.tree.toJSON())], { type: 'application/json' })
      const backedUp = editor.documentSession.startDownload(() => FileSaver.saveAs(blob, finalName))
      setFilename(finalName)
      if (!backedUp) {
        message.warning('下载已发起，但本地备份失败。请确认文件已保存。')
      }
    } catch {
      message.error('保存失败，请重试')
    }
  }

  useEffect(() => {
    if (!editor) return
    const onSave = () => save()
    editor.addEventListener(EditorEvent.SAVE, onSave)
    return () => editor.removeEventListener(EditorEvent.SAVE, onSave)
  }, [editor, filename])

  const exportPng = () => {
    if (!editor) return
    editor.tree.render()
    requestAnimationFrame(() => {
      try {
        const source = editor.tree._canvas
        const canvas = document.createElement('canvas')
        canvas.width = source.width
        canvas.height = source.height
        const context = canvas.getContext('2d')
        if (!context) throw new Error('无法创建图片画布')
        context.fillStyle = '#fff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.drawImage(source, 0, 0)
        canvas.toBlob(blob => {
          if (blob) FileSaver.saveAs(blob, filename.replace(/\.json$/i, '') + '.png')
          else message.error('PNG 导出失败')
        }, 'image/png')
      } catch { message.error('PNG 导出失败，请检查图元图片是否可用') }
    })
  }

  const readFile = (file: File, options?: { onSuccess?: (value: null) => void; onError?: (error: Error) => void }) => {
    const reader = new FileReader()
    setSpinning(true)
    reader.onload = () => {
      try {
        if (!editor || typeof reader.result !== 'string') throw new Error('图纸读取失败')
        const drawing = JSON.parse(reader.result)
        if (!editor.documentSession.confirmDiscard()) {
          options?.onSuccess?.(null)
          return
        }
        editor.importJson(drawing)
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
        if (!editor || !editor.documentSession.confirmDiscard()) return
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
    },
    {
      key: 'exportPng', label: <span className="text-12px ml-10px">导出当前视图 PNG</span>, icon: <导出 />,
      onClick: exportPng
    },
    { type: 'divider' },
    {
      key: 'recovery', label: <span className="text-12px ml-10px">恢复本地草稿</span>,
      onClick: openRecovery
    }
  ]

  return (
    <>
      <Dropdown menu={{ items }} trigger={['click']} placement="bottomLeft" overlayStyle={{ minWidth: '188px' }}>
        <Button type="text">文件</Button>
      </Dropdown>
      <input ref={inputRef} type="file" accept="application/json,.json" hidden onChange={event => {
        const file = event.target.files?.[0]
        if (file) readFile(file)
        event.target.value = ''
      }} />
      <Spin spinning={spinning} fullscreen />
      <Modal title="本地草稿与下载备份" open={recoveryOpen} footer={null} onCancel={() => setRecoveryOpen(false)}>
        {recoveries.length === 0 ? <Empty description="暂无可恢复的图纸" /> : recoveries.map(copy =>
          <div key={copy.id} className="flex items-center gap-8px py-8px border-b border-#eee">
            <span className="flex-1 text-12px">
              {copy.kind === 'download' ? '保存下载备份' : '稍后恢复的草稿'} · {new Date(copy.savedAt).toLocaleString()}
            </span>
            <Button size="small" onClick={() => {
              if (editor?.documentSession.restoreRecoveryCopy(copy.id)) {
                setFilename('dx_editor.json')
                setRecoveryOpen(false)
                message.success('已恢复图纸，请保存新的 JSON 文件')
              }
            }}>恢复</Button>
            <Button size="small" danger onClick={() => {
              if (!window.confirm('丢弃这份本地备份？删除后无法恢复。')) return
              if (editor?.documentSession.discardRecoveryCopy(copy.id)) refreshRecoveries()
              else message.error('删除备份失败')
            }}>丢弃</Button>
          </div>)}
      </Modal>
    </>
  )
}

export default File
