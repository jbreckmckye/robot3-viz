export function mapRecord<T, U>(record: Record<string, T>, fn: (t: T, s: string) => U): Record<string, U> {
  return Object.entries(record).reduce(
    (result, [inputKey, inputVal]) => {
      return {
        ...result,
        [inputKey]: fn(inputVal, inputKey)
      }
    },
    {} as Record<string, U>
  )
}
