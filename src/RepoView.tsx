/** @jsx jsx */

import { jsx} from '@emotion/core';

import { RepositoryViewProps } from '@riboseinc/paneron-extension-kit/types';
import { RegistryView } from '@riboseinc/paneron-registry-kit/views';

import { transformation } from './classes/transformation';
import { verticalCRS, geodeticCRS } from './classes/crs';


const itemConfig = {
  "coordinate-ops--transformation": transformation,
  "crs--vertical": verticalCRS,
  "crs--geodetic": geodeticCRS,
};


export const RepositoryView: React.FC<RepositoryViewProps> =
function (props) {
  return <RegistryView
    {...props}
    itemClassConfiguration={itemConfig}
  />
};
