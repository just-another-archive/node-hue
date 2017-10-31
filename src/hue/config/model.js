import config from '../../../config.json'
import get_ntw from '../../../lib/get_ntw'

const ntw = get_ntw()

export default () => ({
  name : 'Node Hue',                    // name
  datastoreversion: '63',               // data store version
  swversion: '1709131301',              // software version
  apiversion: '1.21.0',                 // hue api version
  mac: ntw.mac,                         // mac address
  bridgeid: ntw.mac.replace(/:/g, ''),  // bridge uid
  factorynew: false,
  replacesbridgeid: null,
  modelid: 'BSB002',
  starterkidid: '',

  dhcp: true,               // let's assume
  ipaddress: ntw.address,   // local ip
  netmask: ntw.netmask,     // local netmask
  gateway: ntw.gateway,     // gateway
  proxyaddress: 'none',     // dont wanna go there
  proxyport: 0,             // here neither

  timezone: config.timezone,
  linkbutton: true, // not the safest but pretty useful

  // apparently hue doesnt check for the dates, only if the device is in the whitelist object...
  whitelist: {
    "zvx38KFXEr5lxIsy-yRYfsIGlFNEZGIDM28bDY6T": {
//        "last use date": "2017-10-05T22:29:50",
//        "create date": "2016-11-28T19:20:27",
//        "name": "Echo"
    },
    "LxDF4cdSlQ5h-MS46vljSgmLUtokEb3KZwESZPKx": {
//        "last use date": "2017-04-17T20:49:32",
//        "create date": "2017-01-15T17:17:51",
//        "name": "Hue 2#Google Pixel"
    }
  }
})