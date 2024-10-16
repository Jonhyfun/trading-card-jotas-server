export const isDev = () => {
  return process.argv.slice(-1)?.[0] === 'dev'
}