export function calculateFare(inputDistance, rule, discount) {
  const distance = Math.ceil(inputDistance)

  const costBase = rule.baseFare
  const extraDistance = Math.max(0, distance - rule.baseDistance)
  const costDistance = extraDistance * rule.unitPrice
  const longDistance = Math.max(0, distance - rule.longDistanceThreshold)
  const rawLongCost = longDistance * rule.longDistanceSurcharge
  const costLong = Math.min(rawLongCost, rule.longDistanceCap)
  const totalRaw = costBase + costDistance + costLong
  const finalPrice = totalRaw * discount

  return {
    finalPrice,
    baseFare: costBase,
    distanceCost: costDistance,
    longDistanceCost: costLong,
    distance,
    discount,
    extraDistance,
    unitPrice: rule.unitPrice,
    longDistance,
    longDistanceSurcharge: rule.longDistanceSurcharge,
  }
}

export function getDefaultRuleIndex() {
  const hour = new Date().getHours()
  if (hour >= 7 && hour <= 19) return 0
  if (hour >= 20 && hour <= 23) return 1
  return 2
}
