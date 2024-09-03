/*
 * @Description: 自动布局
 * @Author: ldx
 * @Date: 2024-08-31 13:19:10
 * @LastEditors: ldx
 * @LastEditTime: 2024-08-31 16:53:35
 */
import { useContext, useEffect, useMemo, useState } from "react"
import { AlignLeft, HorizontalCenter, AlignRight, AlignTop, VerticalCenter, AlignBottom } from '../stats/icons'
import EditorContext from "@/editor/context"
import { isWindows } from "@/editor/utils"
import { Tooltip } from "antd"
import { IUI } from "@leafer-ui/interface"
interface Props {
  selectList: IUI[]
}
const Flow: React.FC<Props> = ({ selectList }) => {
  const [icons, setIcons] = useState<any[]>([])
  const view = useContext(EditorContext)

  const disabled = useMemo(() => selectList.length <= 1, [selectList])

  useEffect(() => {
    if (!view) return
    const icons = [
      {
        keyboard: 'clt+alt+l',
        name: '左对齐',
        icon: <AlignLeft />,
        tip: `左对齐  ${isWindows ? 'Alt+Ctrl+L' : '⌥⌘L'}`,
        action: view.manager.keybord.hotkeys.alignLeft
      },
      {
        keyboard: 'clt+alt+c',
        name: '水平居中',
        icon: <HorizontalCenter />,
        tip: `水平居中  ${isWindows ? 'Alt+Ctrl+C' : '⌥⌘C'}`,
        action: view.manager.keybord.hotkeys.horizontalCenter
      },
      {
        keyboard: 'clt+alt+r',
        name: '右对齐',
        icon: <AlignRight />,
        tip: `右对齐  ${isWindows ? 'Alt+Ctrl+R' : '⌥⌘R'}`,
        action: view.manager.keybord.hotkeys.alignRight
      },
      {
        keyboard: 'clt+alt+t',
        name: '顶对齐',
        icon: <AlignTop />,
        tip: `顶对齐  ${isWindows ? 'Alt+Ctrl+T' : '⌥⌘T'}`,
        action: view.manager.keybord.hotkeys.alignTop
      },
      {
        keyboard: 'clt+alt+m',
        name: '垂直居中',
        icon: <VerticalCenter />,
        tip: `垂直居中  ${isWindows ? 'Alt+Ctrl+M' : '⌥⌘M'}`,
        action: view.manager.keybord.hotkeys.verticalCenter
      },
      {
        keyboard: 'clt+alt+b',
        name: '底对齐',
        icon: <AlignBottom />,
        tip: `底对齐  ${isWindows ? 'Alt+Ctrl+B' : '⌥⌘B'}`,
        action: view.manager.keybord.hotkeys.alignBottom
      }
    ]
    setIcons(icons)
    icons.forEach(icon => {
      if (!icon.keyboard) return
      view.manager.keybord.register({
        keyboard: icon.keyboard,
        name: icon.name,
        action: icon.action
      })
    })
    return () => {
      icons.forEach(icon => {
        if (!icon.keyboard) return
        view.manager.keybord.unRegister(icon.name)
      })
    }
  }, [view])


  return <div className="h-40px flex items-center justify-between px-12px">
    {
      icons.map(item =>
        <div
          key={item.name}
          className="hover:bg-#f2f2f2  rounded-6px w-28px h-28px flex items-center justify-center"
          onClick={() => {
            item.action && item.action()
          }}
        >
          <Tooltip placement="bottom" title={item.tip} arrow={false}>
            <span className="flex justify-center items-center" style={{ fill: disabled ? '#0000004d' : '#333', cursor: disabled ? 'not-allowed' : 'pointer' }} >
              {item.icon}
            </span>
          </Tooltip>
        </div>
      )
    }
  </div>
}
export default Flow