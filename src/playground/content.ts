const singleRow = `hello **strong**! hello *italic*! hello \`code\`! hello [link](https://www.google.com)!`

const justCodeContent = `
\`\`\`js

console.log("hello world")

\`\`\`
`.trim()

const defaultContent = [
  `
# Exploring the Dystopian Depths of "Wool"

The world is almost ruined. None of the remaining  <img src="https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg" /> people live on the surface, where deadly toxic air makes life impossible. To survive, humankind has no option but to live in a massive underground silo with numerous levels, bound by strict social rules.  <br/> <br/>Holston, the silo's sheriff, who has dedicated himself to law enforcement for years, begins the story with a profound sadness at the loss of his wife. Three years ago, she ventured out for "cleaning," a grim sentence for those who wonder what the outside world is like or dare to discuss the past. This task, essential yet fatal, involves cleaning the lenses of the silo's external cameras, offering the inhabitants a glimpse of the destroyed surface.


![img](https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg)

\`\`\`js
console.log('Hello MarkFlowy')
\`\`\`

<ruby>ruby<rt>rt</rt></ruby> content \`code\` <rt>qwe</rt>, *qweqwe*

task list:

- [ ] task 1
- [ ] task 2
- [x] task 3


`.trim(),
].join('\n')

const longContent = defaultContent + '\n\n' + (singleRow.repeat(200) + '\n\n').repeat(5)

const tableContent = `
# Table

| First Header  | Second Header |
| ------------- | ------------- |
| Content Cell  | Content Cell  |
| Content Cell  | Content <br/>Cell|

# A larger table

| First Header  | Second Header | Third Header |
| ------------- | ------------- | ------------ |
| Content Cell  | Content Cell  | Content Cell |
| Content Cell  | Content Cell  | Content Cell |
| Content Cell  | Content Cell  | Content Cell |
| Content Cell  | Content Cell  | Content Cell |

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
