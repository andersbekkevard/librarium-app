import { APP_CONFIG, UI_CONFIG, API_CONFIG, TIMING_CONFIG } from '../constants'

describe('constants', () => {
  it('provides expected UI defaults', () => {
    expect(UI_CONFIG.DEFAULT_NOTIFICATION_COUNT).toBe(3)
    expect(UI_CONFIG.RECENTLY_ADDED_BOOKS_LIMIT).toBe(4)
  })

  it('exposes google books defaults', () => {
    expect(API_CONFIG.GOOGLE_BOOKS.DEFAULT_SEARCH_RESULTS).toBe(10)
    expect(API_CONFIG.GOOGLE_BOOKS.MAX_SEARCH_RESULTS).toBe(40)
  })

  it('composes APP_CONFIG from individual configs', () => {
    expect(APP_CONFIG.ui).toBe(UI_CONFIG)
    expect(APP_CONFIG.api).toBe(API_CONFIG)
    expect(APP_CONFIG.timing).toBe(TIMING_CONFIG)
  })
})
