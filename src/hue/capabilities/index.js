export default () => {
  const MAX  = 1000

  return {
    lights:  { available: MAX },
    sensors: {
      available: MAX,
      clip: { available: MAX },
      zll:  { available: MAX },
      zgp:  { available: MAX }
      },
      groups: { available: MAX },
      scenes: {
        available: MAX,
        lightstates: { available: MAX }
      },
      schedules: { available: MAX },
      rules: {
        available: MAX,
        conditions: { available: MAX },
        actions:    { available: MAX }
      },
      resourcelinks: { available: MAX },
  }
}