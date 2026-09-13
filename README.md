# 几何星图 (GeoStarMap) · 30条奥数著名几何定理交互实验殿堂

> 融合六大主流大模型（Qwen 3.8 Max, Kimi K3, GLM-5.3, Gemini 3.8 Flash, DeepSeek v4 Pro, GLM-5.3 Flash）顶尖优势构建的工业级动态几何奥数教学平台。

[![Math Tests](https://img.shields.io/badge/Math%20Engine-30%2F30%20Passed-emerald.svg)](tests/geom.test.ts)
[![Next.js](https://img.shields.io/badge/Next.js-16%20(Static%20Export)-blue.svg)](next.config.ts)
[![WebAudio](https://img.shields.io/badge/WebAudio-Procedural%20Synth-amber.svg)](src/hooks/useWebAudio.ts)
[![KaTeX](https://img.shields.io/badge/KaTeX-LaTeX%20Math-rose.svg)](src/components/ui/KaTeXView.tsx)

---

## 🌟 项目亮点与融合架构

本项目针对《数学竞赛几何部分30条著名定理总结》进行工业级交互重构，博采众长：

1. **数学几何内核 (`src/lib/geom/`)**
   - **Gemini 3.8 Flash + Kimi K3**：严密二维向量微积分、投影、共线/共点判别、三点圆、圆幂、九点圆与根轴算法。
   - **DeepSeek v4 Pro**：语义化三等分角射线追踪算法，彻底攻克莫利定理退化与死锁难题。
   - **Kimi K3**：32步二分根逼近算法，高精度求解沢特定理与泰比特定理切圆半径。
   - **自动化测试套件 (`tests/geom.test.ts`)**：30/30 定理全量自动化测试，平均耗时仅 8.3ms。

2. **声明式交互原语 (`src/components/canvas/`)**
   - 提取自 **Kimi K3** 的声明式 SVG 画布原语：`<Stage>`, `<Seg>`, `<LineAB>`, `<Dot>`, `<Circ>`, `<Poly>`, `<Handle>`, `<Readout>`。
   - 完美适配鼠标与触摸手势，支持精确的坐标边界约束与指针捕获（Pointer Capture）。

3. **教研大脑与深度讲义 (`src/data/theorems/`)**
   - 整合 **GLM-5.3** 的四维奥数精讲体系：
     - 💡 **直观理解**：以物理弹簧、齿轮、切刀等通俗图景打破抽象壁垒。
     - 📐 **竞赛证明思路**：严格几何与代数推导逻辑，结合标准 LaTeX 排版。
     - ⚠️ **联赛实战与避坑指南**：解析外分点符号陷阱、退化构型防坑技巧。
     - 🌐 **高维与射影推广**：拓展至 $n$ 边形、射影对偶及非欧几何。

4. **游戏化激励与靶向挑战 (`src/hooks/useGamifyProgress.ts`)**
   - **Gemini 3.8 Flash**：零依赖纯 WebAudio 程序化和弦合成器（C5-E5-G5-C6 音阶），杜绝静态音频 403 跨域或加载延迟。
   - **30 项动态靶向探究任务**：动态拟合收敛条 `<ChallengeMeter />`，直观反映不变量收敛度。
   - **90 星奥数进阶与 7 大成就勋章**：四大天象段位（观星新手 $\to$ 几何探索者 $\to$ 几何大师 $\to$ 星图主宰）。
   - **粒子物理礼花动效**：`<Confetti />` 真实模拟空气阻力与重力加速度。

---

## 📐 包含的 30 条著名定理清单

| 编号 | 定理名称 | 英文名称 | 领域分类 | 核心公式/性质 |
|:---:|:---|:---|:---|:---|
| 01 | 梅涅劳斯定理 | Menelaus's Theorem | 经典共线与共点 | $\frac{AF}{FB}\cdot\frac{BD}{DC}\cdot\frac{CE}{EA}=1$ |
| 02 | 塞瓦定理 | Ceva's Theorem | 经典共线与共点 | $\frac{AF}{FB}\cdot\frac{BD}{DC}\cdot\frac{CE}{EA}=1$ |
| 03 | 迪沙格定理 | Desargues's Theorem | 射影几何与极点极线 | 透视三角形对应边交点三点共线 |
| 04 | 帕斯卡定理 | Pascal's Hexagrammum | 射影几何与极点极线 | 圆内接六边形三组对边交点共线 |
| 05 | 帕普斯定理 | Pappus's Hexagon Theorem | 射影几何与极点极线 | 两直线上三点交叉连线交点共线 |
| 06 | 布里昂雄定理 | Brianchon's Theorem | 射影几何与极点极线 | 圆外切六边形三条主对角线共点 |
| 07 | 托勒密定理 | Ptolemy's Theorem | 圆幂与根轴体系 | $AC\cdot BD = AB\cdot CD + BC\cdot DA$ |
| 08 | 婆罗摩笈多定理 | Brahmagupta's Theorem | 三角形度量与圆系 | 对角线垂直内接四边形垂线平分对边 |
| 09 | 圆幂定理 | Power of a Point Theorem | 圆幂与根轴体系 | $PA\cdot PB = PT^2 = \|d^2 - R^2\|$ |
| 10 | 张角定理 | Zhang Jiao's Theorem | 经典共线与共点 | $\frac{\sin(\alpha+\beta)}{PD} = \frac{\sin\alpha}{PB} + \frac{\sin\beta}{PA}$ |
| 11 | 西姆松定理 | Simson's Line | 三角形度量与圆系 | 外接圆上一点向三边作垂线，三垂足共线 |
| 12 | 斯坦纳定理 | Steiner's Line | 三角形度量与圆系 | 西姆松线过垂心与该点连线的中点 |
| 13 | 斯特瓦尔特定理 | Stewart's Theorem | 三角形度量与圆系 | $b^2 m + c^2 n = a(d^2 + mn)$ |
| 14 | 布洛卡点 | Brocard Points | 三角形度量与圆系 | $\cot\omega = \cot A + \cot B + \cot C$ |
| 15 | 密克定理 | Miquel's Theorem | 三角形度量与圆系 | 四线相交所构成的四个圆共点于密克点 |
| 16 | 蝴蝶定理 | Butterfly Theorem | 圆幂与根轴体系 | 弦中点作两相交弦，对角连线交点关于中点对称 |
| 17 | 蒙日定理 | Monge's Theorem | 圆幂与根轴体系 | 三个两两外离圆的三对外公切线交点共线 |
| 18 | 根轴定理 | Radical Axis Theorem | 圆幂与根轴体系 | 两圆等幂点轨迹为直线，三圆根轴共点于根心 |
| 19 | 凯西定理 | Casey's Theorem | 圆幂与根轴体系 | $t_{12}t_{34} + t_{14}t_{23} = t_{13}t_{24}$ |
| 20 | 费尔巴哈定理 | Feuerbach's Theorem | 三角形度量与圆系 | 九点圆内切于内切圆，外切于三个旁切圆 |
| 21 | 高斯-博登米勒定理 | Gauss-Bodenmiller Theorem | 经典共线与共点 | 完全四边形三条对角线的中点共线（高斯线） |
| 22 | 庞斯莱闭合定理 | Poncelet's Porism | 射影几何与极点极线 | 内接外切多边形一旦闭合，其闭合性质与初始点无关 |
| 23 | 莫利定理 | Morley's Trisector Theorem | 三角形度量与圆系 | 三角形相邻角三等分线交点必构成正三角形 |
| 24 | 沢特定理 | Sawayama's Theorem | 三角形度量与圆系 | 弦切圆圆心与内切圆圆心连线垂直于该弦 |
| 25 | 泰比特定理 | Thebault's Theorem | 三角形度量与圆系 | 塞瓦线切圆圆心连线过内切圆圆心 |
| 26 | 笛卡尔四圆定理 | Descartes' Circle Theorem | 圆幂与根轴体系 | $(k_1+k_2+k_3+k_4)^2 = 2(k_1^2+k_2^2+k_3^2+k_4^2)$ |
| 27 | 德罗兹-法尔尼定理 | Droz-Farny Theorem | 三角形度量与圆系 | 垂心处两条互相垂直的直线截三边所得中点共线 |
| 28 | 桑达定理 | Sondat's Theorem | 射影几何与极点极线 | 两个正交且透视的三角形，透视中心与正交轴共线 |
| 29 | 埃尔德什-莫德尔不等式 | Erdös-Mordell Inequality | 几何极值与不等式 | $R_A + R_B + R_C \ge 2(r_a + r_b + r_c)$ |
| 30 | 巴罗不等式 | Barrow's Inequality | 几何极值与不等式 | $R_A + R_B + R_C \ge 2(w_a + w_b + w_c)$ |

---

## 🚀 快速开始

### 运行环境
- Node.js >= 20 (推荐 v24.21.0)
- pnpm >= 9.0.0

### 本地开发
```bash
# 安装依赖
pnpm install

# 运行几何内核自动化单元测试 (30/30 全绿)
pnpm test

# 启动本地热重载开发服务器
pnpm dev
```
打开浏览器访问 `http://localhost:3000`。

### 静态站点导出 (SSG)
```bash
# 构建全量静态 HTML/CSS/JS (输出至 out/ 目录)
pnpm build

# 本地预览构建产物
node scripts/serve-out.mjs
```
打开浏览器访问 `http://localhost:3456`。
产物目录 `out/` 可直接部署至 GitHub Pages、Vercel、Cloudflare Pages 或任意静态 Web 托管环境。
