import { NotionAPI } from "notion-client"
import { normalizeRecordMap } from "./normalizeRecordMap"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const MAX_RETRIES = 5

// Notion's unofficial v3 endpoint (used by react-notion-x) rate-limits aggressively.
// During next build, getStaticProps fires getRecordMap once per post in rapid
// succession. Retry on 429/5xx, honoring Retry-After when provided.
const fetchPageWithRetry = async (pageId: string) => {
  const api = new NotionAPI()
  let attempt = 0
  while (true) {
    try {
      return await api.getPage(pageId)
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status
      const retriable = status === 429 || (status >= 500 && status < 600)
      if (!retriable || attempt >= MAX_RETRIES) throw err
      const headerWait =
        Number(err?.response?.headers?.get?.("retry-after")) || 0
      const backoff = Math.max(headerWait * 1000, 1500 * 2 ** attempt)
      attempt++
      await sleep(backoff)
    }
  }
}

export const getRecordMap = async (pageId: string) => {
  const recordMap = await fetchPageWithRetry(pageId)
  return normalizeRecordMap(recordMap)
}
