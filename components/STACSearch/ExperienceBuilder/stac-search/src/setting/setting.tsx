/** @jsx jsx */
import { React, jsx, css } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { TextInput, NumericInput, Switch, Label, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'jimu-ui'
import { SettingSection, SettingRow, MapWidgetSelector } from 'jimu-ui/advanced/setting-components'
import { CalciteIcon } from 'calcite-components'
import { normalizeStacApiEntries, normalizeStacApiPriority, type IMConfig, type StacApiEntry } from '../config'

const urlListStyle = css`
  .url-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .url-entry {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    border: 1px solid var(--ref-palette-neutral-300);
    border-radius: 0.5rem;
    background: var(--ref-palette-neutral-100);
  }

  .url-entry-fields {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .url-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .url-field-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--sys-color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .url-entry-fields input {
    min-width: 0;
  }

  .url-list-actions {
    display: flex;
    justify-content: flex-end;
  }

  .url-entry-actions {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .stac-modal .modal-dialog {
    max-width: 420px;
  }

  .url-modal-fields {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
`

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [newUrl, setNewUrl] = React.useState('')
  const [newLabel, setNewLabel] = React.useState('')
  const [newPriority, setNewPriority] = React.useState(4)
  const [newRequestParameters, setNewRequestParameters] = React.useState('')
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null)

  const closeAddModal = React.useCallback(() => {
    setIsAddModalOpen(false)
    setNewUrl('')
    setNewLabel('')
    setNewPriority(4)
    setNewRequestParameters('')
    setEditingIndex(null)
  }, [])

  const updateConfig = React.useCallback((field: string, value: string | number | boolean | StacApiEntry[]) => {
    props.onSettingChange({
      id: props.id,
      config: props.config.set(field, value)
    })
  }, [props])

  const stacEntries = React.useMemo(
    () => normalizeStacApiEntries(props.config.stacApiUrls as unknown as Array<string | StacApiEntry>),
    [props.config.stacApiUrls]
  )

  const updateEntries = React.useCallback((entries: StacApiEntry[]) => {
    updateConfig('stacApiUrls', entries)
  }, [updateConfig])

  const saveUrl = React.useCallback(() => {
    const trimmed = newUrl.trim()
    if (
      !trimmed ||
      stacEntries.some((entry, index) => entry.url === trimmed && index !== editingIndex)
    ) {
      return
    }

    const nextEntry: StacApiEntry = {
      url: trimmed,
      label: newLabel.trim(),
      priority: normalizeStacApiPriority(newPriority),
      requestParameters: newRequestParameters.trim()
    }

    if (editingIndex === null) {
      updateEntries([
        ...stacEntries,
        nextEntry
      ])
    } else {
      updateEntries(stacEntries.map((entry, index) => {
        if (index !== editingIndex) {
          return entry
        }

        return nextEntry
      }))
    }

    closeAddModal()
  }, [closeAddModal, editingIndex, newLabel, newPriority, newRequestParameters, newUrl, stacEntries, updateEntries])

  const openAddModal = React.useCallback(() => {
    setEditingIndex(null)
    setNewUrl('')
    setNewLabel('')
    setNewPriority(4)
    setNewRequestParameters('')
    setIsAddModalOpen(true)
  }, [])

  const openEditModal = React.useCallback((index: number) => {
    const entry = stacEntries[index]
    if (!entry) {
      return
    }

    setEditingIndex(index)
    setNewUrl(entry.url)
    setNewLabel(entry.label ?? '')
    setNewPriority(entry.priority ?? 4)
    setNewRequestParameters(entry.requestParameters ?? '')
    setIsAddModalOpen(true)
  }, [stacEntries])

  const removeUrl = React.useCallback((index: number) => {
    updateEntries(stacEntries.filter((_, i) => i !== index))
  }, [stacEntries, updateEntries])

  const updateEntry = React.useCallback((index: number, field: keyof StacApiEntry, value: string | number) => {
    const next = stacEntries.map((entry, i) => {
      if (i !== index) {
        return entry
      }

      if (field === 'priority') {
        return {
          ...entry,
          priority: normalizeStacApiPriority(value as number)
        }
      }

      return {
        ...entry,
        [field]: typeof value === 'string' ? value : entry[field]
      }
    })

    updateEntries(next)
  }, [stacEntries, updateEntries])

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
              {stacEntries.map((entry, index) => (
                <div key={index} className='url-entry'>
                  <div className='url-entry-fields'>
                    <div className='url-field'>
                      <span className='url-field-label'>Label</span>
                      <TextInput
                        value={entry.label ?? ''}
                        placeholder='Label'
                        onChange={(event) => { updateEntry(index, 'label', event.currentTarget.value) }}
                      />
                    </div>
                    <div className='url-field'>
                      <span className='url-field-label'>URL</span>
                      <TextInput
                        value={entry.url}
                        placeholder='https://...'
                        onChange={(event) => { updateEntry(index, 'url', event.currentTarget.value) }}
                      />
                    </div>
                    <div className='url-field'>
                      <span className='url-field-label'>Priority</span>
                      <NumericInput
                        min={1}
                        max={4}
                        step={1}
                        value={entry.priority ?? 4}
                        onChange={(value) => { updateEntry(index, 'priority', value ?? 4) }}
                      />
                    </div>
                    <div className='url-field'>
                      <span className='url-field-label'>Request parameters</span>
                      <TextInput
                        value={entry.requestParameters ?? ''}
                        placeholder='thekey=thiskey'
                        onChange={(event) => { updateEntry(index, 'requestParameters', event.currentTarget.value) }}
                      />
                    </div>
                  </div>
                  <div className='url-entry-actions'>
                    <Button
                      size='sm'
                      type='tertiary'
                      icon={true}
                      title='Edit STAC'
                      onClick={() => { openEditModal(index) }}
                    >
                      <CalciteIcon icon='pencil' scale='s' textLabel='Edit STAC' />
                    </Button>
                    <Button
                      size='sm'
                      type='tertiary'
                      onClick={() => { removeUrl(index) }}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className='url-list-actions'>
              <Button size='sm' type='primary' onClick={openAddModal}>
                Add STAC
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

        <Modal isOpen={isAddModalOpen} toggle={closeAddModal} className='stac-modal' backdrop='static'>
          <ModalHeader title={editingIndex === null ? 'Add STAC API' : 'Edit STAC API'} toggle={closeAddModal}>
            {editingIndex === null ? 'Add STAC API' : 'Edit STAC API'}
          </ModalHeader>
          <ModalBody>
            <div className='url-modal-fields'>
              <div className='url-field'>
                <span className='url-field-label'>Label</span>
                <TextInput
                  value={newLabel}
                  placeholder='Label'
                  onChange={(event) => { setNewLabel(event.currentTarget.value) }}
                  onKeyDown={(event) => { if (event.key === 'Enter') { saveUrl() } }}
                />
              </div>
              <div className='url-field'>
                <span className='url-field-label'>URL</span>
                <TextInput
                  value={newUrl}
                  placeholder='https://...'
                  onChange={(event) => { setNewUrl(event.currentTarget.value) }}
                  onKeyDown={(event) => { if (event.key === 'Enter') { saveUrl() } }}
                />
              </div>
              <div className='url-field'>
                <span className='url-field-label'>Priority</span>
                <NumericInput
                  min={1}
                  max={4}
                  step={1}
                  value={newPriority}
                  onChange={(value) => { setNewPriority(normalizeStacApiPriority(value ?? 4)) }}
                />
              </div>
              <div className='url-field'>
                <span className='url-field-label'>Request parameters</span>
                <TextInput
                  value={newRequestParameters}
                  placeholder='thekey=thiskey'
                  onChange={(event) => { setNewRequestParameters(event.currentTarget.value) }}
                  onKeyDown={(event) => { if (event.key === 'Enter') { saveUrl() } }}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button size='sm' type='tertiary' onClick={closeAddModal}>
              Cancel
            </Button>
            <Button size='sm' type='primary' onClick={saveUrl} disabled={!newUrl.trim()}>
              {editingIndex === null ? 'Add' : 'Save'}
            </Button>
          </ModalFooter>
        </Modal>
      </SettingSection>
    </div>
  )
}

export default Setting