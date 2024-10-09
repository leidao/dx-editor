/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 11:03:37
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-06 11:10:56
 */
import { useContext, useState } from 'react'

import EditorContext from '@/editor/context'

import imgData, { Children } from './imgs'
type Props = {
  className?: string
}
const PicAssets: React.FC<Props> = ({ className = '' }) => {
  const editor = useContext(EditorContext)
  const [selected, setSelected] = useState('元件')
  const [imgs, setImgs] = useState<Children[]>(
    imgData.find((data) => data.name === selected)?.children || []
  )
  const dragstart = (event: React.DragEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement | null
    if (!editor || !img) return
    event.dataTransfer.setData('img',img.src)
    event.dataTransfer.setData('name',img.alt)
    const container = editor.domElement
    container.addEventListener('dragenter', editor.dragenter)
    container.addEventListener('dragleave', editor.dragleave)
    container.addEventListener('dragover', editor.dragover)
    container.addEventListener('drop', editor.drop)
  }
  const dragend = () => {
    if (!editor) return
    const container = editor.domElement
    container.removeEventListener('dragenter', editor.dragenter)
    container.removeEventListener('dragleave', editor.dragleave)
    container.removeEventListener('dragover', editor.dragover)
    container.removeEventListener('drop', editor.drop)
  }
  const styleFn = (value: string): { [key: string]: string } => {
    return {
      writingMode: 'vertical-lr',
      background: selected === value ? '#fff' : '#eee',
      color: selected === value ? '#0f8fff' : '#000',
      borderColor: selected === value ? '#fff' : '#dadadc99',
      width: selected === value ? '44px' : '42px'
    }
  }
  return (
    <div className={`${className} w-240px  flex h-100%`}>
      <div className="w-43px text-#202020 bg-#eee">
        {imgData.map((data) => {
          return (
            <div
              key={data.name}
              className="cursor-pointer hover:text-#0f8fff"
              style={styleFn(data.name)}
              onClick={() => {
                setSelected(data.name)
                setImgs(data.children)
              }}
            >
              <div className="my-20px mx-10px">{data.name}</div>
            </div>
          )
        })}
      </div>
      <div
        className="flex-1 p-10px overflow-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(82px, 1fr))',
          gridTemplateRows: 'repeat(auto-fill, minmax(72px, 1fr))',
          gap: '10px 6px'
        }}
      >
        {imgs.map((img) => {
          return (
            <div
              key={img.id}
              className="w-82px h-80px p-6px box-border cursor-pointer border-1px hover:border-#666 rounded-6px border-#fff flex flex-col justify-between"
            >
              <img
                src={img.url}
                alt={img.name}
                width="70"
                height="50"
                onDragStart={dragstart}
                onDragEnd={dragend}
                className="cursor-copy"
              />
              <div
                className="max-w-70px text-center"
                style={{ font: '16px arial, sans-serif' }}
              >
                {img.name}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PicAssets
