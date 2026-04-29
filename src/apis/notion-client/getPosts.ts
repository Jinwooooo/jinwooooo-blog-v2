import { Client } from "@notionhq/client"
import { TPost, TPosts } from "src/types"

// Memoize across getStaticProps calls in the same Node process. Next.js
// invokes getStaticProps once per static path; without this, getPosts would
// re-issue the query for every path during a single build.
let postsPromise: Promise<TPosts> | null = null

export const getPosts = async (): Promise<TPosts> => {
  if (!postsPromise) {
    postsPromise = fetchPosts().catch((err) => {
      postsPromise = null
      throw err
    })
  }
  return postsPromise
}

const text = (rich: any[] | undefined) =>
  rich?.[0]?.plain_text ?? undefined

const fileUrl = (file: any) =>
  file?.file?.url ?? file?.external?.url ?? undefined

// Notion's official API returns time-limited signed S3 URLs for uploaded files.
// They expire ~1h after issue, so static builds break. Route them through
// Notion's own image proxy, which re-signs the underlying URL per request.
// www.notion.so is already in next.config.js remotePatterns.
const proxyNotionImage = (originalUrl: string, pageId: string): string => {
  let cleanUrl = originalUrl
  try {
    const u = new URL(originalUrl)
    if (u.searchParams.has("X-Amz-Signature")) {
      cleanUrl = u.origin + u.pathname
    }
  } catch {
    return originalUrl
  }
  const proxy = new URL(
    `https://www.notion.so/image/${encodeURIComponent(cleanUrl)}`
  )
  proxy.searchParams.set("table", "block")
  proxy.searchParams.set("id", pageId)
  proxy.searchParams.set("cache", "v2")
  return proxy.toString()
}

const stripUndefined = <T extends object>(obj: T): T => {
  const out: any = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue
    out[k] = v
  }
  return out
}

const mapPage = (page: any): TPost => {
  const props = page.properties

  const title = text(props.title?.title) ?? ""
  const slug = text(props.slug?.rich_text) ?? ""
  const summary = text(props.summary?.rich_text)
  const startDate = props.date?.date?.start
  const shortDate = props.shortDate?.formula?.string ?? ""
  const typeName = props.type?.select?.name as TPost["type"][number] | undefined
  const statusName = props.status?.select?.name as TPost["status"][number] | undefined
  const categoryName = props.category?.select?.name
  const tags = (props.tags?.multi_select ?? []).map((t: any) => t.name)
  const thumbnailRaw = fileUrl(props.thumbnail?.files?.[0])
  const thumbnail = thumbnailRaw
    ? proxyNotionImage(thumbnailRaw, page.id)
    : undefined
  const author = (props.author?.people ?? []).map((u: any) =>
    stripUndefined({
      id: u.id,
      name: u.name ?? "",
      profile_photo: u.avatar_url ?? undefined,
    })
  )

  return stripUndefined({
    id: page.id,
    title,
    slug,
    summary,
    date: { start_date: startDate ?? page.created_time },
    shortDate,
    type: typeName ? [typeName] : [],
    status: statusName ? [statusName] : [],
    category: categoryName ? [categoryName] : undefined,
    tags: tags.length ? tags : undefined,
    thumbnail,
    author: author.length ? author : undefined,
    createdTime: new Date(page.created_time).toString(),
    fullWidth: false,
  }) as TPost
}

const fetchPosts = async (): Promise<TPosts> => {
  const token = process.env.NOTION_TOKEN
  const databaseId = process.env.NOTION_PAGE_ID
  if (!token) throw new Error("NOTION_TOKEN env var is required")
  if (!databaseId) throw new Error("NOTION_PAGE_ID env var is required")

  const notion = new Client({ auth: token })

  const db: any = await notion.databases.retrieve({ database_id: databaseId })
  const dataSourceId: string | undefined = db?.data_sources?.[0]?.id
  if (!dataSourceId) {
    throw new Error(
      `No data source found on database ${databaseId}. Confirm the integration has been shared with the database.`
    )
  }

  const results: any[] = []
  let cursor: string | undefined = undefined
  do {
    const resp: any = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      start_cursor: cursor,
    })
    results.push(...resp.results)
    cursor = resp.has_more ? resp.next_cursor : undefined
  } while (cursor)

  const posts = results.map(mapPage) as TPosts
  posts.sort((a: any, b: any) => {
    const dateA = new Date(a?.date?.start_date || a.createdTime).getTime()
    const dateB = new Date(b?.date?.start_date || b.createdTime).getTime()
    return dateB - dateA
  })
  return posts
}
