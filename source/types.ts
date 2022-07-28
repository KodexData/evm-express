import type { Request } from 'express'

export interface EvmExpressOptions {
  chainId?: number
  chainName?: string
  disabledMethods?: string[]
  throwErrors?: boolean
  ssh?: boolean
  db?: boolean
  net?: boolean
}

export type EvmHandlerCb = <CbType = unknown>(error?: Error, data?: CbType, request?: Request) => void
export type RequestFn = <T = unknown>(payload: Record<string, unknown>) => Promise<Result<T>>
export type Payload = Record<string, unknown>
export type Result<T = unknown> = {
  jsonrpc: string
  id: number | string
  result: T
}

export type { RequestHandler } from 'express'
