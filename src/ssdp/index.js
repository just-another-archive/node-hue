import config from '../../config.json'
import pubsub from 'pubsub-js'

import dgram from 'dgram'
import get_ntw from '../../lib/get_ntw'


const MULTICAST_IP   = '239.255.255.250',
      MULTICAST_PORT = 1900

const ntw = get_ntw()


// sender part
const sender = dgram.createSocket('udp4')
const notify = [
  'NOTIFY * HTTP/1.1',
  `HOST: ${MULTICAST_IP}:${MULTICAST_PORT}`,
  'NTS: ssdp:alive',
  'CACHE-CONTROL: max-age=1200',
  'SERVER: node-hue/1.0',
  `USN: uuid:${config.uuid}`,
  'NT: urn:schemas-upnp-org:device:basic:1',
  `LOCATION: http://${ntw.address}:80/description.xml`,
  `hue_bridge_id: ${ntw.mac.replace(/:/g, '')}`,
  ''
].join('\r\n')


// receiver part
const receiver = dgram.createSocket({ type: 'udp4', reuseAddr: true })

receiver.unref()
receiver.on('listening', () => {
  var address = receiver.address();

  receiver.setMulticastTTL(128);
  receiver.addMembership(MULTICAST_IP, ntw.address);
})

receiver.on('message', message => {
  const chunks = message.toString('utf-8')
                        .split('\r\n')

  const verb = chunks.shift()
                     .split(' ', 1)
                     .shift()

  // only scan for notify events
  if (verb !== 'NOTIFY')
    return false

  const headers = chunks.reduce((container, header) => {
    const split = header.split(': '),
          name  = split.shift(),
          value = split.shift()

    if (name.length)
      container[name.toLowerCase()] = value

    return container
  }, {})

  // that's yourself, dummy
  if (headers.location.indexOf(ntw.address) !== -1)
    return false

  // only search for arduinos
  if (headers.server.indexOf('Arduino') === -1)
    return

  const id      = headers.chip.split('-').pop(),
        type    = headers.chip.split('-').shift(),
        adapter = headers.server.split(' ').pop(),
        url     = headers.location.replace('/description.xml', '')

  pubsub.publish(`discovery:${type}`, { id, type, adapter, url })
})


// interface
let timer;
export default {
  start: () => {
    timer = setInterval(() => {
      sender.send(notify, MULTICAST_PORT, MULTICAST_IP)
    }, 2000)

    receiver.bind(MULTICAST_PORT)
  },

  stop: () => {
    clearInterval(timer)
    receiver.close()
  }
}
