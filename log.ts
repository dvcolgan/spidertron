const Log = {
  log: (message: string, color: string) => {
    console.log('%c%s', `color: ${color}`, message)
  },
  black: (message: string) => Log.log(message, 'black'),
  white: (message: string) => Log.log(message, 'white'),
  pink: (message: string) => Log.log(message, 'pink'),
  purple: (message: string) => Log.log(message, 'purple'),
  blue: (message: string) => Log.log(message, 'blue'),
  green: (message: string) => Log.log(message, 'green'),
  yellow: (message: string) => Log.log(message, 'yellow'),
  orange: (message: string) => Log.log(message, 'orange'),
  red: (message: string) => Log.log(message, 'red'),
}
export default Log
