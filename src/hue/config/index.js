import config from '../../../config.json'
import get_ntw from '../../../lib/get_ntw'

import model from './model'

export default db => {
  const ntw = get_ntw()

  // overwrite config at runtime
  db.set('config', model())
    .write()

  return {
    get: () => {
      const config = db.get('config').value(),
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
      db.get('config')
        .assign(data)
        .write()

      return true
    },

    remove: id => {
      if (!db.get('config.whitelist').has(id).value())
        return false

      db.get('config.whitelist')
        .unset(id)
        .write()

      return true
    }
  }
}
