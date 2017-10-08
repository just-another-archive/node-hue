import config from '../../../config.json'
import get_ntw from '../../../lib/get_ntw'

import model from './model'

export default db => {
  const ntw = get_ntw()

  // overwrite config at runtime
  db.assign(model())
    .write()

  return {
    get: () => {
      const config = db.value(),
            now    = new Date(),
            utc    = new Date(
              now.getUTCFullYear(),
              now.getUTCMonth(),
              now.getUTCDate(),
              now.getUTCHours(),
              now.getUTCMinutes(),
              now.getUTCSeconds(),
              now.getUTCMilliseconds()
            )

      return Object.assign({}, config, {
        utc: utc.toISOString().split('.').shift(),
        localtime: now.toISOString().split('.').shift(),
      })
    },

    update: data => {
      db.assign(data)
        .write()

      return true
    },

    remove: id => {
      if (!db.get('whitelist').has(id).value())
        return false

      db.get('whitelist')
        .unset(id)
        .write()

      return true
    }
  }
}
