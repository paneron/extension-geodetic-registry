/** @jsx jsx */
/** @jsxFrag React.Fragment */
/**
 * Information source items (a.k.a. citations).
 *
 * Originally, citations were a common structure, but not expressed
 * as a separate register item class.
 */

import update, { type Spec } from 'immutability-helper';
import { jsx } from '@emotion/react';
import React from 'react';
import {
  InputGroup,
} from '@blueprintjs/core';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit';

import ItemList from '../helpers/ItemList';

import type {
  ItemClassConfiguration,
  ItemListView,
  Citation,
} from '@riboseinc/paneron-registry-kit/types';

import {
  type CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  COMMON_PROPERTIES,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
} from './common';


//type InformationSource = Citation;


export interface InformationSourceItemData extends CommonGRItemData {
  citation: Citation
}


function isCitation(val: any): val is Citation {
  return (
    val
    && typeof val.title === 'string'
    // TBD
  );
}


export const CitationEdit: React.FC<{
  citation: Citation
  onChange?: (newCitation: Citation) => void
}> = function ({ citation, onChange }) {

  function getChangeHandler
  <F extends keyof Omit<Citation, 'alternateTitles'>>
  (field: F, emptyValue?: '' | null | 'unset' | 'undefined'):
  undefined | ((val: Citation[F]) => void) {
    const empty = emptyValue === undefined
      ? ''
      : emptyValue === 'undefined'
        ? undefined
        : emptyValue;
    return onChange
      ? (val) => {
          let newCitation: Citation;
          if ((val as string)?.trim() === '') {
            if (empty === 'unset') {
              newCitation = update(citation, { $unset: [field] });
            } else {
              //console.debug("Setting to empty", empty);
              newCitation = update(citation, { [field]: { $set: empty } });
            }
          } else {
            newCitation = update(citation, { [field]: { $set: val } });
          }
          return onChange!(newCitation);
        }
      : undefined;
  }
  const getOnChange = React.useCallback(getChangeHandler, [onChange, citation]);

  if (!isCitation(citation)) {
    throw new Error("Item given to CitationEdit is not a citation");
  }
  return (
    <>
      <SimpleField label="Title" val={citation.title} onChange={getOnChange('title')} />
      <ItemList<string>
        items={citation.alternateTitles ?? []}
        hideOrdinals
        simpleItems
        itemLabel="alternate title"
        itemLabelPlural="alternate titles"
        onChangeItems={onChange
          ? (spec) => {

              // Ensure alternateTitles is a list
              // (schema allows it to be undefined, which may cause
              // update() to silently fail without even an error)
              citation.alternateTitles ??= [];

              return onChange!(update(
                citation,
                { alternateTitles: spec as Spec<string[] | undefined, never> }
              ));

            }
          : undefined}
        placeholderItem=""
        itemRenderer={(title, idx, handleChange, deleteButton) =>
          <InputGroup
            key={idx}
            fill
            required
            value={title}
            readOnly={!handleChange}
            rightElement={deleteButton}
            onChange={(evt) => handleChange!({ $set: evt.currentTarget.value })}
          />
        }
      />
      <SimpleField label="Author" val={citation.author} onChange={getOnChange('author', 'unset')} />
      <SimpleField label="Publisher" val={citation.publisher} onChange={getOnChange('publisher', 'unset')} />
      <SimpleField label="Publication Date" val={citation.publicationDate} onChange={getOnChange('publicationDate', 'unset')} />
      <SimpleField label="Revision Date" val={citation.revisionDate} onChange={getOnChange('revisionDate', 'unset')} />
      <SimpleField label="Name of Series/Journal/Periodical" val={citation.seriesName ?? ''} onChange={getOnChange('seriesName', null)} />
      <SimpleField label="Series Issue ID" val={citation.seriesIssueID ?? ''} onChange={getOnChange('seriesIssueID', null)} />
      <SimpleField label="Series Page" val={citation.seriesPage ?? ''} onChange={getOnChange('seriesPage', null)} />
      <SimpleField label="Edition" val={citation.edition ?? ''} onChange={getOnChange('edition', null)} />
      <SimpleField label="Edition Date" val={citation.editionDate ?? ''} onChange={getOnChange('editionDate', null)} />
      <SimpleField label="Other Details" val={citation.otherDetails ?? ''} onChange={getOnChange('otherDetails')} />
      <SimpleField label="URI" val={citation.uri ?? ''} onChange={getOnChange('uri', 'unset')} />
      <SimpleField label="DOI" val={citation.doi ?? ''} onChange={getOnChange('doi', 'unset')} />
    </>
  );
};


export const DEFAULTS: Readonly<InformationSourceItemData> = Object.freeze({
  name: "Untitled information source",

  // Non-positive identifiers are replaced with next available positive integers
  // in afterApprovedCR hook.
  identifier: 0,

  // Awkward
  informationSources: [],
  informationSourceRefs: [],

  remarks: '',
  aliases: [],

  citation: getInformationSourceStub(),
});


export function getInformationSourceStub(): Readonly<Citation> {
  return {
    title: "Untitled source",
    revisionDate: null,
    publicationDate: null,
    seriesIssueID: null,
    seriesName: null,
    seriesPage: null,
    edition: null,
    editionDate: null,
    otherDetails: '',
    isbn: null,
    issn: null,
  } as const;
}

export const informationSource: ItemClassConfiguration<InformationSourceItemData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Information Source (test)",
    description: "A citation.",
    id: 'information-source',
    alternativeNames: [] as const,
  },
  defaults: {
    ...SHARED_DEFAULTS,
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<InformationSourceItemData>,
    editView: (props) => (
      <CommonEditView
          useRegisterItemData={props.useRegisterItemData}
          getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
          itemData={props.itemData}
          itemRef={props.itemRef}
          hideRemarks hideAliases hideInfoSources
          onChange={props.onChange ? (newData: CommonGRItemData) => {
            if (!props.onChange) { return; }
            props.onChange({ ...props.itemData, ...newData });
          } : undefined}>

        <CitationEdit
          citation={props.itemData.citation}
          onChange={props.onChange
            ? (item) => props.onChange!(update(props.itemData, { citation: { $set: item } }))
            : undefined}
        />

        {props.children}

      </CommonEditView>
    ),
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};


const SimpleField: React.FC<{ val: string | undefined | null, label: string, onChange?: (newVal: string) => void }> =
function ({ val, label, onChange }) {
  return (
    <PropertyDetailView title={label}>
      <InputGroup
        title={val ?? `No ${label}`}
        readOnly={!onChange}
        value={val ?? ''}
        onChange={(evt: React.FormEvent<HTMLInputElement>) => onChange!(evt.currentTarget.value)}
      />
    </PropertyDetailView>
  );
};
