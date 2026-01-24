import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { type } from 'arktype'
import { env } from 'cloudflare:test'
import { validator, getValidated } from './validator'

describe('validator middleware', () => {
  it('should parse numeric query values', async () => {
    const app = new Hono()
    const schema = type({ limit: 'number', offset: 'number' })
    app.get(
      '/query',
      validator('query', schema),
      (c) => c.json(getValidated(c, 'query'))
    )

    const res = await app.request('/query?limit=10&offset=5', {}, env)
    expect(res.status).toBe(200)
    const body = await res.json() as { limit: number; offset: number }
    expect(body.limit).toBe(10)
    expect(body.offset).toBe(5)
  })

  it('should validate json body', async () => {
    const app = new Hono()
    const schema = type({ title: 'string' })
    app.post(
      '/json',
      validator('json', schema),
      (c) => c.json(getValidated(c, 'json'))
    )

    const res = await app.request(
      '/json',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test' }),
      },
      env
    )
    expect(res.status).toBe(200)
    const body = await res.json() as { title: string }
    expect(body.title).toBe('Test')
  })
})
