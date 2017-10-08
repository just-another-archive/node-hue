import model from './model'

const uid = db => (
  db.get('rules').keys().length + 1
)

export default db => ({
  get: () => db.get('rules').value(),
  one: id => db.get('rules').get(id).value(),

  create: data => {
    const id = uid()

    db.get('rules')
      .set(id, Object.assign({}, model, data))
      .write()

    return id
  },

  update: (id, data) => {
    if (!db.get('rules').has(id).value())
      return false

    db.get('rules')
      .get(id)
      .assign(data)
      .write()

    return true
  },

  delete: id => {
    if (!db.get('rules').has(id).value())
      return false

    db.get('rules')
      .unset(id)
      .write()

    return id
  }
})