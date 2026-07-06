/** @jsx jsx */
import { React, jsx, css } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { TextInput, NumericInput, Switch, Label, Button } from 'jimu-ui'
import { SettingSection, SettingRow, MapWidgetSelector } from 'jimu-ui/advanced/setting-components'
import type { IMConfig } from '../config'

const urlListStyle = css`
  .url-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 0.5rem;
  }

  .url-entry {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .url-entry input {
    flex: 1;
    min-width: 0;
  }

  .url-add-row {
    display: flex;
    gap: 0.4rem;
    align-items: center;
  }

  .url-add-row input {
    flex: 1;
    min-width: 0;
  }
`

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
  const [newUrl, setNewUrl] = React.useState('')

  const updateConfig = React.useCallback((field: string, value: string | number | boolean | string[]) => {
    props.onSettingChange({
      id: props.id,
      config: props.config.set(field, value)
    })
  }, [props])

  const urls: string[] = (props.config.stacApiUrls as unknown as string[]) ?? []

  const addUrl = React.useCallback(() => {
    const trimmed = newUrl.trim()
    if (!trimmed || urls.includes(trimmed)) {
      return
    }
    updateConfig('stacApiUrls', [...urls, trimmed])
    setNewUrl('')
  }, [newUrl, updateConfig, urls])

  const removeUrl = React.useCallback((index: number) => {
    updateConfig('stacApiUrls', urls.filter((_, i) => i !== index))
  }, [updateConfig, urls])

  const updateUrl = React.useCallback((index: number, value: string) => {
    const next = urls.map((u, i) => (i === index ? value : u))
    updateConfig('stacApiUrls', next)
  }, [updateConfig, urls])

  return (
    <div css={urlListStyle} className='widget-setting-stac-search p-3'>
      <SettingSection title='STAC Search'>
        <SettingRow label='Map widget'>
         </SettingRow>
         <SettingRow>
          <MapWidgetSelector
            useMapWidgetIds={props.useMapWidgetIds}
            onSelect={(useMapWidgetIds) => {
              props.onSettingChange({
                id: props.id,
                useMapWidgetIds
              })
            }}
          />
        </SettingRow>

        <SettingRow label='Widget title'>
         </SettingRow>
         <SettingRow>
          <TextInput
            value={props.config.widgetTitle ?? ''}
            onChange={(event) => { updateConfig('widgetTitle', event.currentTarget.value) }}
          />
        </SettingRow>

        <SettingRow label='STAC API URLs'>
         </SettingRow>
         <SettingRow>
          <div className='w-100'>
            <div className='url-list'>
              {urls.map((url, index) => (
                <div key={index} className='url-entry'>
                  <TextInput
                    value={url}
                    onChange={(event) => { updateUrl(index, event.currentTarget.value) }}
                  />
                  <Button
                    size='sm'
                    type='tertiary'
                    onClick={() => { removeUrl(index) }}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
            <div className='url-add-row'>
              <TextInput
                value={newUrl}
                placeholder='https://...'
                onChange={(event) => { setNewUrl(event.currentTarget.value) }}
                onKeyDown={(event) => { if (event.key === 'Enter') { addUrl() } }}
              />
              <Button size='sm' onClick={addUrl} disabled={!newUrl.trim()}>
                Add
              </Button>
            </div>
          </div>
        </SettingRow>

        <SettingRow label='Default collections'>
         </SettingRow>
         <SettingRow>
          <TextInput
            value={props.config.defaultCollections ?? ''}
            onChange={(event) => { updateConfig('defaultCollections', event.currentTarget.value) }}
          />
        </SettingRow>

        <SettingRow label='Default limit'>
        </SettingRow>
        <SettingRow>
          <NumericInput
            min={1}
            max={100}
            value={props.config.defaultLimit ?? 25}
            onChange={(value) => { updateConfig('defaultLimit', value) }}
          />
        </SettingRow>

        <SettingRow label='Default extent behavior'>
        </SettingRow>
        <SettingRow>
          <Label className='d-flex align-items-center justify-content-between w-100'>
            <span>Use current extent by default</span>
            <Switch
              checked={props.config.useCurrentExtent ?? true}
              onChange={(event) => { updateConfig('useCurrentExtent', event.target.checked) }}
            />
          </Label>
        </SettingRow>
      </SettingSection>
    </div>
  )
}

export default Setting