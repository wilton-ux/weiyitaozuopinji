---
name: Wilton Wei Portfolio
description: 黑底烛光单色系统——暗房隐喻下的编辑级作品集
colors:
  candlelight: "#FFFFE3"
  pure-black: "#000000"
  white: "#FFFFFF"
  white-muted: "rgba(255, 255, 255, 0.55)"
  black-overlay: "rgba(0, 0, 0, 0.75)"
  candlelight-border: "rgba(255, 255, 227, 0.2)"
typography:
  display:
    fontFamily: "Noto Serif SC, Playfair Display, Times New Roman, serif"
    fontSize: "clamp(3.5rem, 10vw, 9rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Noto Serif SC, Playfair Display, Times New Roman, serif"
    fontSize: "clamp(2rem, 5vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Poppins, Noto Sans SC, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.05rem"
    fontWeight: 300
    lineHeight: 1.8
    letterSpacing: "normal"
  label:
    fontFamily: "Poppins, Noto Sans SC, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.7rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.15em"
    fontFeature: "uppercase"
rounded:
  sharp: "2px"
  subtle: "3px"
  pill: "100px"
spacing:
  section-padding: "clamp(5rem, 12vh, 10rem) 6vw"
  card-overlay-padding: "1.8rem"
  tag-gap: "0.6rem"
components:
  tag:
    backgroundColor: "transparent"
    textColor: "{colors.candlelight}"
    rounded: "{rounded.pill}"
    padding: "0.5em 1.2em"
  tag-hover:
    backgroundColor: "{colors.candlelight}"
    textColor: "{colors.pure-black}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.white-muted}"
    rounded: "{rounded.sharp}"
    padding: "0.3em 0.9em"
  button-outline-hover:
    textColor: "{colors.candlelight}"
  card:
    backgroundColor: "#0a0a0a"
    rounded: "{rounded.sharp}"
---

# Design System: Wilton Wei Portfolio

## 1. Overview

**Creative North Star: "暗房 (The Darkroom)"**

暗房是摄影师的工作室——只有安全灯的微光透过全黑的空间。构图、光线、颗粒感，一切都在显影液中慢慢浮现。这个设计系统以此为隐喻：黑底是暗房的绝对黑暗，#FFFFE3 强调色是那盏安全灯，每一个 UI 元素都是被精心显影的底片。

它不是冰冷的科技黑，而是有温度、有纹理的暗。胶片颗粒叠加层（opacity 0.04）模拟银盐质感；自定义光标像放大镜在底片上移动。信息不是"展示"出来的，而是"浮现"出来的——hover 时才显露的卡片文字、scroll 驱动的渐入动画、magnetic 跟随的链接交互。

明确拒绝：AI 模板的渐变字体、花哨的彩色装饰、SaaS 落地页套路（hero metric → logo wall → 同等大小的卡片阵列）。不靠色彩数量，靠节奏和比例。

**Key Characteristics:**
- 单色系统：一种强调色覆盖 ≤10% 表面，其余靠明度分层
- 编辑级排版：衬线标题 + 无衬线正文，字重对比是首要装饰
- 暗房式浮现：内容通过 hover/scroll 交互逐层揭示，不一次性倾泻
- 颗粒感纹理：轻微噪声叠加和几何碎片，在纯黑中创造材质差异
- 锐利但呼吸：2px 边角保持精确感，hover 微动提供柔软反馈

## 2. Colors

单一强调色的极简调色板。黑底承载一切，烛光色作为唯一信号色，仅用于关键交互提示。其余层次由明度差和透明度区分。

