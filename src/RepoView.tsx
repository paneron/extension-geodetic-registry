/** @jsx jsx */

import { jsx} from '@emotion/core';

import { RepositoryViewProps } from '@riboseinc/paneron-extension-kit/types';
import { RegistryView } from '@riboseinc/paneron-registry-kit/views';

import { transformation } from './classes/transformation';
import { verticalCRS, geodeticCRS } from './classes/crs';
import { verticalDatum, geodeticDatum } from './classes/datum';
import { unitOfMeasurement } from './classes/unit-of-measurement';
import { ellipsoid } from './classes/ellipsoid';
import { primeMeridian } from './classes/prime-meridian';
import { coordinateSystemAxis } from './classes/coordinate-sys-axis';
import { coordinateOpMethod } from './classes/coordinate-op-method';
import { coordinateOpParameter } from './classes/coordinate-op-parameter';

//import {
//  cartesianCoordinateSystem,
//  verticalCoordinateSystem,
//  ellipsoidalCoordinateSystem,
//} from './classes/coordinate-system';


const itemConfig = {
  "coordinate-ops--transformation": transformation,
  "datums--geodetic": geodeticDatum,
  "datums--vertical": verticalDatum,
  "crs--vertical": verticalCRS,
  "crs--geodetic": geodeticCRS,
  "ellipsoid": ellipsoid,
  "unit-of-measurement": unitOfMeasurement,
  "prime-meridian": primeMeridian,
  "coordinate-sys-axis": coordinateSystemAxis,
  "coordinate-op-method": coordinateOpMethod,
  "coordinate-op-parameter": coordinateOpParameter,
  //"coordinate-sys--cartesian": cartesianCoordinateSystem,
  //"coordinate-sys--vertical": verticalCoordinateSystem,
  //"coordinate-sys--ellipsoidal": ellipsoidalCoordinateSystem,
};


export const RepositoryView: React.FC<RepositoryViewProps> =
function (props) {
  return <RegistryView
    {...props}
    itemClassConfiguration={itemConfig}
  />
};
