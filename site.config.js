const CONFIG = {
  // profile setting (required)
  profile: {
    name: "Jinwoooo",
    image: "/jinwooooo_notion_avatar_231016.svg",
    role: "Doodler",
    bio: "Interests:  CS, Books, Lost Ark, Tennis",
    email: "chungjinwoo5d@naver.com",
    linkedin: "",
    github: "Jinwooooo",
    instagram: "",
  },
  projects: [
    {
      // name: ``,
      // href: "",
    },
  ],
  // blog setting (required)
  blog: {
    title: "Jinwooooo Blog",
    description: "Doodles",
  },

  // CONFIG configration (required)
  link: "https://jinwooooo-blog.vercel.app/",
  since: 2023, // If leave this empty, current year will be used.
  lang: "en-US", // ['en-US', 'zh-CN', 'zh-HK', 'zh-TW', 'ja-JP', 'es-ES', 'ko-KR']
  ogImageGenerateURL: "https://og-image-korean.vercel.app", // The link to generate OG image, don't end with a slash

  // notion configuration (required)
  notionConfig: {
    pageId: process.env.NOTION_PAGE_ID,
  },

  // plugin configuration (optional)
  googleAnalytics: {
    enable: false,
    config: {
      measurementId: process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID || "",
    },
  },
  googleSearchConsole: {
    enable: false,
    config: {
      siteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    },
  },
  utterances: {
    enable: false,
    config: {
      repo: process.env.NEXT_PUBLIC_UTTERANCES_REPO || "",
      "issue-term": "og:title",
      label: "💬 Utterances",
    },
  },
  cusdis: {
    enable: false,
    config: {
      host: "https://cusdis.com",
      appid: "", // Embed Code -> data-app-id value
    },
  },
  isProd: process.env.VERCEL_ENV === "production", // distinguish between development and production environment (ref: https://vercel.com/docs/environment-variables#system-environment-variables)
  revalidateTime: 21600 * 7, // revalidate time for [slug], index
}

module.exports = { CONFIG }
