import shortid from 'shortid'
import model from './model'

export default db => ({
  get: () => db.get('scenes').value(),
  one: id => db.get('scenes').get(id).value(),

  create: data => {
    const id = shortid.generate()

    db.get('scenes')
      .set(id, Object.assign({}, model, data))
      .write()

    return id
  },

  update: (id, data) => {
    if (!db.get('scenes').has(id).value())
      return false

    db.get('scenes')
      .get(id)
      .assign(data)
      .write()

    return true
  },

  delete: id => {
    if (!db.get('scenes').has(id).value())
      return false

    db.get('scenes')
      .unset(id)
      .write()

    return id
  }
})