import { describe, it, expect, vi, afterEach } from 'vitest'
import { searchBooks, searchByISBN, searchByAuthor, sortByPublishedDateDesc } from './rakuten'

describe('rakuten service', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should map search results and cap hits', async () => {
    let requestedUrl = ''
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        requestedUrl = input.toString()
        return new Response(
          JSON.stringify({
            Items: [
              {
                Item: {
                  isbn: '9780000000001',
                  title: 'Test Book',
                  author: 'Author A/Author B',
                  publisherName: 'Publisher',
                  salesDate: '2024年1月1日',
                  size: '320p',
                  itemCaption: 'Desc',
                  largeImageUrl: 'https://example.com/cover.png',
                  affiliateUrl: 'https://example.com/aff',
                },
              },
            ],
            pageCount: 1,
            hits: 1,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      })
    )

    const result = await searchBooks('query', 'app-id', 20, 1)
    const url = new URL(requestedUrl)
    expect(url.searchParams.get('hits')).toBe('10')
    expect(result.results[0].authors).toEqual(['Author A', 'Author B'])
    expect(result.results[0].pageCount).toBe(320)
    expect(result.hits).toBe(1)
  })

  it('should return null for ISBN search with no results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ Items: [], pageCount: 0, hits: 0 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )

    const result = await searchByISBN('9780000000001', 'app-id')
    expect(result).toBeNull()
  })

  it('should return author search results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            Items: [
              {
                Item: {
                  isbn: '9780000000002',
                  title: 'Author Book',
                  author: 'Author C',
                  publisherName: 'Publisher',
                  salesDate: '2023年12月1日',
                  size: '200p',
                  itemCaption: '',
                  largeImageUrl: '',
                  affiliateUrl: '',
                },
              },
            ],
            pageCount: 1,
            hits: 1,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    )

    const result = await searchByAuthor('Author', 'app-id', 5)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Author Book')
  })

  it('should sort by published date desc', () => {
    const sorted = sortByPublishedDateDesc([
      { title: 'Old', publishedDate: '2020年1月1日' } as never,
      { title: 'New', publishedDate: '2024年1月1日' } as never,
    ])
    expect(sorted[0].title).toBe('New')
  })
})
