import React from 'react';
import { RepositoryViewProps } from './types';


export const RepoView: React.FC<RepositoryViewProps> = function ({ title }) {
  return <p>Welcome to {title}</p>;
}
