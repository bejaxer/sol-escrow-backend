// @ts-nocheck
import colors from 'colors/safe'

export const successLog = (str: string) => {
  if (process.env.NODE_ENV !== 'production') console.log(colors.green.bold(str))
}

export const warningLog = (str: string) => {
  if (process.env.NODE_ENV !== 'production')
    console.log(colors.yellow.bold(str))
}

export const log = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') console.log(...args)
}

export const errorLog = (...args: any[]) => {
  console.error(...args)
}
