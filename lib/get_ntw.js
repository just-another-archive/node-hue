import os from 'os'
import df from 'default-gateway'

export default () => {
  const infos  = df.v4.sync()
  const ifaces = os.networkInterfaces()

  let iface = ifaces[infos.interface].filter(iface => iface.family === 'IPv4').shift()
  iface.gateway = infos.gateway

  return iface
}
