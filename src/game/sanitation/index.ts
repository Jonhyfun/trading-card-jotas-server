export const removeTrailingOperations = (operation: string) => {
  if (!operation || operation.length === 1) return operation
  if (!operation[0].match(/[\d-]/g)) {
    return removeTrailingOperations(operation.slice(1))
  }
  if (!operation.slice(-1).match(/[\d-]/g)) {
    return removeTrailingOperations(operation.slice(0, -1))
  }
  return operation
}

export const equationSanitizer = (equation: string) => {
  const nonCollidingChars = ['*', '/']
  const equationChars = equation.split('')

  const indexToRemove = [] as number[]
  for (let i = equationChars.length - 1; i >= 0; i--) {
    if (nonCollidingChars.includes(equationChars[i])) {
      let lastSpace = 1;
      while (equationChars[i - lastSpace] === ' ') {
        lastSpace++
      }
      if (equationChars[i - lastSpace] && nonCollidingChars.includes(equationChars[i - lastSpace])) {
        indexToRemove.push(i - lastSpace)
      }
    }
  }

  indexToRemove.forEach((i) => {
    equationChars[i] = ''
  })

  return equationChars.join('')
};