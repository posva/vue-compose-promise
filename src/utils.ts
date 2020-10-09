export function assert(condition: boolean, message: string) {
  // @ts-ignore
  if (process.env.NODE_ENV !== 'production' && !condition) {
    // useful when testing
    // console.warn(`[vue-promised] ${message}`)
    throw new Error(`[vue-compose-promise] ${message}`)
  }
}
