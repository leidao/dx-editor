/*
 * @Description: 工具栏
 * @Author: ldx
 * @Date: 2022-04-06 19:34:55
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-29 16:46:06
 */

import MenuBar from './components/menuBar'
import ToolBtn from './components/toolBtn'
import ToolZoom from './components/toolZoom'
type Props = {
  className?: string
}
const ToolBar: React.FC<Props> = ({ className = '' }) => {
  return (
    <div className={`${className}`}>
      <div>
        <MenuBar></MenuBar>
      </div>
      <div className='flex justify-center items-center '>
        <ToolBtn></ToolBtn>
        <ToolZoom></ToolZoom>
      </div>

    </div>
  )
}
export default ToolBar
