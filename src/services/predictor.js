// predictor.js — simple heuristic functions
export function itemScore(item, penalty = 1) {
  // item.prepTime (minutes) + pendingOrders * penalty
  const prep = Number(item.prepTime || 0);
  const pending = Number(item.pendingOrders || 0);
  return prep + pending * penalty;
}

// returns recommended item (lowest score) from array of items
export function recommendItem(items, penalty = 1) {
  if (!items || items.length === 0) return null;
  let best = items[0];
  let bestScore = itemScore(best, penalty);
  for (let i = 1; i < items.length; i++) {
    const s = itemScore(items[i], penalty);
    if (s < bestScore) { best = items[i]; bestScore = s; }
  }
  return { item: best, score: bestScore };
}

// compute per-canteen average ETA (mean of itemScore for items in that canteen)
export function recommendCanteen(items, penalty = 1) {
  const groups = {};
  items.forEach(it => {
    const c = it.canteen || 'A';
    if (!groups[c]) groups[c] = { sum: 0, count: 0 };
    const s = itemScore(it, penalty);
    groups[c].sum += s;
    groups[c].count += 1;
  });
  const results = Object.entries(groups).map(([canteen, data]) => {
    return { canteen, avgScore: data.sum / data.count };
  });
  results.sort((a,b) => a.avgScore - b.avgScore);
  return results[0]; // best (smallest avgScore)
}
