Math.clamp = (n, min = 0, max = 1) => {
  return n < min ? min : n > max ? max : n
}

Math.lerp = (n, min = 0, max = 100) => {
  return (min * (1 - n)) + (max * n)
}

Math.norm = (n, min = 0, max = 100) => {
  return (n - min) / (max - min)
}

Math.map = (n, min1 = 0, max1 = 1, min2 = 0, max2 = 100) => {
  return Math.lerp(Math.norm(Math.clamp(n, min1, max1), min1, max1), min2, max2)
}