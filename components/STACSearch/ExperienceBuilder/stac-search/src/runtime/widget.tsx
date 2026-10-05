/** @jsx jsx */
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer'
import ImageryTileLayer from '@arcgis/core/layers/ImageryTileLayer'
import Extent from '@arcgis/core/geometry/Extent'
import SpatialReference from '@arcgis/core/geometry/SpatialReference'
import { CalciteIcon } from 'calcite-components'
import { React, jsx, css, type AllWidgetProps } from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import { Button, Checkbox, Label, Loading, Modal, ModalBody, ModalFooter, ModalHeader, NumericInput, Select, Switch, TextInput } from 'jimu-ui'
import { DownloadOutlined } from 'jimu-icons/outlined/editor/download'
import { normalizeStacApiEntries, type IMConfig, type StacApiEntry } from '../config'

type StacFeature = {
  id?: string
  bbox?: number[]
  geometry?: Record<string, unknown>
  sourceStacApi?: string
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
  bbox?: number[] | number[][]
  geometry?: {
    type?: string
    coordinates?: unknown
  }
  extent?: {
    spatial?: {
      bbox?: number[][]
      geometry?: {
        type?: string
        coordinates?: unknown
      }
    }
  }
}

type StacCollectionsResponse = {
  collections?: StacCollection[]
}

type CollectionOption = {
  id: string
  label: string
}

type CollectionGeometryEntry = {
  id: string
  label: string
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: unknown
  } | null
}

const ANY_COLLECTION_VALUE = 'any'
const ANY_STAC_API_VALUE = '__any_stac_api__'

const normalizeCollectionId = (id?: string): string => (id ?? '').trim()
const normalizeCollectionMatchKey = (value?: string): string => normalizeCollectionId(value).toLowerCase().replace(/\s+/g, ' ')

