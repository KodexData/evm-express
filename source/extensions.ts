declare module 'big-json' {
  export function createParseStream(): any
  export function createStringifyStream(opts: { body: any }): NodeJS.WritableStream
}
