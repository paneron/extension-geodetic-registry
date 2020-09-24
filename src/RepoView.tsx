import React from 'react';
import { Button } from '@blueprintjs/core';
import { RepositoryViewProps } from './types';


export const RepoView: React.FC<RepositoryViewProps> = function ({ title }) {
  return <Button>Welcome to {title}</Button>;
};
