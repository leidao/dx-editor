/*
 * @Description:
 * @Author: ldx
 * @Date: 2022-04-06 14:45:22
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-01 18:00:52
 */
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
// import * as fs from 'fs'
import LessPluginImportNodeModules from 'less-plugin-import-node-modules'
// import lessToJS from 'less-vars-to-js'
import path from 'path-browserify'
import { presetUno } from 'unocss'
import Unocss from 'unocss/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 可以直接使用index.less文件名，会导致debug不准
    // autoCSSModulePlugin(),
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
    Unocss({
      presets: [
        presetUno()
        // ...custom presets
      ]
      // safelist: safelist
    })
  ],
  build: {
    outDir: 'docs'
  },
  base: '/circuit-graph',
  server: {
    port: 8004,
    open: true,
    host:true,
    // 接口代理地址设置
    proxy: {}
  },
  css: {
    preprocessorOptions: {
      less: {
        // 全局导入
        additionalData: '@import "./src/css/variables.scss";',
        // 支持内联 JavaScript
        javascriptEnabled: true,
        module: true,
        // 解析第三方包的less样式
        plugins: [new LessPluginImportNodeModules()]
        // 重写 less 变量，定制样式
        // modifyVars: themeVariables
      }
    }
  },
  resolve: {
    alias: {
      // 路径别名设置
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname, 'node_modules/')
    }
  }
})
