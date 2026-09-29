import { Button, Dropdown, Input, MenuProps, message, Modal } from 'antd'
import { useContext, useState } from 'react'
import EditorContext from '@/dxEditor/context'
import 快捷键 from '@/dxEditor/components/toolbar/icons/快捷键.svg?react'

const Preferences = () => {
  const editor = useContext(EditorContext)
  const [open, setOpen] = useState(false)
  const [, refresh] = useState(0)
  const items: MenuProps['items'] = [
    {
      key: 'shortcuts', label: <span className="text-12px ml-10px">快捷键设置</span>,
      icon: <快捷键 />, onClick: () => setOpen(true)
    },
    {
      key: 'canvas', label: <span className="text-12px ml-10px">画布设置</span>,
      icon: <span className="w-16px h-16px" />,
      onClick: () => editor?.selector.cancel()
    }
  ]

  return (
    <>
      <Dropdown menu={{ items }} placement="bottomLeft" overlayStyle={{ minWidth: '188px' }}>
        <Button type="text">设置</Button>
      </Dropdown>
      <Modal title="快捷键设置" open={open} footer={null} onCancel={() => setOpen(false)}>
        <p>使用 ctrl、shift、alt 与按键组合；Mac 上用 ctrl 表示 ⌘。</p>
        <div className="max-h-400px overflow-auto">
          {Array.from(editor?.keybord.KeybordMap.values() || []).map(command => (
            <div key={command.name} className="flex items-center gap-12px my-8px">
              <span className="w-120px">{command.name}</span>
              <Input defaultValue={Array.isArray(command.keyboard) ? command.keyboard[0] : command.keyboard}
                onBlur={event => {
                  try {
                    editor?.keybord.setShortcut(command.name, event.target.value)
                    refresh(value => value + 1)
                  } catch (error) {
                    message.error(error instanceof Error ? error.message : '快捷键保存失败')
                    event.target.value = Array.isArray(command.keyboard) ? command.keyboard[0] : command.keyboard
                  }
                }} />
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}

export default Preferences
