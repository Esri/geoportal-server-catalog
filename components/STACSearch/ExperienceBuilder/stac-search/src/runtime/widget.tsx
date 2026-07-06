/** @jsx jsx */
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer'
import ImageryTileLayer from '@arcgis/core/layers/ImageryTileLayer'
import Extent from '@arcgis/core/geometry/Extent'
import SpatialReference from '@arcgis/core/geometry/SpatialReference'
import { React, jsx, css, type AllWidgetProps } from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import { Button, Checkbox, Label, Loading, NumericInput, Select, TextInput } from 'jimu-ui'
import type { IMConfig } from '../config'

type StacFeature = {
  id?: string
  bbox?: number[]
  geometry?: Record<string, unknown>
  properties?: {
    datetime?: string
    [key: string]: unknown
  }
  collection?: string
  assets?: Record<string, {
    href?: string
    title?: string
    type?: string
    roles?: string[]
  }>
  links?: Array<{
    href?: string
    rel?: string
    title?: string
    type?: string
  }>
}

type StacFeatureCollection = {
  type: 'FeatureCollection'
  features: StacFeature[]
  links?: Array<{
    href?: string
    rel?: string
  }>
}

type StacCollection = {
  id?: string
  title?: string
}

type StacCollectionsResponse = {
  collections?: StacCollection[]
}

const style = css`
  height: 100%;
  padding: 1rem;

  .panel {
    height: 100%;
    min-height: 0;
    border: 1px solid var(--sys-color-divider-primary);
    border-radius: 0.75rem;
    background: var(--sys-color-surface);
  }

  .hidden-map-connector {
    display: none;
  }

  .panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .panel-header {
    padding: 1rem 1rem 0.5rem;
  }

  .panel-body {
    display: flex;
    flex-direction: row;
    gap: 0.75rem;
    min-height: 0;
    padding: 0 1rem 1rem;
  }

  .search-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 280px;
    flex-shrink: 0;
  }

  .results-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-height: 0;
    flex: 1;
    min-width: 0;
  }

  .muted {
    color: var(--sys-color-text-secondary);
    font-size: 0.875rem;
  }

  .request-summary {
    max-width: 200px;
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .results {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-height: 0;
    overflow: auto;
    padding-right: 0.25rem;
  }

  .result-card {
    border: 1px solid var(--sys-color-divider-secondary);
    border-radius: 0.75rem;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .result-title {
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .result-thumbnail {
    width: 100%;
    max-height: 160px;
    object-fit: cover;
    border-radius: 0.5rem;
    display: block;
  }

  .field-row {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .empty-state,
  .error-state {
    padding: 0.75rem;
    border-radius: 0.75rem;
    font-size: 0.875rem;
  }

  .empty-state {
    background: var(--sys-color-surface-2);
  }

  .error-state {
    background: var(--sys-color-danger-light);
    color: var(--sys-color-danger-dark);
  }

  @media (max-width: 992px) {
    .panel {
      min-height: 320px;
    }
  }
`

const getItemLink = (feature: StacFeature): string | undefined => {
  const preferred = feature.links?.find(link => link.rel === 'self' || link.rel === 'item')
  return preferred?.href ?? feature.links?.find(link => Boolean(link.href))?.href
}

const getThumbnailUrl = (feature: StacFeature): string | undefined => {
  if (!feature.assets) {
    return undefined
  }

  // Look for thumbnail asset with 'thumbnail' role
  for (const [, asset] of Object.entries(feature.assets)) {
    if (asset.roles?.includes('thumbnail') && asset.href && asset.href.startsWith('http')) {
      return asset.href
    }
  }

  return undefined
}

