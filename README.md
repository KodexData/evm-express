# evm-express

Express handler for EVM compatible node requests. Supports `ipc`, `http` and `websocket`. Subscriptions are not supported.

- `yarn add evm-express`
- `npm install evm-express`

__EXAMPLE:__

```ts
import type { EvmExpressOptions } from 'evm-express'
import EvmExpress from 'evm-express'
import Express from 'express'
import { json } from 'body-parser'

const app = Express()
const path = '/Volumes/chains/eth/geth.ipc'
const options: Partial<EvmHandlerOptions> = {
  throwErrors: false, disabledMethods: [
    'eth_submitWork', 'eth_submitHashrate'
  ],
}

const handler = EvmExpress(path, options, (error, data, request) => {
  if (error) console.error(error)
  if (data) console.log(data)
  if (request) console.log(request.body)
})

app.post('/', json(), handler)

app.listen(3000)
```

__REQUEST ONLY:__

Connection type will be determined by given url parameter. The created request method will not escape forbidden methods.

```ts
import { create } from 'evm-express'

const request = create('http://localhost:8545')
const { result } = await request<string>({
  jsonrpc: '2.0', id: 83, params:[],
  method: 'eth_blockNumber'
})

console.log(result)
```

__REQUEST PROVIDER:__

Injects provider into the express request handler

```ts
import Express from 'express'
import { Middleware } from 'evm-express'

const app = Express()
const url = 'http://localhost:8545'
app.use(Middleware(url))

app.get('/blockNumber', function(req, res){
  const { result } = await req.ethereum<string>({
    jsonrpc: '2.0', id: 83, params:[],
    method: 'eth_blockNumber'
  })
  res.send(result)
})

app.listen(3000)
```

__OPTIONS:__

```ts
export interface EvmExpressOptions {
  chainId?: number
  chainName?: string
  disabledMethods?: string[]
  throwErrors?: boolean
  ssh?: boolean
  db?: boolean
  net?: boolean
}
```
