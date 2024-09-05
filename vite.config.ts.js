// vite.config.ts
import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import LessPluginImportNodeModules from "less-plugin-import-node-modules";
import path from "path-browserify";
import { presetUno } from "unocss";
import Unocss from "unocss/vite";
import { defineConfig } from "vite";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ["ie >= 11"],
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"]
    }),
    Unocss({
      presets: [
        presetUno()
      ]
    })
  ],
  build: {
    outDir: "docs"
  },
  base: "/circuit-graph",
  server: {
    port: 8004,
    open: true,
    host: true,
    proxy: {}
  },
  css: {
    preprocessorOptions: {
      less: {
        additionalData: '@import "./src/css/variables.scss";',
        javascriptEnabled: true,
        module: true,
        plugins: [new LessPluginImportNodeModules()]
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve("/Users/ldx/Documents/ldx/\u51CC\u65E5/dx-editor", "src"),
      "~": path.resolve("/Users/ldx/Documents/ldx/\u51CC\u65E5/dx-editor", "node_modules/")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qXG4gKiBARGVzY3JpcHRpb246XG4gKiBAQXV0aG9yOiBsZHhcbiAqIEBEYXRlOiAyMDIyLTA0LTA2IDE0OjQ1OjIyXG4gKiBATGFzdEVkaXRvcnM6IGxkeFxuICogQExhc3RFZGl0VGltZTogMjAyNC0wOS0wMSAxODowMDo1MlxuICovXG5pbXBvcnQgbGVnYWN5IGZyb20gJ0B2aXRlanMvcGx1Z2luLWxlZ2FjeSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbi8vIGltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IExlc3NQbHVnaW5JbXBvcnROb2RlTW9kdWxlcyBmcm9tICdsZXNzLXBsdWdpbi1pbXBvcnQtbm9kZS1tb2R1bGVzJ1xuLy8gaW1wb3J0IGxlc3NUb0pTIGZyb20gJ2xlc3MtdmFycy10by1qcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgtYnJvd3NlcmlmeSdcbmltcG9ydCB7IHByZXNldFVubyB9IGZyb20gJ3Vub2NzcydcbmltcG9ydCBVbm9jc3MgZnJvbSAndW5vY3NzL3ZpdGUnXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgLy8gXHU1M0VGXHU0RUU1XHU3NkY0XHU2M0E1XHU0RjdGXHU3NTI4aW5kZXgubGVzc1x1NjU4N1x1NEVGNlx1NTQwRFx1RkYwQ1x1NEYxQVx1NUJGQ1x1ODFGNGRlYnVnXHU0RTBEXHU1MUM2XG4gICAgLy8gYXV0b0NTU01vZHVsZVBsdWdpbigpLFxuICAgIGxlZ2FjeSh7XG4gICAgICB0YXJnZXRzOiBbJ2llID49IDExJ10sXG4gICAgICBhZGRpdGlvbmFsTGVnYWN5UG9seWZpbGxzOiBbJ3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZSddXG4gICAgfSksXG4gICAgVW5vY3NzKHtcbiAgICAgIHByZXNldHM6IFtcbiAgICAgICAgcHJlc2V0VW5vKClcbiAgICAgICAgLy8gLi4uY3VzdG9tIHByZXNldHNcbiAgICAgIF1cbiAgICAgIC8vIHNhZmVsaXN0OiBzYWZlbGlzdFxuICAgIH0pXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZG9jcydcbiAgfSxcbiAgYmFzZTogJy9jaXJjdWl0LWdyYXBoJyxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogODAwNCxcbiAgICBvcGVuOiB0cnVlLFxuICAgIGhvc3Q6dHJ1ZSxcbiAgICAvLyBcdTYzQTVcdTUzRTNcdTRFRTNcdTc0MDZcdTU3MzBcdTU3NDBcdThCQkVcdTdGNkVcbiAgICBwcm94eToge31cbiAgfSxcbiAgY3NzOiB7XG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgbGVzczoge1xuICAgICAgICAvLyBcdTUxNjhcdTVDNDBcdTVCRkNcdTUxNjVcbiAgICAgICAgYWRkaXRpb25hbERhdGE6ICdAaW1wb3J0IFwiLi9zcmMvY3NzL3ZhcmlhYmxlcy5zY3NzXCI7JyxcbiAgICAgICAgLy8gXHU2NTJGXHU2MzAxXHU1MTg1XHU4MDU0IEphdmFTY3JpcHRcbiAgICAgICAgamF2YXNjcmlwdEVuYWJsZWQ6IHRydWUsXG4gICAgICAgIG1vZHVsZTogdHJ1ZSxcbiAgICAgICAgLy8gXHU4OUUzXHU2NzkwXHU3QjJDXHU0RTA5XHU2NUI5XHU1MzA1XHU3Njg0bGVzc1x1NjgzN1x1NUYwRlxuICAgICAgICBwbHVnaW5zOiBbbmV3IExlc3NQbHVnaW5JbXBvcnROb2RlTW9kdWxlcygpXVxuICAgICAgICAvLyBcdTkxQ0RcdTUxOTkgbGVzcyBcdTUzRDhcdTkxQ0ZcdUZGMENcdTVCOUFcdTUyMzZcdTY4MzdcdTVGMEZcbiAgICAgICAgLy8gbW9kaWZ5VmFyczogdGhlbWVWYXJpYWJsZXNcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgLy8gXHU4REVGXHU1Rjg0XHU1MjJCXHU1NDBEXHU4QkJFXHU3RjZFXG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShcIi9Vc2Vycy9sZHgvRG9jdW1lbnRzL2xkeC9cdTUxQ0NcdTY1RTUvZHgtZWRpdG9yXCIsICdzcmMnKSxcbiAgICAgICd+JzogcGF0aC5yZXNvbHZlKFwiL1VzZXJzL2xkeC9Eb2N1bWVudHMvbGR4L1x1NTFDQ1x1NjVFNS9keC1lZGl0b3JcIiwgJ25vZGVfbW9kdWxlcy8nKVxuICAgIH1cbiAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFPQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUdBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQO0FBQUEsSUFHQSxPQUFPO0FBQUEsTUFDTCxTQUFTLENBQUM7QUFBQSxNQUNWLDJCQUEyQixDQUFDO0FBQUE7QUFBQSxJQUU5QixPQUFPO0FBQUEsTUFDTCxTQUFTO0FBQUEsUUFDUDtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTU4sT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBO0FBQUEsRUFFVixNQUFNO0FBQUEsRUFDTixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFLO0FBQUEsSUFFTCxPQUFPO0FBQUE7QUFBQSxFQUVULEtBQUs7QUFBQSxJQUNILHFCQUFxQjtBQUFBLE1BQ25CLE1BQU07QUFBQSxRQUVKLGdCQUFnQjtBQUFBLFFBRWhCLG1CQUFtQjtBQUFBLFFBQ25CLFFBQVE7QUFBQSxRQUVSLFNBQVMsQ0FBQyxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNcEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BRUwsS0FBSyxLQUFLLFFBQVEsbURBQXlDO0FBQUEsTUFDM0QsS0FBSyxLQUFLLFFBQVEsbURBQXlDO0FBQUE7QUFBQTtBQUFBOyIsCiAgIm5hbWVzIjogW10KfQo=
