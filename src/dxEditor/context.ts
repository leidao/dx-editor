/*
 * @Description: 编辑器上下文
 * @Author: ldx
 * @Date: 2023-12-21 11:15:14
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-15 22:04:47
 */
import { createContext } from 'react'

import { EditorView } from '../dxEditor'

const EditorContext = createContext<EditorView | null>(null)

export default EditorContext
