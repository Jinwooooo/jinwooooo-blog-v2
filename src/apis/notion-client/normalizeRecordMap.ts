import { ExtendedRecordMap } from "notion-types"

/**
 * Normalize Notion API response to handle the newer response format.
 * The Notion API now wraps records as { spaceId, value: { value: Data, role } }
 * instead of the old { value: Data, role }. This function unwraps the extra nesting.
 */
const normalizeRecord = (recordMap: Record<string, any>) => {
  const normalized: Record<string, any> = {}
  for (const [key, entry] of Object.entries(recordMap)) {
    if (entry?.value?.value && entry?.value?.role !== undefined) {
      normalized[key] = { value: entry.value.value, role: entry.value.role }
    } else {
      normalized[key] = entry
    }
  }
  return normalized
}

export const normalizeRecordMap = (response: ExtendedRecordMap) => {
  response.block = normalizeRecord(response.block) as typeof response.block
  response.collection = normalizeRecord(
    response.collection
  ) as typeof response.collection
  return response
}
