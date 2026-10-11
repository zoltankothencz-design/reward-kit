// Shared by the token scripts: read W3C-style token JSON into a flat map.

// { a: { b: { $value } } }  ->  Map("a.b" -> token)
export function flatten(node, path = [], out = new Map()) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    if (value && typeof value === "object" && "$value" in value) out.set([...path, key].join("."), value);
    else flatten(value, [...path, key], out);
  }
  return out;
}

export function resolve(tokens) {
  const lookup = (value, seen = []) => {
    const alias = typeof value === "string" && value.match(/^\{(.+)\}$/);
    if (!alias) return value;
    if (seen.includes(alias[1])) throw new Error(`Circular alias: ${[...seen, alias[1]].join(" -> ")}`);
    if (!tokens.has(alias[1])) throw new Error(`Unknown alias: ${value}`);
    return lookup(tokens.get(alias[1]).$value, [...seen, alias[1]]);
  };
  return new Map([...tokens].map(([name, t]) => [name, { ...t, $value: lookup(t.$value) }]));
}
