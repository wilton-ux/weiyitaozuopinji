# 如何编辑你的作品集网站？

这份指南会教你如何修改网站内容，**不需要任何编程知识**。

---

## 1. 如何打开网站？

直接双击 `index.html` 文件，网站就会在浏览器中打开。

---

## 2. 如何修改你的名字和标题？

用电脑自带的「记事本」打开 `index.html`，找到下面这块代码：

```html
<!-- ✨ HERO SECTION                              -->
<!-- 👋 EDIT: Change the text between <h1> tags   -->
```

把 `<h1>` 标签里的 `YOUR` 换成你的名，`NAME` 换成你的姓。

把 `<p class="hero-subtitle">` 里的 `UI/UX Designer & Visual Artist` 换成你的职业标题。

把 `<p class="hero-tagline">` 里的描述换成你自己的话。

---

## 3. 如何添加你的作品？

### 步骤一：把图片放进文件夹
把你准备好的作品图片（JPG 或 PNG 格式），拖进 `assets/images/` 文件夹。

### 步骤二：在 index.html 中找到作品区域
搜索 `<!-- 🖼️ WORKS / PROJECTS GALLERY -->`

### 步骤三：替换占位图片
每个作品卡片里有一段代码：
```html
<div class="work-placeholder" style="background: #1a1a2e;"></div>
```
替换为：
```html
<img src="assets/images/你图片的文件名.jpg" alt="项目名称">
```

### 步骤四：修改项目名称和分类
在同一块代码里找到：
```html
<span class="work-card-category">Brand Identity</span>
<h3 class="work-card-title">Aurora Brand System</h3>
```
改成你的项目分类和名称。

### 如何添加更多作品？
复制一整个 `<article class="work-card">...</article>` 代码块，粘贴在 `</div>` (works-grid 的结束标签) 之前，然后修改图片和文字。

---

## 4. 如何修改"关于我"？

搜索 `<!-- 👤 ABOUT SECTION -->`，修改 `<p class="about-body">` 标签里的自我介绍文字。

把 `<div class="about-placeholder">` 里的占位图替换为你的照片：
```html
<img src="assets/images/你的照片.jpg" alt="My photo">
```

---

## 5. 如何修改联系方式？

### 方法一（推荐）：修改 CONFIG 对象

打开 `script.js`，找到最前面的 `CONFIG` 对象：

```js
const CONFIG = {
  name: '你的名字',
  email: '你的邮箱@example.com',
  socialLinks: {
    instagram: 'https://instagram.com/你的账号',
    linkedin: 'https://linkedin.com/in/你的账号',
    dribbble: 'https://dribbble.com/你的账号',
  },
};
```

### 方法二：直接修改 HTML

搜索 `<!-- ✉️ CONTACT / FOOTER -->`，找到 `<a href="...">` 链接，修改 `href` 属性里的网址和显示的文字。

---

## 6. 如何修改网站标题（浏览器标签页显示的名字）？

在 `index.html` 顶部找到 `<title>Portfolio</title>`，把 `Portfolio` 改成你的名字。

---

## 7. 如何让网站上线？

### 最简单的方法：Netlify Drop
1. 打开浏览器，访问 [app.netlify.com/drop](https://app.netlify.com/drop)
2. 注册一个账号（可以用 GitHub 账号登录）
3. 把整个 `portfolio` 文件夹拖进网页里
4. 你的网站就上线了！会得到一个免费网址（比如 `xxx-xxx-xxx.netlify.app`）

### 免费方法：GitHub Pages
1. 注册 [GitHub](https://github.com) 账号
2. 创建一个新仓库（点右上角 + 号 → New repository）
3. 仓库名填 `你的用户名.github.io`（比如 `zhangsan.github.io`）
4. 把 `portfolio` 文件夹里的所有文件上传（GitHub 网页版支持直接拖拽文件）
5. 等1-2分钟后，访问 `你的用户名.github.io` 就能看到你的网站了

---

## 常见问题

**Q: 图片显示不出来怎么办？**
A: 检查文件名是否完全一致（包括大小写），以及图片是否放在了 `assets/images/` 文件夹里。

**Q: 可以在手机上打开吗？**
A: 可以！网站已经适配了手机屏幕，在手机上打开会自动调整布局。

**Q: 我想改颜色/字体怎么办？**
A: 打开 `style.css`，找到顶部的 `:root` 代码块，修改颜色值即可。
