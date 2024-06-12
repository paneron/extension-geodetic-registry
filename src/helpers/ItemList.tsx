/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { type Spec } from 'immutability-helper';
import { jsx, css } from '@emotion/react';
import React from 'react';

import {
  Button,
  ButtonGroup,
  Callout,
  OL,
  UL,
} from '@blueprintjs/core';

import { PropertyDetailView } from '@riboseinc/paneron-registry-kit';


interface ItemListProps<T> {
  items: Readonly<T[]>

  /** Singular item label, lowercase. */
  itemLabel: string

  /** Plural item label, lowercase. */
  itemLabelPlural?: string

  /** Same as for BP’s FormGroup. */
  helperText?: React.ReactNode

  /** Same as for BP’s FormGroup. */
  subLabel?: React.ReactNode

  /** When items are simple, ideally one property. */
  simpleItems?: boolean

  maxItems?: number
  minItems?: number

  /** The list is still ordered, but numbers won’t be shown. */
  hideOrdinals?: boolean

  /** Renders any given item. */
  itemRenderer: (
    /** Item data. */
    item: T,
    /** Item index in the list. */
    idx: number,
    handleChange: ((spec: Spec<T>) => void) | undefined,
    deleteButton: JSX.Element | undefined,
  ) => JSX.Element

  /** Required for being able to either remove, edit or create new items. */
  onChangeItems?: (spec: Spec<Readonly<T[]>>) => void

  /** Required for being able to create new items. */
  placeholderItem?: T | (() => T) | (() => Promise<T>)
}

/**
 * A wrapper for handling an ordered, optionally editable, list of items.
 * Not suitable for large or unbounded lists (it’s not windowed).
 */
export function ItemList<T> ({
  items,
  itemLabel,
  itemLabelPlural,
  helperText,
  subLabel,
  itemRenderer,
  onChangeItems,
  simpleItems,
  maxItems,
  minItems,
  placeholderItem,
  hideOrdinals,
}: ItemListProps<T>): JSX.Element {
  const itemViews = React.useMemo((() =>
    items.map((item, idx) =>
      <li key={idx}>
        {itemRenderer(
          item,
          idx,
          onChangeItems
            ? ((spec) => onChangeItems({ [idx]: spec }))
            : undefined,
          onChangeItems
            ? <Button
                outlined
                icon="remove"
                intent="danger"
                title={`Delete ${itemLabel} ${idx + 1}`}
                disabled={!onChangeItems}
                onClick={() => onChangeItems!({ $splice: [[ idx, 1 ]] })}
                text={simpleItems ? undefined : `Delete this ${itemLabel}`}
              />
            : undefined,
        )}
      </li>
    )
  ), [items.length, items.map(i => JSON.stringify(i)).toString(), itemRenderer, onChangeItems]);

  const pluralLabel = itemLabelPlural || `${itemLabel} items`;
  const countSummary = items.length > 0
    ? <>({items.length} total)</>
    : <>(no items to show)</>;

  const handleAddNew = React.useMemo(() => (
    placeholderItem !== undefined && onChangeItems
      ? async function handleAddNewItem() {
          const newItem: T = typeof placeholderItem === 'function'
            ? await (placeholderItem as (() => T) | (() => Promise<T>))()
            : placeholderItem;
          if (newItem !== undefined) {
            onChangeItems({ $push: [newItem] });
          }
        }
      : null
  ), [onChangeItems, placeholderItem]);

  const addButton = React.useMemo(() => (
    handleAddNew
      ? <Button
            outlined
            icon="add"
            intent="primary"
            onClick={handleAddNew}>
          Add {itemLabel}
        </Button>
      : null
  ), [handleAddNew, itemLabel]);

  const deleteAllButton = React.useMemo(() => (
    onChangeItems && items.length > 1
      ? <Button
            outlined
            icon="remove"
            intent="danger"
            onClick={() => onChangeItems({ $splice: [[0]] })}>
          Delete all {pluralLabel}
        </Button>
      : null
  ), [onChangeItems, pluralLabel, items.length > 1]);

  const countValidity = (maxItems !== undefined && items.length > maxItems)
    ? `Too many ${pluralLabel}: at most ${maxItems} is expected`
    : (minItems !== undefined && items.length < minItems)
      ? `Not enough ${pluralLabel}: at least ${minItems} is expected`
      : '';

  const Tag = hideOrdinals ? UL : OL;

  return (
    <PropertyDetailView
        label={pluralLabel}
        labelInfo={countSummary}
        intent={countValidity ? 'warning' : undefined}
        subLabel={subLabel}
        helperText={helperText || addButton || deleteAllButton || countValidity
          ? <>
              {helperText}
              {countValidity && onChangeItems
                ? <Callout intent="warning" css={css`margin-top: 10px;`}>{countValidity}</Callout>
                : null}
              {(addButton || deleteAllButton)
                ? <ButtonGroup css={css`margin-top: ${items.length > 0 ? '10px' : '0'};`}>
                    {addButton}
                    {deleteAllButton}
                  </ButtonGroup>
                : null}
            </>
          : null}>
      {items.length > 0
        ? <Tag css={css`margin-top: 0; padding-left: 1em;`}>
            {itemViews}
          </Tag>
        : null}
    </PropertyDetailView>
  );
}

export default ItemList;
