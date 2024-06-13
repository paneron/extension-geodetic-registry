/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { type Spec } from 'immutability-helper';
import { jsx, css } from '@emotion/react';
import React from 'react';

import { Cell, Column, Table2 as Table } from '@blueprintjs/table';
import { Callout, Button, ButtonGroup } from '@blueprintjs/core';

import { PropertyDetailView } from '@riboseinc/paneron-registry-kit';


export type ColumnInfo<T> = {
  [K in keyof T]: {
    title: string
    width: number
    CellRenderer: (props: {
      val: T[K]
      onChange?: (spec: Spec<T[K]>) => void
      item: T
      itemIndex: number
    }) => JSX.Element
  }
}

interface ItemTableProps<T> {
  items: readonly T[];

  /** Singular item label, lowercase. */
  itemLabel: string

  /** Plural item label, lowercase. */
  itemLabelPlural?: string

  /** Same as for BP’s FormGroup. */
  helperText?: React.ReactNode

  /** Same as for BP’s FormGroup. */
  subLabel?: React.ReactNode

  /** Required for being able to either remove, edit or create new items. */
  onChangeItems?: (spec: Spec<Readonly<T[]>>) => void

  maxItems?: number
  minItems?: number

  /**
   * Required for being able to create new items
   * and for calculating things like column numbers.
   */
  placeholderItem: T | (() => T)

  columnInfo: ColumnInfo<T>

  rowHeight?: number

  //CellRenderer: <K extends keyof T>(opts: {
  //  val: T[K]
  //  onClear?: () => void
  //  onChange?: (spec: Spec<T[K]>) => void
  //  item: T
  //}) => JSX.Element
}

export function ItemTable<T> ({
  items,
  itemLabel,
  itemLabelPlural,
  helperText,
  subLabel,
  onChangeItems,
  placeholderItem,

  columnInfo,
  rowHeight,

  maxItems,
  minItems,
}: ItemTableProps<T>) {
  //const placeholder = typeof placeholderItem === 'function'
  //  ? (placeholderItem as () => T)()
  //  : placeholderItem;

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

  const handleItemChange = React.useMemo(() => {
    if (onChangeItems) {
      return (rowIndex: number) =>
        (spec: Spec<T>) =>
          onChangeItems({ [rowIndex]: spec });
    } else {
      return undefined;
    }
  }, [items, onChangeItems]);

  function renderCell
  <F extends keyof T>
  (rowIndex: number, fieldName: F) {
    const item = items[rowIndex];
    const handleChange = handleItemChange?.(rowIndex);
    const CellRenderer = columnInfo[fieldName].CellRenderer
    return (
      <Cell interactive/*={handleChange !== undefined}*/>
        <CellRenderer
          val={item[fieldName]}
          onChange={handleChange
            ? (spec) => handleChange({ [fieldName]: spec } as Spec<T>)
            : undefined}
          item={item}
          itemIndex={rowIndex}
        />
      </Cell>
    );
  };

  const columnInfoEntries = React.useMemo(() => (
    Object.entries(columnInfo).
      map(([key, cfg]) => [key as keyof T, cfg as ColumnInfo<T>[keyof T]] as const)
  ), [columnInfo]);

  const renderers = React.useMemo(() => (
    columnInfoEntries.
      map(([key, ]) => {
        return { [key]: (rowIndex: number) => {
          return renderCell(rowIndex, key);
        } };
      }).
      reduce((prev, curr) =>
        ({ ...prev, ...curr })
      ) as { [K in keyof T]: (rowIndex: number) => JSX.Element }
  ), [columnInfoEntries, handleItemChange, items]);

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

      <Table
          css={css`
            .bp4-input {
              box-shadow: none !important;
            }
            .bp4-table-cell {
              font-size: unset;
              padding: 0 2px;

              display: flex;
              align-items: stretch;
              flex-flow: column nowrap;
              justify-content: center;
            }
            .bp4-table-header {
              display: flex;
              flex-flow: column nowrap;
              justify-content: center;
              align-items: center;
            }
          `}
          numRows={items.length}
          cellRendererDependencies={[
            items,
            onChangeItems !== undefined,
          ]}
          rowHeights={[...new Array(items.length)].map(() => rowHeight ?? 36)}
          columnWidths={columnInfoEntries.map(([, cfg]) => cfg.width)}>

        {columnInfoEntries.map(([key, cfg]) =>
          <Column
            key={key as string}
            name={cfg.title}
            cellRenderer={renderers[key]}
          />
        )}

      </Table>

    </PropertyDetailView>
  );
}

export default ItemTable;
