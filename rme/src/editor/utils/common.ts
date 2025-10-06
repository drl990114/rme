/**
 * exclude array member from array
 * @param arr
 * @param excludeArr
 * @returns
 */
export const arrayExclude = (arr: any[], excludeArr: any[]) => {
  return arr.filter((item) => !excludeArr.includes(item))
}

/**
 * Supports cyclically dependent objects to json
 * @param o
 * @returns
 */
export const jsonStringify = (o: any) => {
  let cache: any[] = []
  let str = JSON.stringify(o, function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        return
      }
      cache.push(value)
    }
    return value
  })
  cache = []
  return str
}

/**
 * Remove any common leading whitespace from every line in `text`.
 * Inspired by Python's `textwrap.dedent`.
 *
 * @public
 */
export function dedent(text: string) {
  let minWhitespace = -1
  const lines = text.split("\n")
  for (const line of lines) {
      if (line.length > 0) {
          const match = /^(\s*).*$/.exec(line)
          if (match) {
              minWhitespace = minWhitespace === -1 ? match[1].length : Math.min(minWhitespace, match[1].length)
          } else {
              return text
          }
      }
  }
  return lines.map((line) => (line.length > 0 ? line.slice(minWhitespace) : line)).join("\n")
}
