import shortid from 'shortid'
import model from './model'


export default db => ({
  get: () => db.value(),
  one: id => db.get(id).value(),

  create: data => {
    const id = shortid.generate()

    db.set(id, Object.assign({}, model, data))
      .write()

    return id
  },

  update: (id, data) => {
    if (!db.has(id).value())
      return false

    db.get(id)
      .assign(data)
      .write()

    return true
  },

  lightstate: (id, light, data) => {
    if (!db.has(id).value())
      return false

    db.get(id)
      .assign({ lightstates: { [light]: data }})
      .write()

    return true
  },

  delete: id => {
    if (!db.has(id).value())
      return false

    db.unset(id)
      .write()

    return id
  }
})
