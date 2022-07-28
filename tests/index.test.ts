import Handler, { create } from '../source'
import Express from 'express'
import payloads from './payloads'
import { json } from 'body-parser'
import { expect } from 'chai'
import { server } from 'ganache'


describe('testing evm-express', function () {
  let nodeUp = false
  let handlerUp = false

  const url = 'ws://127.0.0.1:8599'
  const node = server({})
  const express = Express()

  this.beforeAll(async () => {
    if (nodeUp) return
    await node.listen(8599)
    nodeUp = true

    if (handlerUp) return

    express.use('/', json(), Handler(url, undefined, (error) => {
      if (error) console.error(error.message)
    }))

    express.listen(3025)
    handlerUp = true
  })

  it('should return the latest block number, given a valid URL type ', async function () {
    const request = create(url)
    const { result } = await request<string>(payloads.blockNumber)
    expect(result).equals('0x0')
  })

  it('should return the latest block number from an http request', async function () {
    const request = create('https://ethercluster.com/etc')
    const { result } = await request<string>(payloads.blockNumber)
    expect(parseInt(result, 16)).greaterThan(0)
  })

  it('should return the latest block number from express', async function () {
    const request = create('http://localhost:3025')
    const { result } = await request<string>(payloads.blockNumber)
    expect(result).equals('0x0')
  })

  it('should prevent forbidden method, eth_coinbase, from being called', async function () {
    const request = create('http://localhost:3025')
    const { result } = await request<string>(payloads.coinbase)

    expect(result).undefined
  })

  it('should prevent forbidden method, eth_accounts, from being called', async function () {
    const request = create('http://localhost:3025')
    const { result } = await request<string>(payloads.accounts)

    expect(result).undefined
  })
})
