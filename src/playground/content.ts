const singleRow = `hello **strong**! hello *italic*! hello \`code\`! hello [link](https://www.google.com)!`

const justCodeContent = `
\`\`\`js

console.log("hello world")

\`\`\`
`.trim()

const defaultContent = [
  `
# 完整的Markdown语法测试

## 基础文本格式

这是**粗体文本**，这是*斜体文本*，这是~~删除线文本~~，这是\`行内代码\`。

## 链接和图片

这是一个[链接](https://www.google.com)，这是一个自动链接：https://www.github.com

这是html 图片：<img src="https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg" /> ， 这是 Markdown 图片：![图片](https://remixicon.com/img/logo/dark/text.svg)

## 列表

### 无序列表
- 项目 1
- 项目 2
  - 嵌套项目 2.1
  - 嵌套项目 2.2
- 项目 3

### 有序列表
1. 第一项
2. 第二项
3. 第三项

### 任务列表
- [x] 已完成任务
- [ ] 未完成任务
- [ ] 另一个未完成任务

## 引用

> 这是一个引用块
>
> 可以包含多行内容
>
> > 这是嵌套引用

## 代码块

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
  return "success";
}
\`\`\`

\`\`\`python
def hello():
    print("Hello, World!")
    return "success"
\`\`\`

## 表格

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |

## 分隔线

---

## HTML标签

<mark>高亮文本</mark>，<kbd>Ctrl</kbd>+<kbd>C</kbd>，<sub>下标</sub>，<sup>上标</sup>

<ruby>汉字<rt>hàn zì</rt></ruby>

<div>这是一个div块，可以包含多行内容。</div>

## 数学公式

行内数学公式：$E = mc^2$

块级数学公式：
$$
\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n
$$

## Mermaid图表

\`\`\`mermaid
graph TD
    A[开始] --> B{判断}
    B -->|是| C[执行A]
    B -->|否| D[执行B]
    C --> E[结束]
    D --> E
\`\`\`

## 换行测试

这是第一行
这是第二行（单个换行符）

这是第三行

这是第四行（双换行符）

`.trim(),
].join('\n')

const longContent = defaultContent + '\n\n' + (singleRow.repeat(200) + '\n\n').repeat(5)

const tableContent = `
| First Header  | Second Header |
| ------------- | ------------- |
| Content <br/>Cell  | |
`

const headingContent = `
# Heading Level 1

## Heading Level 2

### Heading Level 3

#### Heading Level 4

##### Heading Level 5

###### Heading Level 6
`

const htmlContent = `

<mark>Mark Tag</mark>.

this is a img inline <img src="https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg" />.
`

export const contentMap: { [key: string]: string } = {
  default: defaultContent,
  'just-code': justCodeContent,
  long: longContent,
  table: tableContent,
  html: htmlContent,
  customize: '',
}
