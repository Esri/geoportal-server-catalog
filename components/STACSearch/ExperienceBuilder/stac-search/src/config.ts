import type { ImmutableObject } from 'seamless-immutable'

export interface StacApiEntry {
  url: string
  label: string
  priority: number
  requestParameters: string
}

export const normalizeStacApiPriority = (priority?: number): number => {
  const nextPriority = Number.isFinite(priority) ? Math.floor(priority as number) : 4
  return Math.min(4, Math.max(1, nextPriority))
}

export const normalizeStacApiEntries = (entries: Array<string | StacApiEntry> | undefined | null): StacApiEntry[] => {
  return (entries ?? [])
    .map((entry) => {
      if (typeof entry === 'string') {
        const url = entry.trim()
        return url
          ? { url, label: '', priority: 4, requestParameters: '' }
          : null
      }

      const url = entry?.url?.trim()
      if (!url) {
        return null
      }

      return {
        url,
        label: entry.label?.trim() ?? '',
        priority: normalizeStacApiPriority(entry.priority),
        requestParameters: entry.requestParameters?.trim() ?? ''
      }
    })
    .filter((entry): entry is StacApiEntry => Boolean(entry))
}

export interface Config {
  widgetTitle: string
  stacApiUrls: StacApiEntry[]
  defaultCollections: string
  defaultLimit: number
  useCurrentExtent: boolean
}

export type IMConfig = ImmutableObject<Config>