import { Request } from 'express'

export interface Lock {
  amount: number
}

export interface TypedBody<T> extends Request {
  body: T
}
