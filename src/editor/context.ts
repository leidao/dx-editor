/*
 * @Description: 编辑器上下文
 * @Author: ldx
 * @Date: 2023-12-21 11:15:14
 * @LastEditors: ldx
 * @LastEditTime: 2024-08-21 15:29:40
 */
import { createContext } from 'react'

import { EditorView } from './view'

const EditorContext = createContext<EditorView | null>(null)

export default EditorContext
