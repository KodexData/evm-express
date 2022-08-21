import type * as Types from './types'
import WebSocket from 'ws'
import { connect } from 'net'
import { request } from 'http'
import { isIpc, isUrl, isWs } from './utils'
import json from 'big-json'

function ws_request<T>(url: string, payload: Types.Payload): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const socket = new WebSocket(url)
    const parseStream = json.createParseStream()

    const quit = (): void => {
      socket.close()
      parseStream.end()
    }

    parseStream.on('data', (result: T) => {
      resolve(result)
      quit()
    })

    socket.on('message', (data: Buffer) => {
      parseStream.end(data)
    })

    socket.on('error', (error) => {
      reject(error)
      quit()
    })

    socket.on('open', () => {
      socket.send(JSON.stringify(payload))
    })
  })
}

function ipc_request<T>(path: string, payload: Types.Payload): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const stream = connect(path)
    const parseStream = json.createParseStream()

    const quit = (): void => {
      stream.destroy()
    }

    parseStream.on('data', (result: T) => {
      resolve(result)
      quit()
    })

    stream.on('error', (error) => {
      error = Object.assign(error, { path, payload })
      reject(error)
      quit()
    })

    stream.pipe(parseStream)
    stream.write(JSON.stringify(payload))
    stream.end()
  })
}

function http_request<T>(url: string, payload: Types.Payload): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const parseStream = json.createParseStream()
    const { hostname, port, pathname } = new URL(url)
    const options = {
      method: 'POST',
      hostname,
      port,
      path: pathname,
      headers: { 'Content-Type': 'application/json' }
    }
    const req = request(options, function (res) {
      const chunks: Buffer[] = []

      res.on('data', function (chunk) {
        chunks.push(chunk)
      })

      res.on('end', function () {
        const body = Buffer.concat(chunks)
        parseStream.on('data', resolve)
        parseStream.end(body)
      })
    })

    req.on('error', function (error) {
      error = Object.assign(error, { url, options, payload })
      reject(error)
    })

    req.write(JSON.stringify(payload))
    req.end()
  })
}

/**
 * Creates a new EVM request.
 * Connection type will be determined by the given url parameter.
 * The created request method will not escape forbidden methods.
 * @date 7/27/2022 - 7:15:13 AM
 *
 * @export
 * @param {string} url
 * @returns {Types.RequestFn}
 */
export default function create(url: string): Types.RequestFn {
  if (isIpc(url)) {
    return (payload: Types.Payload) => ipc_request(url, payload)
  } else if (isUrl.test(url)) {
    return (payload: Types.Payload) => http_request(url, payload)
  } else if (isWs.test(url)) {
    return (payload: Types.Payload) => ws_request(url, payload)
  }
  throw new Error('invalid provider connection')
}
