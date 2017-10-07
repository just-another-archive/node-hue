import shortid from 'shortid'
import model from './model'

export default db => ({
  get: () => db.get('resourcelinks').value(),
  one: id => db.get('resourcelinks').get(id).value(),

  create: data => {
    const id = shortid.generate()

    db.get('resourcelinks')
      .set(id, Object.assign({}, model, data))
      .write()

    return id
  },

  update: (id, data) => {
    if (!db.get('resourcelinks').has(id).value())
      return false

    db.get('resourcelinks')
      .get(id)
      .assign(data)
      .write()

    return true
  },

  delete: id => {
    if (!db.get('resourcelinks').has(id).value())
      return false

    db.get('resourcelinks')
      .unset(id)
      .write()

    return id
  }
})