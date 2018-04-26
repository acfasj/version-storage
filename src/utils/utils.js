export function suffix(key, word, seperator = '_') {
  return `${key}${seperator}${word}`
}

export function unique(arr) {
  return [...new Set(arr)]
}

export function serialize(val) {
  return JSON.stringify(val)
}

export function deserialize(val) {
  if (typeof val !== 'string') {
    return undefined
  }
  try {
    return JSON.parse(val)
  } catch (e) {
    return val || undefined
  }
}
