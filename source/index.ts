import type * as Types from './types'
import * as utils from './utils'
import create from './provider'

export { create }

/**
 * Creates a new EVM Node Request Handler.
 * Supports ipc, http and websocket.
 * Subscriptions are not supported.
 *
 * forbidden methods:
 * - `eth_coinbase`
 * - `eth_mining`
 * - `eth_accounts`
 * - `eth_subscribe`
 * @date 7/27/2022 - 5:57:24 AM
 *
 * @export
 * @param {string} url
 * @param {Partial<Types.EvmExpressOptions>} [options={}]
 * @param {?(data: Error) => void} [callback]
 * @returns {Types.RequestHandler}
 */
export default function EvmExpress(
  url: string,
  options: Partial<Types.EvmExpressOptions> = {},
  callback?: Types.EvmHandlerCb
): Types.RequestHandler {
  const _request = create(url)
  return async (request, response) => {
    try {
      if (utils.methodNotAllowed(request.body.method, options))
        throw new Error('forbidden method: ' + request.body.method)
      else
        _request(request.body).then((result) => {
          if (callback) callback(undefined, result, request)
          response.json(result)
        })
    } catch (error) {
      const { body, path, header } = request
      error = Object.assign(<Error>error, { url, body, path, header })
      if (callback) callback(<Error>error, undefined, request)
      if (options.throwErrors) throw <Error>error
      response.send(error)
    }
  }
}
