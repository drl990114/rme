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
