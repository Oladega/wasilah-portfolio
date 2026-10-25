// Fisher–Yates over the movable prefix only. Never mutate the input order.
export function nextProjectOrder(previous: string[], random: () => number = Math.random) {
  const count = Math.min(4, Math.max(0, previous.length - 1));
  const prefix = previous.slice(0, count);
  for (let index = count - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [prefix[index], prefix[other]] = [prefix[other], prefix[index]];
  }
  if (count > 1 && prefix.every((slug, index) => slug === previous[index])) {
    // If Fisher–Yates repeats the previous order, choose uniformly from all other
    // permutations. Each alternative has probability 1/(n!-1), with no retry loop
    // that could stall under a deterministic or failing random source.
    const alternatives: string[][] = [];
    const collect = (chosen: string[], remaining: string[]) => {
      if (!remaining.length) {
        if (chosen.some((slug, index) => slug !== previous[index])) alternatives.push(chosen);
        return;
      }
      remaining.forEach((slug, index) => collect([...chosen, slug], remaining.filter((_, other) => other !== index)));
    };
    collect([], previous.slice(0, count));
    return [...alternatives[Math.floor(random() * alternatives.length)], ...previous.slice(count)];
  }
  return [...prefix, ...previous.slice(count)];
}
