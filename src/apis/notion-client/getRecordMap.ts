import { NotionAPI } from "notion-client"
import { normalizeRecordMap } from "./normalizeRecordMap"

export const getRecordMap = async (pageId: string) => {
  const api = new NotionAPI()
  const recordMap = normalizeRecordMap(await api.getPage(pageId))
  return recordMap
}
