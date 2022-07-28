import type * as Types from './types'
import { lstatSync, existsSync } from 'fs'

export const isSSH = /^ssh/
export const isNET = /^net/
export const isDB = /^db/
export const isUrl = /^(https?:\/\/)/
export const isWs = /^(wss?:\/\/)([0-9]{1,3}(?:\.[0-9]{1,3}){3}|[^\/]+):([0-9]{1,5})$/

export function methodNotAllowed(method: string, options: Partial<Types.EvmExpressOptions>): boolean {
  if (['eth_coinbase', 'eth_mining', 'eth_accounts', 'eth_subscribe', undefined].includes(method)) return true
  if (options && options.disabledMethods && options.disabledMethods.includes(method)) return true
  if (isSSH.test(method) && !options.ssh) return true
  if (isNET.test(method) && !options.net) return true
  if (isDB.test(method) && !options.db) return true

  return false
}

export function isIpc(url: string): boolean {
  try {
    if (existsSync(url) && lstatSync(url).isSocket()) return true
  } catch (error) {
    return false
  }
  return false
}
