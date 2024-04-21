const singleRow = `hello **strong**! hello *italic*! hello \`code\`! hello [link](https://www.google.com)!`

const justCodeContent = `
\`\`\`js

console.log("hello world")

\`\`\`
`.trim()

const defaultContent = [
    `
# hello world!

`.trim(),
].join("\n")

const longContent = defaultContent + "\n\n" + (singleRow.repeat(200) + "\n\n").repeat(5)

const tableContent = `
# Table

| First Header  | Second Header |
| ------------- | ------------- |
| Content Cell  | Content Cell  |
| Content Cell  | Content Cell  |

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
<a href="https://www.google.com">Goo <mark>g <span style="color:red">le</span></mark><img></a>
`

export const contentMap: { [key: string]: string } = {
    default: defaultContent,
    "just-code": justCodeContent,
    long: longContent,
    table: tableContent,
    html: htmlContent,
    customize: "",
}