const resolveCollectionIdFromOptions = (selectedValue: string, options: CollectionOption[]): string => {
  if (selectedValue === ANY_COLLECTION_VALUE) {
    return ANY_COLLECTION_VALUE
  }

  const matchKey = normalizeCollectionMatchKey(selectedValue)
  const matchedOption = options.find((option) => {
    return normalizeCollectionMatchKey(option.id) === matchKey || normalizeCollectionMatchKey(option.label) === matchKey
  })

  return normalizeCollectionId(matchedOption?.id) || normalizeCollectionId(selectedValue)
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

  .request-json {
    margin: 0;
    padding: 0.5rem;
    border: 1px solid var(--sys-color-divider-secondary);
    border-radius: 0.5rem;
    background: var(--sys-color-surface-2);
    max-height: 220px;
    overflow: auto;
    font-size: 0.75rem;
    white-space: pre;
  }

  .results-summary {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .results-summary-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .results-summary-label {
    color: var(--sys-color-text-secondary);
    font-size: 0.875rem;
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
    width: 300px;
  }

  .field-row-inline {
    flex-direction: row;
    align-items: center;
    width: 100%;
  }

  .field-row-inline > label {
    flex-shrink: 0;
  }

  .field-row-inline > *:last-child {
    width: 140px;
    flex: 0 0 140px;
  }

  .field-row-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .cloud-cover-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .cloud-cover-slider {
    flex: 1;
    min-width: 0;
  }

  .cloud-cover-value {
    min-width: 2.5rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .asset-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .asset-select {
    flex: 1;
    min-width: 0;
  }

  .asset-download-button {
    flex-shrink: 0;
  }

  .asset-status {
    font-size: 0.8125rem;
  }

  .asset-status-conflict {
    color: var(--sys-color-warning-dark);
  }

  .item-json-modal .modal-dialog {
    width: min(90vw, 960px);
    max-width: 960px;
  }

  .item-json-modal .modal-content {
    overflow: visible;
  }

  .item-json-modal .modal-body {
    overflow: visible;
  }

  .item-json-modal-surface {
    height: 60vh !important;
    max-height: 60vh !important;
    min-height: 0;
    min-width: 460px;
    width: min(86vw, 900px);
    resize: both;
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  .item-json-modal-surface .request-json {
    max-height: none;
    min-height: 0;
    height: 100%;
    flex: 1 1 auto;
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: auto;
    height: 400px;
    resize: both;
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

type ItemAssetOption = {
  key: string
  label: string
  href: string
  roles?: string[]
}

type AssetLinkProbe = {
  state: 'ok' | 'conflict' | 'error'
  status?: number
}

const getItemAssets = (feature: StacFeature): ItemAssetOption[] => {
  if (!feature.assets) {
    return []
  }

  return Object.entries(feature.assets)
    .map(([key, asset]) => ({
      key,
      label: asset.title?.trim() || key,
      href: asset.href?.trim() || '',
      roles: asset.roles
    }))
    .filter((asset) => Boolean(asset.href))
}

const downloadAsset = (href: string): void => {
  if (!href) {
    return
  }

  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = ''
  anchor.rel = 'noopener noreferrer'
  anchor.target = '_blank'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
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

const isPolygonGeometry = (geometry: StacCollection['geometry']): geometry is { type: 'Polygon' | 'MultiPolygon', coordinates: unknown } => {
  return (geometry?.type === 'Polygon' || geometry?.type === 'MultiPolygon') && Boolean(geometry.coordinates)
}

const getCollectionBbox = (collection: StacCollection): number[] | null => {
  const extractBbox = (bbox: unknown): number[] | null => {
    if (!Array.isArray(bbox) || bbox.length < 4) {
      return null
    }

    if (typeof bbox[0] === 'number') {
      const [xmin, ymin, xmax, ymax] = bbox as number[]
      return [xmin, ymin, xmax, ymax]
    }

    if (Array.isArray(bbox[0])) {
      return extractBbox(bbox[0])
    }

    return null
  }

  return extractBbox(collection.bbox) ?? extractBbox(collection.extent?.spatial?.bbox)
}

const bboxToPolygonGeometry = (bbox: number[]): { type: 'Polygon', coordinates: number[][][] } => {
  const [xmin, ymin, xmax, ymax] = bbox

  return {
    type: 'Polygon',
    coordinates: [[
      [xmin, ymin],
      [xmax, ymin],
      [xmax, ymax],
      [xmin, ymax],
      [xmin, ymin]
    ]]
  }
}

const toCollectionGeometryEntry = (collection: StacCollection): CollectionGeometryEntry | null => {
  const normalizedId = normalizeCollectionId(collection.id)

  if (!normalizedId) {
    return null
  }

  const geometrySource = collection.geometry ?? collection.extent?.spatial?.geometry

  const geometry = isPolygonGeometry(geometrySource)
    ? { type: geometrySource.type, coordinates: geometrySource.coordinates }
    : null

  if (geometry) {
    return {
      id: normalizedId,
      label: collection.title?.trim() || normalizedId,
      geometry
    }
  }

  const bbox = getCollectionBbox(collection)
  if (!bbox) {
    return {
      id: normalizedId,
      label: collection.title?.trim() || normalizedId,
      geometry: null
    }
  }

  return {
    id: normalizedId,
    label: collection.title?.trim() || normalizedId,
    geometry: bboxToPolygonGeometry(bbox)
  }
}

const getFeaturesExtent = (features: StacFeature[]): Extent | null => {
  const extents = features
    .map((feature) => getFeatureExtent(feature))
    .filter((extent): extent is Extent => Boolean(extent))

  if (extents.length === 0) {
    return null
  }

  const [firstExtent, ...remainingExtents] = extents

  return remainingExtents.reduce((combinedExtent, extent) => new Extent({
    xmin: Math.min(combinedExtent.xmin, extent.xmin),
    ymin: Math.min(combinedExtent.ymin, extent.ymin),
    xmax: Math.max(combinedExtent.xmax, extent.xmax),
    ymax: Math.max(combinedExtent.ymax, extent.ymax),
    spatialReference: combinedExtent.spatialReference
  }), firstExtent)
}

const getCoordinatePairs = (value: unknown): number[][] => {
  if (!Array.isArray(value)) {
    return []
  }

  if (
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  ) {
    return [[value[0] as number, value[1] as number]]
  }

  return value.flatMap((child) => getCoordinatePairs(child))
}

const getCollectionGeometryExtent = (geometry: CollectionGeometryEntry['geometry']): Extent | null => {
  if (!geometry) {
    return null
  }

  const coordinatePairs = getCoordinatePairs(geometry.coordinates)
  if (coordinatePairs.length === 0) {
    return null
  }

  const [firstPair, ...remainingPairs] = coordinatePairs
  let xmin = firstPair[0]
  let ymin = firstPair[1]
  let xmax = firstPair[0]
  let ymax = firstPair[1]

  remainingPairs.forEach(([x, y]) => {
    xmin = Math.min(xmin, x)
    ymin = Math.min(ymin, y)
    xmax = Math.max(xmax, x)
    ymax = Math.max(ymax, y)
  })

  return new Extent({
    xmin,
    ymin,
    xmax,
    ymax,
    spatialReference: { wkid: 4326 }
  })
}

const getCollectionEntriesExtent = (entries: CollectionGeometryEntry[]): Extent | null => {
  const extents = entries
    .map((entry) => getCollectionGeometryExtent(entry.geometry))
    .filter((extent): extent is Extent => Boolean(extent))

  if (extents.length === 0) {
    return null
  }

  const [firstExtent, ...remainingExtents] = extents

  return remainingExtents.reduce((combinedExtent, extent) => new Extent({
    xmin: Math.min(combinedExtent.xmin, extent.xmin),
    ymin: Math.min(combinedExtent.ymin, extent.ymin),
    xmax: Math.max(combinedExtent.xmax, extent.xmax),
    ymax: Math.max(combinedExtent.ymax, extent.ymax),
    spatialReference: combinedExtent.spatialReference
  }), firstExtent)
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

const getStacEntryDisplayLabel = (entry: StacApiEntry): string => {
  const label = entry.label?.trim()
  return label || entry.url
}

const appendRequestParameters = (url: string, requestParameters?: string): string => {
  const normalizedParams = (requestParameters ?? '').trim().replace(/^[?&]+/, '')

  if (!normalizedParams) {
    return url
  }

  return `${url}${url.includes('?') ? '&' : '?'}${normalizedParams}`
}

type ResultCardProps = {
  feature: StacFeature
  index: number
  activeJimuMapView: JimuMapView | null
  addedCogIds: Set<string>
  setAddedCogIds: React.Dispatch<React.SetStateAction<Set<string>>>
  zoomToFeature: (feature: StacFeature) => Promise<void>
  addAssetToMap: (asset: ItemAssetOption) => void
}

const ResultCard = ({
  feature,
  index,
  activeJimuMapView,
  addedCogIds,
  setAddedCogIds,
  zoomToFeature,
  addAssetToMap
}: ResultCardProps) => {
  const [selectedAssetHref, setSelectedAssetHref] = React.useState('')
  const [isItemModalOpen, setIsItemModalOpen] = React.useState(false)
  const [itemJsonLoading, setItemJsonLoading] = React.useState(false)
  const [itemJsonError, setItemJsonError] = React.useState('')
  const [itemJsonText, setItemJsonText] = React.useState('')
  const [assetLinkProbeByHref, setAssetLinkProbeByHref] = React.useState<Record<string, AssetLinkProbe>>({})
  const [assetLinkProbeLoading, setAssetLinkProbeLoading] = React.useState(false)

  const itemAssets = React.useMemo(() => getItemAssets(feature), [feature])

  React.useEffect(() => {
    setSelectedAssetHref(itemAssets[0]?.href ?? '')
  }, [itemAssets])

  const selectedAsset = React.useMemo(
    () => itemAssets.find((asset) => asset.href === selectedAssetHref),
    [itemAssets, selectedAssetHref]
  )

  const selectedAssetCanAddToMap = Boolean(
    selectedAsset?.href?.startsWith('https://') &&
    selectedAsset?.roles?.some((role) => role === 'data' || role === 'visual')
  )
  const selectedAssetProbe = selectedAssetHref ? assetLinkProbeByHref[selectedAssetHref] : undefined
  const selectedAssetIsConflict = selectedAssetProbe?.state === 'conflict'
  const selectedAssetAdded = Boolean(selectedAsset?.href && addedCogIds.has(selectedAsset.href))

  const itemLink = getItemLink(feature)
  const title = feature.id || `Item ${index + 1}`
  const modalTitle = title.length > 40 ? `${title.slice(0, 40)}...` : title
  const thumbnailUrl = getThumbnailUrl(feature)

  const closeItemModal = React.useCallback(() => {
    setIsItemModalOpen(false)
  }, [])

  React.useEffect(() => {
    if (!selectedAssetHref || assetLinkProbeByHref[selectedAssetHref]) {
      return
    }

    const controller = new AbortController()

    const probeAssetLink = async (): Promise<void> => {
      setAssetLinkProbeLoading(true)

      try {
        let response = await fetch(selectedAssetHref, {
          method: 'HEAD',
          signal: controller.signal
        })

        if (response.status === 405 || response.status === 501) {
          response = await fetch(selectedAssetHref, {
            method: 'GET',
            headers: {
              Range: 'bytes=0-0'
            },
            signal: controller.signal
          })
        }

        setAssetLinkProbeByHref((prev) => ({
          ...prev,
          [selectedAssetHref]: {
            state: response.status === 409 ? 'conflict' : (response.ok ? 'ok' : 'error'),
            status: response.status
          }
        }))
      } catch {
        if (controller.signal.aborted) {
          return
        }

        setAssetLinkProbeByHref((prev) => ({
          ...prev,
          [selectedAssetHref]: {
            state: 'error'
          }
        }))
      } finally {
        if (!controller.signal.aborted) {
          setAssetLinkProbeLoading(false)
        }
      }
    }

    void probeAssetLink()

    return () => {
      controller.abort()
    }
  }, [assetLinkProbeByHref, selectedAssetHref])

  const openItemModal = React.useCallback(async () => {
    if (!itemLink) {
      return
    }

    setIsItemModalOpen(true)
    setItemJsonLoading(true)
    setItemJsonError('')

    try {
      const response = await fetch(itemLink, {
        headers: {
          Accept: 'application/geo+json, application/json;q=0.9, */*;q=0.8'
        }
      })

      if (!response.ok) {
        throw new Error(`Item request failed with ${response.status} ${response.statusText}`)
      }

      const itemJson = await response.json()
      setItemJsonText(JSON.stringify(itemJson, null, 2))
    } catch (openItemError) {
      setItemJsonText('')
      setItemJsonError(openItemError instanceof Error ? openItemError.message : 'Unable to load item JSON.')
    } finally {
      setItemJsonLoading(false)
    }
  }, [itemLink])

  return (
    <article key={`${title}-${index}`} className='result-card'>
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt={`Thumbnail for ${title.length > 20 ? `${title.slice(0, 20)}...` : title}`}
          className='result-thumbnail'
        />
      )}
      <div className='result-title'>{title}</div>
      <div className='muted'>
        {(feature.collection ?? 'No collection')} | {(feature.sourceStacApi ?? 'Unknown STAC API')}
        {feature.properties?.datetime ? ` | ${feature.properties.datetime}` : ''}
      </div>
      {itemAssets.length > 0 && (
        <div className='field-row'>
          <Label>Item assets</Label>
          <div className='asset-row'>
            <Select
              className='asset-select'
              value={selectedAssetHref}
              onChange={(event) => { setSelectedAssetHref(event.target.value) }}
            >
              {itemAssets.map((asset) => (
                <option key={asset.key} value={asset.href}>
                  {asset.label}
                </option>
              ))}
            </Select>
            <Button
              className='asset-add-button'
              icon={true}
              size='sm'
              type='tertiary'
              title={selectedAssetIsConflict ? 'Selected asset is locked (HTTP 409)' : 'Add selected asset to map'}
              disabled={!selectedAssetHref || !selectedAssetCanAddToMap || selectedAssetAdded || !activeJimuMapView || selectedAssetIsConflict}
              onClick={() => {
                if (selectedAsset) {
                  addAssetToMap(selectedAsset)
                }
              }}
            >
              <CalciteIcon
                icon={selectedAssetIsConflict ? 'lock' : 'image-plus'}
                scale='s'
                textLabel={selectedAssetIsConflict ? 'Selected asset is locked' : 'Add selected asset to map'}
              />
            </Button>
            <Button
              className='asset-download-button'
              icon={true}
              size='sm'
              type='tertiary'
              title='Download selected asset'
              disabled={!selectedAssetHref || selectedAssetIsConflict}
              onClick={() => { downloadAsset(selectedAssetHref) }}
            >
              <DownloadOutlined />
            </Button>
          </div>
          <div className={`asset-status muted${selectedAssetIsConflict ? ' asset-status-conflict' : ''}`}>
            {assetLinkProbeLoading && selectedAssetHref ? 'Checking selected asset URL...' : ''}
            {!assetLinkProbeLoading && selectedAssetProbe?.state === 'error' && selectedAssetProbe.status ? `Selected asset returned HTTP ${selectedAssetProbe.status}.` : ''}
          </div>
        </div>
      )}
      <div className='actions'>
        <Button size='sm' onClick={() => { void zoomToFeature(feature) }} disabled={!feature.bbox}>
          Zoom to item&nbsp;&nbsp;&nbsp;
          <CalciteIcon icon='zoom-to-object' scale='s' textLabel='Zoom to item' />
        </Button>
        {itemLink && (
          <Button
            size='sm'
            onClick={() => { void openItemModal() }}
          >
            Open item&nbsp;&nbsp;&nbsp;
          <CalciteIcon icon='launch' scale='s' textLabel='Open item' />
          </Button>
        )}
      </div>

      <Modal isOpen={isItemModalOpen} toggle={closeItemModal} className='item-json-modal'>
        <ModalHeader title={`Item JSON: ${title}`} toggle={closeItemModal}>{modalTitle}
        </ModalHeader>
        <ModalBody>
          <div className='item-json-modal-surface'>
            {itemJsonLoading && <Loading width={24} height={24} />}
            {!itemJsonLoading && itemJsonError && <div className='error-state'>{itemJsonError}</div>}
            {!itemJsonLoading && !itemJsonError && (
              <pre className='request-json' style={{ height: '60vh' }}>{itemJsonText}</pre>
            )}
          </div>
        </ModalBody>
      </Modal>
    </article>
  )
}

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const [activeJimuMapView, setActiveJimuMapView] = React.useState<JimuMapView | null>(null)
  const layerRef = React.useRef<GeoJSONLayer | null>(null)
  const layerUrlRef = React.useRef<string | null>(null)
  const collectionsLayerRef = React.useRef<GeoJSONLayer | null>(null)
  const collectionsLayerUrlRef = React.useRef<string | null>(null)
  const hasInitializedCollectionZoom = React.useRef(false)

  const configuredStacEntries = React.useMemo(
    () => normalizeStacApiEntries(props.config.stacApiUrls as unknown as Array<string | StacApiEntry>)
      .sort((a, b) => {
        if ((a.priority ?? 4) !== (b.priority ?? 4)) {
          return (a.priority ?? 4) - (b.priority ?? 4)
        }

        return getStacEntryDisplayLabel(a).localeCompare(getStacEntryDisplayLabel(b))
      }),
    [props.config.stacApiUrls]
  )

  const configuredStacUrls = React.useMemo(
    () => configuredStacEntries.map((entry) => entry.url),
    [configuredStacEntries]
  )

  const configuredStacEntryByUrl = React.useMemo(
    () => new Map(configuredStacEntries.map((entry) => [entry.url.replace(/\/$/, ''), entry])),
    [configuredStacEntries]
  )

  const stacEntryLabelByUrl = React.useMemo(
    () => new Map(configuredStacEntries.map((entry) => [entry.url.replace(/\/$/, ''), getStacEntryDisplayLabel(entry)])),
    [configuredStacEntries]
  )

  const stacEntryRequestParametersByUrl = React.useMemo(
    () => new Map(configuredStacEntries.map((entry) => [entry.url.replace(/\/$/, ''), entry.requestParameters?.trim() ?? ''])),
    [configuredStacEntries]
  )

  const [stacUrl, setStacUrl] = React.useState(configuredStacUrls[0] ?? '')
  const [selectedCollection, setSelectedCollection] = React.useState(normalizeCollectionId((props.config.defaultCollections ?? '').split(',')[0]) || ANY_COLLECTION_VALUE)
  const [collectionOptions, setCollectionOptions] = React.useState<CollectionOption[]>([])
  const [collectionGeometryEntries, setCollectionGeometryEntries] = React.useState<CollectionGeometryEntry[]>([])
  const [collectionsLoading, setCollectionsLoading] = React.useState(false)
  const [collectionsError, setCollectionsError] = React.useState('')
  const [startDate, setStartDate] = React.useState('')
  const [endDate, setEndDate] = React.useState('')
  const [includeCloudCoverFilter, setIncludeCloudCoverFilter] = React.useState(false)
  const [cloudCoverMax, setCloudCoverMax] = React.useState(100)
  const [limit, setLimit] = React.useState(props.config.defaultLimit ?? 25)
  const [useCurrentExtent, setUseCurrentExtent] = React.useState(props.config.useCurrentExtent ?? true)
  const [followMe, setFollowMe] = React.useState(false)
  const [results, setResults] = React.useState<StacFeature[]>([])
  const [activeStacFilter, setActiveStacFilter] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [lastRequestSummary, setLastRequestSummary] = React.useState('')
  const [showRequestJson, setShowRequestJson] = React.useState(false)
  const [showCollectionGeometryDebug, setShowCollectionGeometryDebug] = React.useState(false)
  const [addedCogIds, setAddedCogIds] = React.useState<Set<string>>(new Set())
  const followMeSearchTimeoutRef = React.useRef<number | null>(null)

  const resultCountsByStac = React.useMemo(() => {
    const counts = new Map<string, number>()

    results.forEach((feature) => {
      const source = feature.sourceStacApi ?? 'Unknown STAC API'
      counts.set(source, (counts.get(source) ?? 0) + 1)
    })

    return Array.from(counts.entries())
      .map(([stacApi, count]) => {
        const normalizedStacApi = stacApi.replace(/\/$/, '')
        const stacEntry = configuredStacEntryByUrl.get(normalizedStacApi)

        return {
          stacApi,
          label: stacEntry?.label?.trim() || stacEntryLabelByUrl.get(normalizedStacApi) || stacApi,
          priority: stacEntry?.priority ?? 4,
          count
        }
      })
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority
        }

        const titleCompare = a.label.localeCompare(b.label)
        if (titleCompare !== 0) {
          return titleCompare
        }

        return a.stacApi.localeCompare(b.stacApi)
      })
  }, [configuredStacEntryByUrl, results, stacEntryLabelByUrl])

  const displayedResults = React.useMemo(() => {
    if (!activeStacFilter) {
      return results
    }

    return results.filter((feature) => (feature.sourceStacApi ?? 'Unknown STAC API') === activeStacFilter)
  }, [activeStacFilter, results])

  const displayedResultsExtent = React.useMemo(
    () => getFeaturesExtent(displayedResults),
    [displayedResults]
  )

  const selectedCollectionGeometryEntries = React.useMemo(() => {
    const resolvedCollectionId = resolveCollectionIdFromOptions(selectedCollection, collectionOptions)

    if (resolvedCollectionId === ANY_COLLECTION_VALUE) {
      return collectionGeometryEntries
    }

    return collectionGeometryEntries.filter((entry) => entry.id === resolvedCollectionId)
  }, [collectionGeometryEntries, collectionOptions, selectedCollection])

  const selectedCollectionGeometryCount = React.useMemo(
    () => selectedCollectionGeometryEntries.filter((entry) => Boolean(entry.geometry)).length,
    [selectedCollectionGeometryEntries]
  )

  const formattedRequestJson = React.useMemo(() => {
    if (!lastRequestSummary) {
      return ''
    }

    try {
      return JSON.stringify(JSON.parse(lastRequestSummary), null, 2)
    } catch {
      return lastRequestSummary
    }
  }, [lastRequestSummary])

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

  const cleanupCollectionsLayer = React.useCallback(() => {
    if (activeJimuMapView?.view?.map && collectionsLayerRef.current) {
      activeJimuMapView.view.map.remove(collectionsLayerRef.current)
    }

    if (collectionsLayerUrlRef.current) {
      URL.revokeObjectURL(collectionsLayerUrlRef.current)
    }

    collectionsLayerRef.current = null
    collectionsLayerUrlRef.current = null
  }, [activeJimuMapView])

  React.useEffect(() => {
    return () => {
      cleanupLayer()
      cleanupCollectionsLayer()
    }
  }, [cleanupCollectionsLayer, cleanupLayer])

  React.useEffect(() => {
    // Sync selected STAC URL when the configured list changes
    setStacUrl((prev) => {
      if (prev === ANY_STAC_API_VALUE && configuredStacUrls.length > 0) {
        return prev
      }

      if (configuredStacUrls.includes(prev)) {
        return prev
      }

      return configuredStacUrls[0] ?? ''
    })
  }, [configuredStacUrls])

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
    if (!activeJimuMapView?.view?.map || !collectionsLayerRef.current) {
      return
    }

    const existsInMap = activeJimuMapView.view.map.layers.includes(collectionsLayerRef.current)
    if (!existsInMap) {
      activeJimuMapView.view.map.add(collectionsLayerRef.current)
    }
  }, [activeJimuMapView])

  React.useEffect(() => {
    const loadCollections = async (): Promise<void> => {
      const baseUrl = (stacUrl ?? '').trim().replace(/\/$/, '')

      if (stacUrl === ANY_STAC_API_VALUE) {
        setCollectionOptions([
          {
            id: ANY_COLLECTION_VALUE,
            label: 'any'
          }
        ])
        setCollectionGeometryEntries([])
        setSelectedCollection(ANY_COLLECTION_VALUE)
        setCollectionsLoading(false)
        setCollectionsError('')
        return
      }

      if (!baseUrl) {
        setCollectionOptions([])
        setCollectionGeometryEntries([])
        setCollectionsError('')
        return
      }

      setCollectionGeometryEntries([])
      setCollectionsLoading(true)
      setCollectionsError('')

      try {
        const collectionsUrl = appendRequestParameters(
          `${baseUrl}/collections`,
          stacEntryRequestParametersByUrl.get(baseUrl)
        )

        const response = await fetch(collectionsUrl)

        if (!response.ok) {
          throw new Error(`Collections request failed with ${response.status} ${response.statusText}`)
        }

        const data = await response.json() as StacCollectionsResponse
        const sortedCollectionOptions = (data.collections ?? [])
          .filter((collection) => Boolean(collection.id))
          .map((collection) => ({
            id: normalizeCollectionId(collection.id as string),
            label: (collection.title?.trim() || normalizeCollectionId(collection.id as string)) as string
          }))
          .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))

        const options: CollectionOption[] = [
          {
            id: ANY_COLLECTION_VALUE,
            label: 'any'
          },
          ...sortedCollectionOptions
        ]

        const geometryEntries = (data.collections ?? [])
          .map((collection) => toCollectionGeometryEntry(collection))
          .filter((entry): entry is CollectionGeometryEntry => Boolean(entry))

        setCollectionOptions(options)
        setCollectionGeometryEntries(geometryEntries)

        const resolvedCurrentSelectionId = resolveCollectionIdFromOptions(selectedCollection, options)
        const hasCurrentSelection = options.some((option) => option.id === resolvedCurrentSelectionId)
        if (!hasCurrentSelection) {
          const defaultId = normalizeCollectionId((props.config.defaultCollections ?? '').split(',')[0]) || ANY_COLLECTION_VALUE
          const resolvedDefaultId = resolveCollectionIdFromOptions(defaultId, options)
          const defaultOption = options.find((option) => option.id === resolvedDefaultId)
          setSelectedCollection(defaultOption?.id ?? options[0].id)
        } else if (resolvedCurrentSelectionId !== selectedCollection) {
          setSelectedCollection(resolvedCurrentSelectionId)
        }
      } catch (collectionsFetchError) {
        setCollectionOptions([
          {
            id: ANY_COLLECTION_VALUE,
            label: 'any'
          }
        ])
        setCollectionGeometryEntries([])
        if (!selectedCollection) {
          setSelectedCollection(ANY_COLLECTION_VALUE)
        }
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
  }, [props.config.defaultCollections, stacEntryRequestParametersByUrl, stacUrl])

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
        stac_api: feature.sourceStacApi ?? '',
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
          color: [46, 132, 255, 0.01],
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

  const updateCollectionsLayer = React.useCallback(async (entries: CollectionGeometryEntry[]) => {
    if (!activeJimuMapView?.view?.map) {
      return
    }

    cleanupCollectionsLayer()

    if (entries.length === 0) {
      return
    }

    const features = entries
      .filter((entry) => entry.geometry)
      .map((entry) => ({
        type: 'Feature',
        geometry: entry.geometry,
        properties: {
          id: entry.id,
          title: entry.label
        }
      }))

    if (features.length === 0) {
      return
    }

    const blob = new Blob([
      JSON.stringify({
        type: 'FeatureCollection',
        features
      })
    ], { type: 'application/geo+json' })
    const url = URL.createObjectURL(blob)

    const layer = new GeoJSONLayer({
      url,
      title: 'Collections',
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [255, 165, 0, 0],
          outline: {
            color: [255, 140, 0, 1],
            width: 2
          }
        }
      },
      popupTemplate: {
        title: '{title}',
        content: [{
          type: 'fields',
          fieldInfos: [{ fieldName: 'id', label: 'Collection ID' }]
        }]
      }
    })

    collectionsLayerUrlRef.current = url
    collectionsLayerRef.current = layer
    activeJimuMapView.view.map.add(layer)
  }, [activeJimuMapView, cleanupCollectionsLayer])

  React.useEffect(() => {
    void updateResultLayer({
      type: 'FeatureCollection',
      features: displayedResults
    })
  }, [displayedResults, updateResultLayer])

  React.useEffect(() => {
    const normalizedSelectedCollection = normalizeCollectionId(selectedCollection)
    const nextEntries = selectedCollection === ANY_COLLECTION_VALUE
      ? collectionGeometryEntries
      : collectionGeometryEntries.filter((entry) => entry.id === normalizedSelectedCollection)

    void updateCollectionsLayer(nextEntries)
  }, [collectionGeometryEntries, selectedCollection, updateCollectionsLayer])

  React.useEffect(() => {
    if (!activeJimuMapView?.view) {
      return
    }

    if (!hasInitializedCollectionZoom.current) {
      hasInitializedCollectionZoom.current = true
      return
    }

    const extent = getCollectionEntriesExtent(selectedCollectionGeometryEntries)
    if (!extent) {
      return
    }

    void activeJimuMapView.view.goTo({ target: extent.expand(1.2) })
  }, [activeJimuMapView, selectedCollection, selectedCollectionGeometryEntries])

  const addAssetToMap = React.useCallback((asset: ItemAssetOption) => {
    if (!asset.href?.startsWith('https://') || !asset.roles?.some((role) => role === 'data' || role === 'overview' || role === 'visual') || !activeJimuMapView?.view?.map) {
      return
    }

    const layer = new ImageryTileLayer({
      url: asset.href,
      title: asset.label || 'Asset Layer'
    })

    activeJimuMapView.view.map.add(layer)
    setAddedCogIds((prev) => new Set(prev).add(asset.href))
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
    const selectedStacUrls = stacUrl === ANY_STAC_API_VALUE
      ? configuredStacUrls.map((url) => url.replace(/\/$/, ''))
      : [(stacUrl ?? '').trim().replace(/\/$/, '')].filter(Boolean)

    if (selectedStacUrls.length === 0) {
      setError('Set a STAC API URL in the widget settings before searching.')
      return
    }

    const requestBody: Record<string, unknown> = {
      limit: Math.max(1, Math.floor(limit || 1))
    }

    const resolvedCollectionId = resolveCollectionIdFromOptions(selectedCollection, collectionOptions)

    if (resolvedCollectionId && resolvedCollectionId !== ANY_COLLECTION_VALUE) {
      requestBody.collections = [resolvedCollectionId]
    }

    const datetime = buildDatetime()
    if (datetime) {
      requestBody.datetime = datetime
    }

    if (includeCloudCoverFilter) {
      requestBody.query = {
        'eo:cloud_cover': {
          lte: Math.max(0, Math.min(100, Math.floor(cloudCoverMax)))
        }
      }
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
      const performSearch = async (baseUrl: string): Promise<StacFeature[]> => {
        const requestParameters = stacEntryRequestParametersByUrl.get(baseUrl)
        const searchUrl = appendRequestParameters(`${baseUrl}/search`, requestParameters)
        const fallbackSearchUrl = selectedCollection === ANY_COLLECTION_VALUE && !/\/stac$/i.test(baseUrl)
          ? appendRequestParameters(`${baseUrl}/stac/search`, requestParameters)
          : undefined

        let response = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })

        if (!response.ok && fallbackSearchUrl && (response.status === 404 || response.status === 405)) {
          response = await fetch(fallbackSearchUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          })
        }

        if (!response.ok) {
          throw new Error(`${baseUrl} returned ${response.status} ${response.statusText}`)
        }

        const data = await response.json() as StacFeatureCollection
        const features = Array.isArray(data.features) ? data.features : []
        return features.map((feature) => ({
          ...feature,
          sourceStacApi: baseUrl
        }))
      }

      const searchRuns = await Promise.all(selectedStacUrls.map(async (baseUrl) => {
        try {
          return {
            baseUrl,
            features: await performSearch(baseUrl),
            error: ''
          }
        } catch (runError) {
          return {
            baseUrl,
            features: [] as StacFeature[],
            error: runError instanceof Error ? runError.message : `Search failed for ${baseUrl}`
          }
        }
      }))

      const features = searchRuns.flatMap((run) => run.features)
      const failedRuns = searchRuns.filter((run) => run.error)

      if (features.length === 0) {
        throw new Error(failedRuns[0]?.error || 'STAC search failed.')
      }

      if (failedRuns.length > 0) {
        setError(`Some STAC APIs failed...`)
      }

      setResults(features)
      setActiveStacFilter('')
      setLastRequestSummary(JSON.stringify({ ...requestBody, stacApis: selectedStacUrls }))
    } catch (searchError) {
      setResults([])
      cleanupLayer()
      setError(searchError instanceof Error ? searchError.message : 'STAC search failed.')
    } finally {
      setLoading(false)
    }
  }, [activeJimuMapView, buildDatetime, cleanupLayer, collectionOptions, configuredStacUrls, cloudCoverMax, includeCloudCoverFilter, limit, stacEntryRequestParametersByUrl, stacUrl, selectedCollection, useCurrentExtent])

  React.useEffect(() => {
    if (!followMe || !activeJimuMapView?.view) {
      return
    }

    const view = activeJimuMapView.view
    const extentWatchHandle = view.watch('extent', () => {
      if (followMeSearchTimeoutRef.current !== null) {
        window.clearTimeout(followMeSearchTimeoutRef.current)
      }

      followMeSearchTimeoutRef.current = window.setTimeout(() => {
        void search()
      }, 400)
    })

    return () => {
      extentWatchHandle.remove()

      if (followMeSearchTimeoutRef.current !== null) {
        window.clearTimeout(followMeSearchTimeoutRef.current)
        followMeSearchTimeoutRef.current = null
      }
    }
  }, [activeJimuMapView, followMe, search])

  const clearResults = React.useCallback(() => {
    setResults([])
    setActiveStacFilter('')
    setError('')
    setLastRequestSummary('')
    setShowRequestJson(false)
    setShowCollectionGeometryDebug(false)
    void updateResultLayer({
      type: 'FeatureCollection',
      features: []
    })
  }, [updateResultLayer])

  const zoomToFeature = React.useCallback(async (feature: StacFeature) => {
    const extent = getFeatureExtent(feature)

    if (!activeJimuMapView?.view || !extent) {
      return
    }

    await activeJimuMapView.view.goTo({ target: extent.expand(1.2) })
  }, [activeJimuMapView])

  const zoomToDisplayedResults = React.useCallback(async () => {
    if (!activeJimuMapView?.view || !displayedResultsExtent) {
      return
    }

    await activeJimuMapView.view.goTo({ target: displayedResultsExtent.expand(1.2) })
  }, [activeJimuMapView, displayedResultsExtent])

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
                onChange={(event) => {
                  const nextStacUrl = event.target.value
                  setStacUrl(nextStacUrl)
                  if (nextStacUrl === ANY_STAC_API_VALUE) {
                    setSelectedCollection(ANY_COLLECTION_VALUE)
                  }
                }}
                disabled={configuredStacUrls.length === 0}
              >
                {configuredStacUrls.length === 0 && (
                  <option value=''>No URLs configured</option>
                )}
                {configuredStacUrls.length > 0 && (
                  <option value={ANY_STAC_API_VALUE}>Any</option>
                )}
                {configuredStacEntries.map((entry) => (
                  <option key={entry.url} value={entry.url}>{getStacEntryDisplayLabel(entry)}</option>
                ))}
              </Select>
            </div>

            <div className='field-row'>
              <Label>Collections</Label>
              <Select
                value={selectedCollection}
                onChange={(event) => { setSelectedCollection(normalizeCollectionId(event.target.value) || ANY_COLLECTION_VALUE) }}
                disabled={stacUrl === ANY_STAC_API_VALUE || collectionsLoading || collectionOptions.length === 0}
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

            <div className='field-row field-row-inline'>
              <Label>Start date</Label>
              <TextInput
                type='date'
                value={startDate}
                onChange={(event) => { setStartDate(event.currentTarget.value) }}
              />
            </div>

            <div className='field-row field-row-inline'>
              <Label>End date</Label>
              <TextInput
                type='date'
                value={endDate}
                onChange={(event) => { setEndDate(event.currentTarget.value) }}
              />
            </div>

            <div className='field-row'>
              <div className='field-row-header'>
                <Label>Cloud Cover</Label>
                <Label className='d-flex align-items-center' style={{ gap: '0.5rem' }}>
                  <Switch
                    checked={includeCloudCoverFilter}
                    onChange={(event) => { setIncludeCloudCoverFilter(event.target.checked) }}
                  />
                  <span className='muted'>Include filter</span>
                </Label>
              </div>
              <div className='cloud-cover-row'>
                <input
                  className='cloud-cover-slider'
                  type='range'
                  min='0'
                  max='100'
                  step='1'
                  value={cloudCoverMax}
                  disabled={!includeCloudCoverFilter}
                  onChange={(event) => { setCloudCoverMax(Number(event.currentTarget.value)) }}
                />
                <span className='cloud-cover-value'>{cloudCoverMax}</span>
              </div>
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
                onChange={(event) => {
                  const checked = event.target.checked
                  setUseCurrentExtent(checked)

                  if (!checked) {
                    setFollowMe(false)
                  }
                }}
              />
              Use current map extent as bbox
            </Label>

            <Label className='d-flex align-items-center' style={{ gap: '0.5rem' }}>
              <Switch
                checked={followMe}
                onChange={(event) => {
                  const checked = event.target.checked
                  setFollowMe(checked)

                  if (checked) {
                    setUseCurrentExtent(true)
                  }
                }}
              />
              Follow me
            </Label>

            <div className='actions'>
              <Button type='primary' onClick={search} disabled={loading}>
                Search STAC
              </Button>
              <Button
                onClick={clearResults}
                disabled={loading && results.length === 0}
              >
                Clear
              </Button>
            </div>

            {loading && <Loading width={24} height={24} />}

            {error && <div className='error-state'>{error}</div>}

            {lastRequestSummary && !error && (
              <div className='field-row'>
                <Label className='d-flex align-items-center justify-content-between w-100'>
                  <span className='muted'>Show request JSON</span>
                  <Switch
                    checked={showRequestJson}
                    onChange={(event) => { setShowRequestJson(event.target.checked) }}
                  />
                </Label>
                {showRequestJson && (
                  <pre className='request-json'>{formattedRequestJson}</pre>
                )}
                {!showRequestJson && (
                  <div className='muted request-summary'>Request ready. Toggle to view JSON.</div>
                )}

                <Label className='d-flex align-items-center justify-content-between w-100'>
                  <span className='muted'>Show collection geometry debug</span>
                  <Switch
                    checked={showCollectionGeometryDebug}
                    onChange={(event) => { setShowCollectionGeometryDebug(event.target.checked) }}
                  />
                </Label>
                {showCollectionGeometryDebug && (
                  <pre className='request-json'>{JSON.stringify({
                    selectedCollection,
                    selectedCollectionCount: selectedCollectionGeometryEntries.length,
                    selectedCollectionGeometryCount,
                    loadedCollectionCount: collectionOptions.length,
                    loadedCollectionGeometryCount: collectionGeometryEntries.filter((entry) => Boolean(entry.geometry)).length,
                    stacUrl
                  }, null, 2)}</pre>
                )}
              </div>
            )}
          </div>

          <div className='results-section'>
            {resultCountsByStac.length > 0 && (
              <div className='results-summary'>
                <div className='results-summary-row'>
                  <Button
                    size='sm'
                    onClick={() => { void zoomToDisplayedResults() }}
                    disabled={!activeJimuMapView?.view || !displayedResultsExtent}
                  >
                    Zoom to results
                  </Button>
                </div>
                <div className='results-summary-row'>
                  <span className='results-summary-label'>Results by STAC:</span>
                  {resultCountsByStac.map(({ stacApi, label, priority, count }) => {
                    const isActive = activeStacFilter === stacApi

                    return (
                      <Button
                        key={stacApi}
                        size='sm'
                        type={isActive ? 'primary' : 'default'}
                        onClick={() => {
                          setActiveStacFilter((prev) => (prev === stacApi ? '' : stacApi))
                        }}
                      >
                        {`${priority}: ${label}: ${count}`}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}
            <div className='results'>
              {displayedResults.length === 0 && !loading && !error && (
                <div className='empty-state'>Run a search to load STAC items and draw their footprints on the map.</div>
              )}

              {displayedResults.map((feature, index) => {
                return (
                  <ResultCard
                    key={`${feature.id || index}-${index}`}
                    feature={feature}
                    index={index}
                    activeJimuMapView={activeJimuMapView}
                    addedCogIds={addedCogIds}
                    setAddedCogIds={setAddedCogIds}
                    zoomToFeature={zoomToFeature}
                    addAssetToMap={addAssetToMap}
                  />
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


