# [Sports VR] Web-based feedback system

<!-- vim-markdown-toc GFM -->

* [計劃目標](#計劃目標)
    - [短期](#短期)
    - [中期](#中期)
    - [長期](#長期)
    - [遠期](#遠期)
* [系統介紹](#系統介紹)
    - [功能概述](#功能概述)
    - [技術細節](#技術細節)
        + [姿態輸入](#姿態輸入)
        + [分析方法](#分析方法)
        + [骨架呈現](#骨架呈現)
        + [操作界面](#操作界面)
* [專案架構](#專案架構)
    - [安裝步驟](#安裝步驟)
    - [前端插件](#前端插件)
    - [檔案結構](#檔案結構)
    - [模組列表（API）](#模組列表api)
* [當前狀態](#當前狀態)
    - [前端](#前端)
* [里程設定（checkpoint）](#里程設定checkpoint)
    - [姿態評估](#姿態評估)
    - [視覺呈現](#視覺呈現)
    - [界面控制](#界面控制)
    - [回饋分享](#回饋分享)
* [預備知識（prerequisite）](#預備知識prerequisite)
* [參考資料](#參考資料)
    - [3D 人體姿態估計](#3d-人體姿態估計)
    - [3D 動作姿態格式](#3d-動作姿態格式)
    - [Three.js](#threejs)
* [進度追蹤](#進度追蹤)

<!-- vim-markdown-toc -->

## 計劃目標

### 短期

-   [ ] 實現人體姿態視覺化的主要功能（fucntion design），包含評估姿態優劣（solver）、呈現問題所在（helper）、設定輔助物件（painter）等等。

### 中期

-   [ ] 實現人體姿態視覺化的控制環境（UI design），使其可以在桌球運動中，讓教練可以分析姿態並給予回饋（feedback），也讓受測者能據此獲得學習成效。

### 長期

-   [ ] 實現人體姿態視覺化的核心框架（framework），使其可以根據不同運動的領域知識來調整參數，適配到各自的系統應用中（application）。

### 遠期

-   [ ] 實現敵、球、拍、場等要素的視覺化，使其可以讓運動團隊進行戰術分析。

## 系統介紹

### 功能概述

-   本系統透過對運動員動作捕捉，來分析對其所偵測到的姿態，並在三維空間中將骨架視覺化，讓使用者可以在網頁上進行觀察、操作，並給予回饋。

### 技術細節

#### 姿態輸入

-   本系統以標準骨架動畫 BVH 格式（[Biovision Hierarchy](https://en.wikipedia.org/wiki/Biovision_Hierarchy)）輸入人體姿態，此規範先定義人體各關節的階層架構與 T 型姿勢下的初始座標與相對位移，再儲存每個動畫幀各關節當前變換資訊（local transformation）。

#### 分析方法

-   本系統透過比較運動員與教練的對應姿態差異進行分析，其流程先將兩者的動作透過 DTW 演算法（[Dynamic Time Warping](https://en.wikipedia.org/wiki/Dynamic_time_warping)）對齊動畫以消除節奏因素，再利用人體姿態估計量度方法 MPJPE（Mean Per Joint Position Error）評估運動員相對於教練的姿態正確性。

#### 骨架呈現

-   本系統在三維空間繪製人體骨架，並以顏色呈現姿態差異，具體使用前端三維視覺化工具（[Three.js](https://threejs.org)）定義骨頭、關節等資料結構，並讓對應關節根據位置差異大於或小於預設閥值來顯示不同顯色。

#### 操作界面

-   本系統以網頁作為系統的操作界面，包含設定場景視角、瀏覽骨架動畫，以及給予回饋等功能，其中以 [React.js](https://zh-hant.reactjs.org) 作為前端環境，並以與其相關的 UI 框架如 [Material-UI](https://mui.com/zh/) 實作控制界面的物件。

## 專案架構

### 安裝步驟

```bash=
git clone https://github.com/misakisuna705/Pose-Solver.git

cd Pose_Solver/

# node.js 17.0.1 / yarn 1.22.17
yarn install
yarn start
```

### 前端插件

-   project

    -   Create-React-App
        -   react 16.13.1
        -   react-dom 16.13.1
        -   react-scripts 3.4.1

-   package

    -   Three.js
        -   three 0.118.3
    -   Ant Design
        -   antd 4.16.7
        -   ant-design/icons 4.6.2
    -   Bootstrap
        -   bootstrap 4.6.0
        -   react-bootstrap 1.6.1
    -   Material-UI
        -   @material-ui/core 4.12.3
        -   @material-ui/icons 4.11.2
        -   @material-ui/lab 4.0.0-alpha.60
    -   Other
        -   rc-slider 9.7.2

### 檔案結構

```bash=
❯ tree
.
├── App.js # 使用 Creat-React-App 創建的 React.js 環境
├── layout
├    ├── header.js
├    ├── content.js # workspace 的入口點，用以輸入後端資料庫的參數
├    └── footer.js
└── workspace
    ├── workspace.js # 存放控制參數與函數，使其在 view 和 ctrl 間溝通
    ├── view # 使用 Three.js 創建的視覺化環境
    ├   ├── viewer.js # 三維空間的Scene Graph 階層結構，包含 renderer、scene、camera、model 等等
    ├   ├── solver.js # 姿態分析比對，使用 DTW 演算法同步動畫，使用 MPJPE 估計方法評估姿態正確性
    ├   └── helper.js # 視覺化輔助物件joint、bone
    └── ctrl # 使用 Material-UI 創建的控制環境
        ├── modePicker.js # left panel
        ├── playback.js # down panel
        ├── timeSlice.js # right panel
        └── buttonToggler.js # top panel
```

### 模組列表（API）

## 當前狀態

### 前端

|          | 功能                           | 改善                          | 優先 |
| -------- | ------------------------------ | ----------------------------- | ---- |
| 視覺呈現 | 可透過顏色呈現關節位置差異     | 新增輔助工具呈現其他關鍵差異  | 高   |
| 姿態評估 | 可分析全身關節平均優劣         | 使用不同量度分析部分身體部位  | 高   |
| 界面控制 | 可設定不同模式並調整當前動畫幀 | 設定動畫播放速度與段落重播    | 中   |
| 校正回饋 | 無                             | 透過截圖、錄音給予使用者回饋  | 中   |
| 資料存取 | 可從後端資料庫讀取骨架         | 可儲存 / 讀取使用者回饋       | 低   |
| 物件輸入 | 可輸入標準骨架格式             | 對骨架適配對應的皮膚          | 低   |
| 戰術分析 | 無                             | 可加入敵 / 球 / 拍 / 場等要素 | 低   |

## 里程設定（checkpoint）

### 姿態評估

### 視覺呈現

-   繪製物件
    -   目的：
    -   [ ] 分析：
    -   [ ] 實作：

| API                            | 演示                                                                 | 代碼                                                                                             |
| ------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| webgl_interactive_voxelpainter | [演示](https://threejs.org/examples/#webgl_interactive_voxelpainter) | [代碼](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_interactive_voxelpainter.html) |

-   隱藏 / 顯示物件：
    -   目的：
    -   [ ] 分析：
    -   [ ] 實作：

| API          | 演示                                               | 代碼                                                                              |
| ------------ | -------------------------------------------------- | --------------------------------------------------------------------------------- |
| webgl_layers | [演示](https://threejs.org/examples/#webgl_layers) | [代碼](https://github.com/mrdoob/three.js/blob/master/examples/webgl_layers.html) |

-   選取物件：
    -   目的：
    -   [ ] 分析：
    -   [ ] 實作：

| API                              | 演示                                                                   | 代碼                                                                                                  |
| -------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| webgl_camera_cinematic           | [演示](https://threejs.org/examples/#webgl_camera_cinematic)           | [代碼](https://github.com/mrdoob/three.js/blob/master/examples/webgl_camera_cinematic.html)           |
| webgl_instancing_raycast         | [演示](https://threejs.org/examples/#webgl_instancing_raycast)         | [代碼](https://github.com/mrdoob/three.js/blob/master/examples/webgl_instancing_raycast.html)         |
| webgl_postprocessing_outline     | [演示](https://threejs.org/examples/#webgl_postprocessing_outline)     | [代碼](https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing_outline.html)     |
| webgl_interactive_buffergeometry | [演示](https://threejs.org/examples/#webgl_interactive_buffergeometry) | [代碼](https://github.com/mrdoob/three.js/blob/master/examples/webgl_interactive_buffergeometry.html) |
| webgl_interactive_cubes          | [演示](https://threejs.org/examples/#webgl_interactive_cubes)          | [代碼](https://github.com/mrdoob/three.js/blob/master/examples/webgl_interactive_cubes.html)          |
| misc_boxselection                | [演示](https://threejs.org/examples/#misc_boxselection)                | [代碼](https://github.com/mrdoob/three.js/blob/master/examples/misc_boxselection.html)                |
| webgl_interactive_lines          | [演示](https://threejs.org/examples/#webgl_interactive_lines)          | [代碼](https://github.com/mrdoob/three.js/blob/master/examples/webgl_interactive_lines.html)          |

-   移動 / 轉動物件
    -   目的：
    -   [ ] 分析：
    -   [ ] 實作：

| API                     | 演示                                                          | 代碼                                                                                         |
| ----------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| misc_controls_transform | [演示](https://threejs.org/examples/#misc_controls_transform) | [代碼](https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_transform.html) |
| misc_controls_drag      | [演示](https://threejs.org/examples/#misc_controls_drag)      | [代碼](https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_drag.html)      |
| misc_controls_arcball   | [演示](https://threejs.org/examples/#misc_controls_arcball)   | [代碼](https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_arcball.html)   |

-   添加標籤
    -   目的：
    -   [ ] 分析：
    -   [ ] 實作：

| API         | 演示                                              | 代碼                                                                             |
| ----------- | ------------------------------------------------- | -------------------------------------------------------------------------------- |
| css2d_label | [演示](https://threejs.org/examples/#css2d_label) | [代碼](https://github.com/mrdoob/three.js/blob/master/examples/css2d_label.html) |

-   添加軌跡
    -   目的：
    -   [ ] 分析：
    -   [ ] 實作：

| API                                 | 演示                                                                      | 代碼                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| webgl_postprocessing_afterimage     | [演示](https://threejs.org/examples/#webgl_postprocessing_afterimage)     | [代碼](https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing_afterimage.html)     |
| webgl_interactive_raycasting_points | [演示](https://threejs.org/examples/#webgl_interactive_raycasting_points) | [代碼](https://github.com/mrdoob/three.js/blob/master/examples/webgl_interactive_raycasting_points.html) |

-   添加夾角
    -   目的：
    -   [ ] 分析：
    -   [ ] 實作：

| API            | 演示                                                                         | 代碼                                                               |
| -------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| CircleGeometry | [演示](https://threejs.org/docs/scenes/geometry-browser.html#CircleGeometry) | [代碼](https://threejs.org/docs/#api/en/geometries/CircleGeometry) |

-   添加線段
    -   目的：
    -   [ ] 分析：
    -   [ ] 實作：

| API                | 演示                                                     | 代碼                                                                                     |
| ------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| webgl_lines_fat    | [演示](https://threejs.org/examples/#webgl_lines_fat)    | [代碼](https://github.com/mrdoob/three.js/blob/master/examples/webgl_lines_fat.html)     |
| webgl_lines_dashed | [演示](https://threejs.org/examples/#webgl_lines_dashed) | [ 代碼](https://github.com/mrdoob/three.js/blob/master/examples/webgl_lines_dashed.html) |

-   暫停畫面
    -   目的：
    -   [ ] 分析：
    -   [ ] 實作：

| API                       | 演示                                                            | 代碼                                                                                           |
| ------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| misc_controls_pointerlock | [演示](https://threejs.org/examples/#misc_controls_pointerlock) | [代碼](https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html) |

-   射擊子彈
    -   目的：
    -   [ ] 分析：
    -   [ ] 實作：

| API                | 演示                                                     | 代碼                                                                                    |
| ------------------ | -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| physics_ammo_break | [演示](https://threejs.org/examples/#physics_ammo_break) | [代碼](https://github.com/mrdoob/three.js/blob/master/examples/physics_ammo_break.html) |

### 界面控制

### 回饋分享

## 預備知識（prerequisite）

-   編程環境

    -   [x] VS Code
    -   [x] git
    -   [ ] Yarn

-   計算機圖學

    -   [ ] Transformation（video / ppt）
    -   [ ] Lighting（ppt）
    -   [ ] Texture（ppt）

-   Three.js

    -   [ ] [3D 網站開發入門筆記](http://test.domojyun.net/MEMO/3D/threejs.html)
    -   [ ] [DOC](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)
    -   [ ] [Manual](https://threejs.org/manual/#en/fundamentals)
        -   [Responsive Design](https://threejs.org/manual/#en/responsive)
        -   [Rendering on Demand](https://threejs.org/manual/#en/rendering-on-demand)
        -   [Multiple Canvases Multiple Scenes](https://threejs.org/manual/#en/multiple-scenes)
    -   [ ] [How to organize your Three.js code in a cleaner way](https://pierfrancesco-soffritti.medium.com/how-to-organize-the-structure-of-a-three-js-project-77649f58fa3f)
    -   [ ] [Promise loading with Three.js](https://itnext.io/promise-loading-with-three-js-78a6297652a5)

-   React.js

    -   [ ] xx
    -   [ ] Create React App
    -   [ ] [How to use plain Three.js in your React apps](https://itnext.io/how-to-use-plain-three-js-in-your-react-apps-417a79d926e0)

-   Material-UI

## 參考資料

### 3D 人體姿態估計

-   [AlphaPose](https://github.com/MVIG-SJTU/AlphaPose)
-   [VideoPose3D](https://github.com/facebookresearch/VideoPose3D)
-   [video-to-pose3D](https://github.com/zh-plus/video-to-pose3D)
-   [3D 模型學會了「唱、跳、Rap、籃球」](https://ttnews.xyz/a/5e039544dc9b5e4d8a898142)
-   [MS COCO / Human3.6m Dataset Label order](https://blog.csdn.net/maitianpt/article/details/90199095)

### 3D 動作姿態格式

-   [List of motion and gesture file formats](https://en.wikipedia.org/wiki/List_of_motion_and_gesture_file_formats)
-   [Biovision BVH](https://research.cs.wisc.edu/graphics/Courses/cs-838-1999/Jeff/BVH.html)

### Three.js

-   [demo example](https://threejs.org/examples/#webgl_animation_keyframes)
-   [demo code](https://github.com/mrdoob/three.js/tree/dev/examples)
-   [API](https://threejs.org/docs/index.html#api/en/animation/AnimationAction)

## 進度追蹤

-   [x] 2021.12.17：能夠執行 Pose_Solver 專案
-   [ ] 2021.12.24：學習完 transformation 知識
-   [ ] 2021.12.31：
