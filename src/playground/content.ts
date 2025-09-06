const singleRow = `hello **strong**! hello *italic*! hello \`code\`! hello [link](https://www.google.com)!`

const justCodeContent = `
\`\`\`js

console.log("hello world")

\`\`\`
`.trim()

const defaultContent = [
  `
wqeqwqwe $e=m$weq <span>qwe</span>

$$
c = \\pm\\sqrt{a^2 + b^2}
$$

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
