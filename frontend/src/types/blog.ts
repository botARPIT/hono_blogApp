// Blog related types
export type BlogDTO = {
  author: {
    name: string
  }
  title: string
  content: string
  createdAt: string
  id: string
  tag: BlogTag
  thumbnail: string
  published: boolean
  like: number
}

// User profile type
export type UserProfile = {
  id: string
  name: string
  email: string
  createdAt: Date
}

// Blog tag enum
export const BlogTag = {
  SOCIAL: "SOCIAL",
  TECH: "TECH",
  ENTERTAINMENT: "ENTERTAINMENT",
  INFOTAINMENT: "INFOTAINMENT",
  SPORTS: "SPORTS",
  MOVIES: "MOVIES",
  GAMING: "GAMING",
  PHILOSOPHY: "PHILOSOPHY",
  SCIENCE: "SCIENCE",
  ART: "ART",
  NATURE: "NATURE",
  WILDLIFE: "WILDLIFE",
  GENERAL: "GENERAL"
} as const

export type BlogTag = typeof BlogTag[keyof typeof BlogTag]

// Request/Response types
export type CreateBlogRequest = {
  title: string
  content: string
  thumbnail?: string
  tag: BlogTag
  published: boolean
}

export type UpdateBlogRequest = {
  title?: string
  content?: string
  thumbnail?: string
  tag?: BlogTag
  published?: boolean
}

export type UpdateProfileRequest = {
  name?: string
  email?: string
}

// API Response types
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
  }
}
