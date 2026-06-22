import type { ImmutableObject } from 'seamless-immutable'

export interface Config {
  widgetTitle: string
  stacApiUrls: string[]
  defaultCollections: string
  defaultLimit: number
  useCurrentExtent: boolean
}

export type IMConfig = ImmutableObject<Config>