# 桌面萌宠

桌面萌宠是一个运行在 Windows 桌面上的轻量小狗宠物应用。它使用 Electron 创建透明、无边框、始终置顶的窗口，让小狗在当前显示器的工作区域内持续游走，并在触碰屏幕边缘时自动折返。

## 功能

- 在透明、无边框窗口中显示桌面小狗
- 自动在当前显示器工作区域内游走
- 到达屏幕边缘后改变方向，不遮挡任务栏区域
- 点击小狗暂停移动并切换到吐舌头的互动姿态
- 再次点击恢复游走
- 通过系统托盘显示、暂停、继续或退出应用
- 限制为单实例运行

## 技术栈

- [Electron](https://www.electronjs.org/)
- 原生 JavaScript、HTML 和 CSS
- [electron-builder](https://www.electron.build/) 打包 Windows 便携版程序

## 架构

应用按 Electron 的进程边界分为三层：

```text
Electron 主进程
  窗口、运动、屏幕边界、托盘
          <-> IPC
Preload 安全桥
          <->
渲染层
  HTML 小狗、CSS 动画、点击交互
```

- `src/main.js`：创建并管理桌面窗口，在主进程中维护位置、速度、屏幕边界和托盘状态。
- `src/preload.js`：通过 `contextBridge` 暴露有限的暂停与状态通知接口。
- `src/renderer/renderer.js`：管理 `wandering` 和 `cute` 两种交互状态。
- `src/renderer/index.html`：定义小狗的 HTML 结构。
- `src/renderer/styles.css`：绘制小狗并实现走路、摇尾巴、反弹和互动动画。

渲染进程启用了上下文隔离，并禁用了 Node.js 集成。原生窗口位置只由主进程维护，渲染层仅负责展示和用户交互。

## 目录结构

```text
.
|-- build/                 # 应用图标和打包资源
|-- openspec/              # 需求、设计与任务记录
|-- scripts/               # 辅助脚本
|-- src/
|   |-- main.js            # Electron 主进程入口
|   |-- preload.js         # 安全 IPC 桥
|   `-- renderer/          # 页面、交互逻辑与样式
|-- out/                   # electron-builder 生成的构建产物
|-- package.json
`-- README.md
```

## 环境要求

- Windows 10 或 Windows 11
- Node.js 22 或更高版本
- npm

## 本地运行

安装依赖：

```powershell
npm install
```

启动应用：

```powershell
npm start
```

应用启动后不会显示在任务栏中。可以通过系统托盘菜单控制小狗或退出应用。

## 生成图标

需要重新生成打包图标时运行：

```powershell
npm run generate:icon
```

脚本使用 PowerShell 和 `System.Drawing` 生成 `build/icon.png`。

## Windows 打包

生成 x64 Windows 便携版程序：

```powershell
npm run build:win
```

产物会写入 `out/`，默认文件名为：

```text
桌面萌宠-<version>-Portable.exe
```

该文件是便携版程序，无需安装即可直接运行。当前构建未进行代码签名，分发到其他电脑后，Windows 可能会显示 Microsoft Defender SmartScreen 提示。

## 当前限制

- 仅面向 Windows 和 x64 架构
- 小狗窗口仍是矩形点击区域，透明部分不会自动穿透鼠标事件
- 不支持拖拽、调整大小、开机启动、配置持久化或多只宠物
- 当前没有自动化测试，窗口行为需要在 Windows 桌面环境中手动验证

## 设计文档

完整的需求、架构决策和实现任务位于：

```text
openspec/changes/desktop-pup-wander/
```
