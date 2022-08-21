import type { RequestHandler } from 'express'
import create from './provider'

export default function Middleware(url: string): RequestHandler {
  return function (req, _, next) {
    req.ethereum = create(url)
    next()
  }
}
