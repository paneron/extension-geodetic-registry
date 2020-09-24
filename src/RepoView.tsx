import React from 'react';
import { NonIdealState } from '@blueprintjs/core';
import { RepositoryViewProps } from './types';


export const RepoView: React.FC<RepositoryViewProps> = function () {
  return <NonIdealState
    icon="time"
    title="Check back in a bit!"
    description="Geodetic Registry repository view is coming soon" />;
};
