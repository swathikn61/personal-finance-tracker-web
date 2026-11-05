// Thin fetch wrapper around the Express backend (proxied at /api by Vite in dev)

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api/v1"

const ACCESS_KEY = "pft_access_token"
const REFRESH_KEY = "pft_refresh_token"

export type EntryType = "income" | "expense"

export interface Entry {
  id: number
  amount: number
  type: EntryType
  category: string
  description: string
  date: string
}

export type EntryInput = Omit<Entry, "id">

export interface EntriesPage {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  entries: Entry[]
}

export interface EntriesQuery {
  page?: number
  limit?: number
  type?: EntryType
  category?: string
  startDate?: string
  endDate?: string
  sortBy?: "date" | "amount" | "category"
  sortOrder?: "ASC" | "DESC"
}

export interface Totals {
  totalIncome: number
  totalExpense: number
  balance: number
}

export interface Insights {
  monthly: { month: string; income: number; expense: number }[]
  categories: { category: string; total: number }[]
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const tokens = {
  get access() {
    return localStorage.getItem(ACCESS_KEY)
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY)
  },
  set(access: string, refresh?: string) {
    localStorage.setItem(ACCESS_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

// Called when the session can't be recovered, so the app can drop back to login
let onUnauthorized: () => void = () => {}
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json()
    return body.message ?? res.statusText
  } catch {
    return res.statusText || `Request failed (${res.status})`
  }
}

// Share one in-flight refresh between concurrent 401s
let refreshing: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokens.refresh
  if (!refreshToken) return false
  refreshing ??= fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (res) => {
      if (!res.ok) return false
      const { accessToken } = await res.json()
      tokens.set(accessToken)
      return true
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

async function request(path: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const headers = new Headers(init.headers)
  if (init.body) headers.set("Content-Type", "application/json")
  if (tokens.access) headers.set("Authorization", `Bearer ${tokens.access}`)

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  if (res.status === 401 && retry && tokens.refresh) {
    if (await refreshAccessToken()) return request(path, init, false)
  }
  if (res.status === 401 && tokens.access) {
    tokens.clear()
    onUnauthorized()
  }
  if (!res.ok) throw new ApiError(res.status, await readError(res))
  return res
}

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await request(path, init)
  return res.json() as Promise<T>
}

function toQueryString(query: EntriesQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export const api = {
  async login(email: string, password: string) {
    const data = await json<{ accessToken: string; refreshToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    tokens.set(data.accessToken, data.refreshToken)
  },

  me() {
    return json<{ id: number; name: string; email: string }>("/auth/me")
  },

  register(name: string, email: string, password: string) {
    return json<{ message: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
  },

  async getEntries(query: EntriesQuery): Promise<EntriesPage> {
    const data = await json<EntriesPage | { entries: EntriesPage }>(`/entries${toQueryString(query)}`)
    // Cached responses come back wrapped as { message, entries: <page> }
    return "currentPage" in data ? data : data.entries
  },

  createEntry(entry: EntryInput) {
    return json<{ entry: Entry }>("/entries", { method: "POST", body: JSON.stringify(entry) })
  },

  updateEntry(id: number, entry: EntryInput) {
    return json<{ entry: Entry }>(`/entries/${id}`, { method: "PUT", body: JSON.stringify(entry) })
  },

  deleteEntry(id: number) {
    return json<{ message: string }>(`/entries/${id}`, { method: "DELETE" })
  },

  async getTotals(): Promise<Totals> {
    const data = await json<Totals>("/summary/totals")
    return {
      totalIncome: Number(data.totalIncome),
      totalExpense: Number(data.totalExpense),
      balance: Number(data.balance),
    }
  },

  getInsights() {
    return json<Insights>("/summary/insights")
  },

  async exportCsv() {
    const res = await request("/export")
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "entries.csv"
    a.click()
    URL.revokeObjectURL(url)
  },
}