const buildPopupFieldInfos = (features: StacFeature[]): Array<{ fieldName: string, label: string }> => {
  const propertyKeys = new Set<string>()

  // Collect all unique property keys from all features
  features.forEach((feature) => {
    if (feature.properties) {
      Object.keys(feature.properties).forEach((key) => {
        propertyKeys.add(key)
      })
    }
  })

  // Fields to exclude from popup
  const excludedFields = ['thumbnail_url']
  
  // Common STAC properties to prioritize
  const prioritizedKeys = ['id', 'title', 'granule', 'datetime', 'platform', 'instruments', 'gsd', 'proj:epsg', 'eo:cloud_cover', 'start_datetime', 'end_datetime']
  const sortedKeys = Array.from(propertyKeys)
    .filter((key) => !excludedFields.includes(key))
    .sort((a, b) => {
      const aIndex = prioritizedKeys.indexOf(a)
      const bIndex = prioritizedKeys.indexOf(b)
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      return a.localeCompare(b)
    })

  // Convert property names to user-friendly labels
  return sortedKeys.map((key) => ({
    fieldName: key,
    label: key
      .split(/[_:]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }))
}

const getCogUrl = (feature: StacFeature): string | undefined => {
  if (!feature.assets) {
    return undefined
  }

  for (const asset of Object.values(feature.assets)) {
    if (
      asset.roles?.includes('data') &&
      asset.type === 'image/tiff; application=geotiff; profile=cloud-optimized' &&
      asset.href?.startsWith('http')
    ) {
      return asset.href
    }
  }

  return undefined
}

const getFeatureExtent = (feature: StacFeature): Extent | null => {
  if (!Array.isArray(feature.bbox) || feature.bbox.length < 4) {
    return null
  }

  const [xmin, ymin, xmax, ymax] = feature.bbox

  return new Extent({
    xmin,
    ymin,
    xmax,
    ymax,
    spatialReference: { wkid: 4326 }
  })
}

const clampWgs84Bbox = (bbox: number[]): number[] => {
  const [xmin, ymin, xmax, ymax] = bbox

  return [
    Math.max(-180, Math.min(180, xmin)),
    Math.max(-90, Math.min(90, ymin)),
    Math.max(-180, Math.min(180, xmax)),
    Math.max(-90, Math.min(90, ymax))
  ]
}

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const [activeJimuMapView, setActiveJimuMapView] = React.useState<JimuMapView | null>(null)
  const layerRef = React.useRef<GeoJSONLayer | null>(null)
  const layerUrlRef = React.useRef<string | null>(null)

  const [stacUrl, setStacUrl] = React.useState(
    ((props.config.stacApiUrls as unknown as string[]) ?? [])[0] ?? ''
  )
  const [selectedCollection, setSelectedCollection] = React.useState((props.config.defaultCollections ?? '').split(',')[0]?.trim() ?? '')
  const [collectionOptions, setCollectionOptions] = React.useState<Array<{ id: string, label: string }>>([])
  const [collectionsLoading, setCollectionsLoading] = React.useState(false)
  const [collectionsError, setCollectionsError] = React.useState('')
  const [startDate, setStartDate] = React.useState('')
  const [endDate, setEndDate] = React.useState('')
  const [limit, setLimit] = React.useState(props.config.defaultLimit ?? 25)
  const [useCurrentExtent, setUseCurrentExtent] = React.useState(props.config.useCurrentExtent ?? true)
  const [results, setResults] = React.useState<StacFeature[]>([])
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [lastRequestSummary, setLastRequestSummary] = React.useState('')
  const [addedCogIds, setAddedCogIds] = React.useState<Set<string>>(new Set())

  const cleanupLayer = React.useCallback(() => {
    if (activeJimuMapView?.view?.map && layerRef.current) {
      activeJimuMapView.view.map.remove(layerRef.current)
    }

    if (layerUrlRef.current) {
      URL.revokeObjectURL(layerUrlRef.current)
    }

    layerRef.current = null
    layerUrlRef.current = null
  }, [activeJimuMapView])

  React.useEffect(() => {
    return () => {
      cleanupLayer()
    }
  }, [cleanupLayer])

  React.useEffect(() => {
    // Sync selected STAC URL when the configured list changes
    const urls: string[] = (props.config.stacApiUrls as unknown as string[]) ?? []
    setStacUrl((prev) => {
      if (urls.includes(prev)) {
        return prev
      }
      return urls[0] ?? ''
    })
  }, [props.config.stacApiUrls])

  React.useEffect(() => {
    if (!activeJimuMapView?.view?.map || !layerRef.current) {
      return
    }

    const existsInMap = activeJimuMapView.view.map.layers.includes(layerRef.current)
    if (!existsInMap) {
      activeJimuMapView.view.map.add(layerRef.current)
    }
  }, [activeJimuMapView])

  React.useEffect(() => {
    const loadCollections = async (): Promise<void> => {
      const baseUrl = (stacUrl ?? '').trim().replace(/\/$/, '')

      if (!baseUrl) {
        setCollectionOptions([])
        setCollectionsError('')
        return
      }

      setCollectionsLoading(true)
      setCollectionsError('')

      try {
        const response = await fetch(`${baseUrl}/collections`)

        if (!response.ok) {
          throw new Error(`Collections request failed with ${response.status} ${response.statusText}`)
        }

        const data = await response.json() as StacCollectionsResponse
        const options = (data.collections ?? [])
          .filter((collection) => Boolean(collection.id))
          .map((collection) => ({
            id: collection.id as string,
            label: (collection.title?.trim() || collection.id) as string
          }))

        setCollectionOptions(options)

        if (options.length === 0) {
          setSelectedCollection('')
          return
        }

        const hasCurrentSelection = options.some((option) => option.id === selectedCollection)
        if (!hasCurrentSelection) {
          const defaultId = (props.config.defaultCollections ?? '').split(',')[0]?.trim() ?? ''
          const defaultOption = options.find((option) => option.id === defaultId)
          setSelectedCollection(defaultOption?.id ?? options[0].id)
        }
      } catch (collectionsFetchError) {
        setCollectionOptions([])
        setCollectionsError(
          collectionsFetchError instanceof Error
            ? collectionsFetchError.message
            : 'Unable to load STAC collections.'
        )
      } finally {
        setCollectionsLoading(false)
      }
    }

    void loadCollections()
  }, [props.config.defaultCollections, stacUrl])

  const updateResultLayer = React.useCallback(async (featureCollection: StacFeatureCollection) => {
    if (!activeJimuMapView?.view?.map) {
      return
    }

    cleanupLayer()

    if (featureCollection.features.length === 0) {
      return
    }

    // Add id, title, granule link, and thumbnail to each feature's properties
    const enrichedFeatures = featureCollection.features.map((feature) => ({
      ...feature,
      properties: {
        id: feature.id,
        title: feature.id,
        ...feature.properties,
        granule: getItemLink(feature) ?? 'No link available',
        thumbnail_url: getThumbnailUrl(feature) ?? ''
      }
    }))

    const fieldInfos = buildPopupFieldInfos(enrichedFeatures)
    const blob = new Blob([JSON.stringify({ ...featureCollection, features: enrichedFeatures })], { type: 'application/geo+json' })
    const url = URL.createObjectURL(blob)

    // Build popup content: fields first, thumbnail below
    const popupContent: any[] = []

    popupContent.push({
      type: 'fields',
      fieldInfos
    })

    // Add thumbnail below attributes if any feature has one
    const hasAnyThumbnail = enrichedFeatures.some((f) => f.properties?.thumbnail_url)
    if (hasAnyThumbnail) {
      popupContent.push({
        type: 'media',
        mediaInfos: [
          {
            type: 'image',
            value: {
              sourceURL: '{thumbnail_url}'
            }
          }
        ]
      })
    }

    const layer = new GeoJSONLayer({
      url,
      title: 'STAC Results',
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [46, 132, 255, 0.12],
          outline: {
            color: [46, 132, 255, 1],
            width: 1.5
          }
        }
      },
      popupTemplate: {
        title: '{title}',
        content: popupContent
      }
    })

    layerUrlRef.current = url
    layerRef.current = layer
    activeJimuMapView.view.map.add(layer)
  }, [activeJimuMapView, cleanupLayer])

  const addCogToMap = React.useCallback((feature: StacFeature) => {
    const cogUrl = getCogUrl(feature)
    const featureId = feature.id ?? cogUrl

    if (!cogUrl || !activeJimuMapView?.view?.map || !featureId) {
      return
    }

    const layer = new ImageryTileLayer({
      url: cogUrl,
      title: feature.id ?? 'COG Layer'
    })

    activeJimuMapView.view.map.add(layer)
    setAddedCogIds((prev) => new Set(prev).add(featureId))
  }, [activeJimuMapView])

  const buildDatetime = React.useCallback((): string | undefined => {
    if (!startDate && !endDate) {
      return undefined
    }

    const start = startDate || '..'
    const end = endDate || '..'
    return `${start}/${end}`
  }, [endDate, startDate])

  const search = React.useCallback(async () => {
    const baseUrl = (stacUrl ?? '').trim().replace(/\/$/, '')

    if (!baseUrl) {
      setError('Set a STAC API URL in the widget settings before searching.')
      return
    }

    const requestBody: Record<string, unknown> = {
      limit: Math.max(1, Math.floor(limit || 1))
    }

    if (selectedCollection) {
      requestBody.collections = [selectedCollection]
    }

    const datetime = buildDatetime()
    if (datetime) {
      requestBody.datetime = datetime
    }

    if (useCurrentExtent) {
      const extent = activeJimuMapView?.view?.extent
      if (extent) {
        // Project extent to WGS84 (EPSG:4326) for STAC API compatibility
        let bbox: number[] | undefined
        const srWkid = extent.spatialReference?.wkid
        
        // If already in WGS84, use directly
        if (srWkid === 4326) {
          bbox = [extent.xmin, extent.ymin, extent.xmax, extent.ymax]
        } 
        // If in Web Mercator (3857), apply simple projection
        else if (srWkid === 3857 || srWkid === 102100) {
          const metersPerDegree = 20037508.34 / 180
          bbox = [
            extent.xmin / metersPerDegree,
            Math.atan(Math.exp((extent.ymin / metersPerDegree) * Math.PI / 180)) * 360 / Math.PI - 90,
            extent.xmax / metersPerDegree,
            Math.atan(Math.exp((extent.ymax / metersPerDegree) * Math.PI / 180)) * 360 / Math.PI - 90
          ]
        } 
        else {
          // For other spatial references, attempt to create a projected extent
          // In a production environment, you might want to use a GeometryService
          bbox = [extent.xmin, extent.ymin, extent.xmax, extent.ymax]
        }
        
        if (bbox) {
          requestBody.bbox = clampWgs84Bbox(bbox)
        }
      }
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`STAC search failed with ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as StacFeatureCollection
      const features = Array.isArray(data.features) ? data.features : []

      setResults(features)
      setLastRequestSummary(JSON.stringify(requestBody))
      await updateResultLayer({
        type: 'FeatureCollection',
        features
      })
    } catch (searchError) {
      setResults([])
      cleanupLayer()
      setError(searchError instanceof Error ? searchError.message : 'STAC search failed.')
    } finally {
      setLoading(false)
    }
  }, [activeJimuMapView, buildDatetime, cleanupLayer, limit, stacUrl, selectedCollection, updateResultLayer, useCurrentExtent])

  const zoomToFeature = React.useCallback(async (feature: StacFeature) => {
    const extent = getFeatureExtent(feature)

    if (!activeJimuMapView?.view || !extent) {
      return
    }

    await activeJimuMapView.view.goTo({ target: extent.expand(1.2) })
  }, [activeJimuMapView])

  return (
    <div css={style} className='jimu-widget stac-search-widget'>
      <section className='panel'>
        <div className='panel-header'>
          <h3 className='mb-1'>{props.config.widgetTitle || 'STAC Search'}</h3>
          <div className='muted'>Starter widget using ArcGIS map web components inside Experience Builder.</div>
        </div>

        <div className='panel-body'>
          <div className='search-section'>
            <div className='field-row'>
              <Label>STAC API URL</Label>
              <Select
                value={stacUrl}
                onChange={(event) => { setStacUrl(event.target.value) }}
                disabled={((props.config.stacApiUrls as unknown as string[]) ?? []).length === 0}
              >
                {((props.config.stacApiUrls as unknown as string[]) ?? []).length === 0 && (
                  <option value=''>No URLs configured</option>
                )}
                {((props.config.stacApiUrls as unknown as string[]) ?? []).map((url) => (
                  <option key={url} value={url}>{url}</option>
                ))}
              </Select>
            </div>

            <div className='field-row'>
              <Label>Collections</Label>
              <Select
                value={selectedCollection}
                onChange={(event) => { setSelectedCollection(event.target.value) }}
                disabled={collectionsLoading || collectionOptions.length === 0}
              >
                {collectionOptions.length === 0 && (
                  <option value=''>No collections available</option>
                )}
                {collectionOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {collectionsLoading && <div className='muted'>Loading collections...</div>}
              {collectionsError && <div className='error-state'>{collectionsError}</div>}
            </div>

            <div className='field-row'>
              <Label>Start date</Label>
              <TextInput
                type='date'
                value={startDate}
                onChange={(event) => { setStartDate(event.currentTarget.value) }}
              />
            </div>

            <div className='field-row'>
              <Label>End date</Label>
              <TextInput
                type='date'
                value={endDate}
                onChange={(event) => { setEndDate(event.currentTarget.value) }}
              />
            </div>

            <div className='field-row'>
              <Label>Limit</Label>
              <NumericInput
                min={1}
                max={100}
                value={limit}
                onChange={(value) => { setLimit(Number.isFinite(value) ? value : props.config.defaultLimit ?? 25) }}
              />
            </div>

            <Label className='d-flex align-items-center' style={{ gap: '0.5rem' }}>
              <Checkbox
                checked={useCurrentExtent}
                onChange={(event) => { setUseCurrentExtent(event.target.checked) }}
              />
              Use current map extent as bbox
            </Label>

            <div className='actions'>
              <Button type='primary' onClick={search} disabled={loading}>
                Search STAC
              </Button>
              <Button
                onClick={() => {
                  setResults([])
                  setError('')
                  setLastRequestSummary('')
                  cleanupLayer()
                }}
                disabled={loading && results.length === 0}
              >
                Clear
              </Button>
            </div>

            {loading && <Loading width={24} height={24} />}

            {error && <div className='error-state'>{error}</div>}

            {lastRequestSummary && !error && (
              <div className='muted request-summary'>Request: {lastRequestSummary.split(',').join(', ')}</div>
            )}
          </div>

          <div className='results-section'>
            <div className='results'>
              {results.length === 0 && !loading && !error && (
                <div className='empty-state'>Run a search to load STAC items and draw their footprints on the map.</div>
              )}

              {results.map((feature, index) => {
                const itemLink = getItemLink(feature)
                const title = feature.id || `Item ${index + 1}`
                const cogUrl = getCogUrl(feature)
                const featureId = feature.id ?? cogUrl
                const cogAdded = Boolean(featureId && addedCogIds.has(featureId))

                const thumbnailUrl = getThumbnailUrl(feature)

                return (
                  <article key={`${title}-${index}`} className='result-card'>
                    {thumbnailUrl && (
                      <img
                        src={thumbnailUrl}
                        alt={`Thumbnail for ${title}`}
                        className='result-thumbnail'
                      />
                    )}
                    <div className='result-title'>{title}</div>
                    <div className='muted'>
                      {(feature.collection ?? 'No collection')}
                      {feature.properties?.datetime ? ` | ${feature.properties.datetime}` : ''}
                    </div>
                    <div className='actions'>
                      <Button size='sm' onClick={() => { void zoomToFeature(feature) }} disabled={!feature.bbox}>
                        Zoom to item
                      </Button>
                      {itemLink && (
                        <Button
                          size='sm'
                          onClick={() => { window.open(itemLink, '_blank', 'noopener,noreferrer') }}
                        >
                          Open item
                        </Button>
                      )}
                      {cogUrl && (
                        <Button
                          size='sm'
                          type={cogAdded ? 'default' : 'primary'}
                          disabled={cogAdded || !activeJimuMapView}
                          onClick={() => { addCogToMap(feature) }}
                        >
                          {cogAdded ? 'Added to Map' : 'Add to Map'}
                        </Button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <div className='hidden-map-connector'>
        {props.useMapWidgetIds?.[0] && (
          <JimuMapViewComponent
            useMapWidgetId={props.useMapWidgetIds[0]}
            onActiveViewChange={(jimuMapView) => {
              setActiveJimuMapView(jimuMapView)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Widget