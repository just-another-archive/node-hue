import fs from 'fs'

// that is ugly but i'm too lazy to do better. kisu
export default adapter => {
  console.log(`requesting adapter: ${adapter}...`)
  if (adapter.indexOf('.') !== -1)
    throw 'illegal path'

  // will throw error in any case of failure
  return require(`./${adapter}`).default
}
