exports.xpRange = level => {
  let min = level * 100
  let max = (level + 1) * 100
  return { min, xp: max - min, max }
}
