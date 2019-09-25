export function assert(condition: boolean, message: string) {
  if (!condition) {
    // useful when testing
    // console.warn(`[vue-promised] ${message}`)
    throw new Error(`[vue-compose-promise] ${message}`)
  }
}