### Primary
- **烛光 (Candlelight)** (#FFFFE3 / oklch(98.5% 0.013 105)): 唯一的强调色。用于所有交互信号：hover 状态文字、下划线、光标、链接、强调标签。出现的频率本身就是节奏——越少越有力。禁止用于大面积背景或装饰性填充。

### Neutral
- **纯黑 (Pure Black)** (#000000): 页面底色。暗房的绝对黑暗，为所有其他元素提供无限深的舞台。
- **白 (White)** (#FFFFFF): 正文和主标题色。与黑底达成 ≥15:1 对比度，远超 WCAG AAA。
- **暗哑白 (Muted White)** (rgba(255, 255, 255, 0.55)): 辅助文字、导航链接默认态、footer 文本。55% 不透明度在纯黑底上达到约 7.5:1 对比度。
- **黑叠加 (Black Overlay)** (rgba(0, 0, 0, 0.75)): 卡片 hover 渐变的底层色，确保叠加文字可读。
- **烛光边框 (Candlelight Border)** (rgba(255, 255, 227, 0.2)): 所有边框和分割线的默认色。烛光色相 20% 透明度，在黑色背景上微妙但可辨。

### Named Rules

**The Candlelight Rule.** 烛光色占据任何屏幕表面 ≤10%。它的稀缺性即是它的力量。如果一屏中有超过三个元素同时使用烛光色，说明强调失去了意义。

**The Tinted Border Rule.** 所有边框和分割线必须带有品牌色相——使用 `rgba(255, 255, 227, ...)`，绝不用中性灰 `rgba(255,255,255,...)`。透明度控制深浅，色相保持品牌一致性。

## 3. Typography

**Display Font:** Noto Serif SC (with Playfair Display → Times New Roman fallback)
**Body Font:** Poppins (with Noto Sans SC → Inter → system sans fallback)
**Label Font:** same as body, uppercase with wide tracking

**Character:** 衬线与无衬线的经典对比——Noto Serif SC 的稳重笔画承载标题的重量感，Poppins 的几何简洁支撑正文的可读性。中文与英文的混排通过 Noto 系列保证风格统一。

### Hierarchy
- **Display** (700, clamp(3.5rem, 10vw, 9rem), 1.05): Hero 标题专用。仅用于首页姓名和 "Let's Work Together"。letter-spacing -0.02em 收紧但不拥挤。天花板 clamp max 9rem（≈144px），不会更大。
- **Headline** (700, clamp(2rem, 5vw, 4rem), 1.15): 区域标题（"Selected Works"、"About Me"）。负 letter-spacing 保持一致。专属 section-heading 类。
- **Title** (700, 1.3rem, 1.2): 作品卡片标题。在紧凑空间中提供足够的信息层级。
- **Body** (300, 1.05rem, 1.8): 正文。line-height 1.8 给中文文本留出充足的呼吸空间。max-width 480px 限制行长在 ~55-60 字符。
- **Label** (500, 0.7rem, 0.15em, uppercase): 分类标签、导航项、scroll 指示器。宽字距 + 大写，在小尺寸中保持可辨识。

### Named Rules

**The Weight Contrast Rule.** 页面只有 300 和 700 两个 weight。不用 400/500/600 的中间值做对比——对比必须是确定的。Light body + Bold heading 的跨度本身就是排版装饰。

## 4. Elevation

纯黑底色天然具有深度感——不需要阴影来制造"立体"。系统是**默认扁平，状态用影**：大多数元素没有投影，靠明度差（#000 → #0a0a0a 卡片背景）区分层次。阴影仅在交互状态时出现，作为反馈信号而非装饰。

### Shadow Vocabulary
- **hover-preview-shadow** (`box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6)`): 仅用于 hover 时出现的项目预览浮层。大 blur + 深色，在黑色背景上依然可见。
- **nav-scrolled-blur** (`backdrop-filter: blur(12px)` + `background: rgba(0, 0, 0, 0.72)`): 滚动后的导航栏。模糊而非阴影来区分层次。

### Named Rules

**The Flat-By-Default Rule.** 所有表面在静止状态下都是平的。阴影只作为状态响应出现（hover、滚动、浮层），不是装饰。如果卡片不需要阴影就能区分，就不要加。

## 5. Components

### Navigation
- **Style:** 固定顶部，透明底 → scroll 后 backdrop-blur + 半透明黑
- **Logo:** 0.8rem, 500, letter-spacing 0.2em, 灰色 → hover 烛光色
- **Links:** 0.85rem, 400, muted white → hover white + 烛光色下划线（scaleX 动画，0.35s ease）
- **Resume Button:** 1px 烛光边框（30% 透明度）, 2px 尖角, 0.3em 0.9em padding, hover 边框变实 + 文字变烛光色

### Cards (Work/Project)
- **Corner Style:** 2px 尖角。暗房隐喻中的照片边缘——干净、精确
- **Background:** #0a0a0a（比纯黑亮 4%，微妙区分）
- **Shadow Strategy:** 无静态阴影。hover 时图片 scale(1.03) + overlay 渐显
- **Overlay:** 底部到顶部渐变（85% → 20% → 0% 黑），1.8rem padding, 默认 opacity 0 → hover 1
- **Category Label:** 0.7rem, 500, letter-spacing 0.15em, uppercase, 烛光色
- **Title:** 1.3rem, 700, 衬线, white
- **Hover Behavior:** 图片微缩放 + overlay 淡入 + 文字上移（translateY 12px → 0），0.4s ease
- **3D Tilt:** 鼠标位置驱动的 3D 透视旋转，非必要但增加暗房式探索感

### Tags (Service Tags)
- **Style:** 透明底 + 1px 烛光边框（25% 透明度），100px 全圆角 pill 形状
- **Text:** 0.75rem, letter-spacing 0.08em, 烛光色
- **Hover:** 反色——背景变烛光色，文字变纯黑。0.3s ease transition

### Contact Links
- **Style:** 垂直排列（label 上 + value 下），居中对齐
- **Label:** 0.7rem, 500, letter-spacing 0.15em, uppercase, muted white
- **Value:** 1.2rem, 衬线, white → hover 烛光色
- **Underline:** hover 时 scaleX(0→1) 烛光色下划线，从右到左的动画方向

### Custom Cursor
- **Ring:** 44px 空心圆, 2px 烛光色边框 → hover-link 膨胀至 64px（链接）/ 80px（卡片）
- **Dot:** 6px 实心圆, 烛光色填充, 跟随鼠标零延迟 → hover 时缩小消失
- **Follower Label:** 80px 容器, 内含 uppercase "View" 标签, 黑底 pill + 烛光色文字, 仅在 hover 卡片时出现

### Scroll Indicator
- **Text:** 0.7rem, letter-spacing 0.2em, uppercase, muted white
- **Line:** 1px × 50px, 烛光色 40% 透明度, scaleY 脉冲动画 (2s ease-in-out)

## 6. Do's and Don'ts

### Do:
- **Do** 用明度差区分层次（#000 → #0a0a0a → 边框透明度），不依赖阴影
- **Do** 烛光色仅用于交互信号：hover、焦点、强调文字、光标。单屏 ≤10% 表面
- **Do** 保持 2px 尖角在卡片和图片上——这是暗房的"底片边缘"特征
- **Do** 用负 letter-spacing (-0.02em) 收紧大标题，使字间距紧凑但字母不接触
- **Do** 衬线仅用于标题（≥1.2rem），正文始终无衬线 300 weight
- **Do** 所有动画提供 `prefers-reduced-motion: reduce` 降级方案
- **Do** 边框色必须带烛光色相：`rgba(255, 255, 227, X)`，X 控制深浅

### Don't:
- **Don't** 使用渐变字体（`background-clip: text` + gradient）——产品明确禁止
- **Don't** 使用 AI 商业模板化布局：hero metric → logo wall → 同尺寸卡片阵列 → CTA
- **Don't** 引入第二种强调色。烛光色是唯一信号色，新增色彩破坏单色系统的克制力
- **Don't** 使用花哨的彩色图案、几何装饰条纹、彩虹渐变背景
- **Don't** 在卡片上同时使用 1px 边框 + 大模糊阴影（幽灵卡片模式）
- **Don't** 圆角超过 3px 在卡片/图片/输入框上。pill 形状（100px）仅用于标签
- **Don't** 使用 Glassmorphism 作为默认风格。模糊效果仅在导航滚动态出现
- **Don't** 在 section heading 前加编号标记（01 / 02 / 03）或 tiny uppercase eyebrow（"ABOUT" / "PROCESS"）
- **Don't** 使用 `border-left` 或 `border-right` 大于 1px 作为彩色侧边装饰条纹
