import { transformation } from './classes/transformation';
import { concatenatedOperation } from './classes/concatenated-operation';
import { conversion } from './classes/conversion';
import { verticalCRS, geodeticCRS, projectedCRS, compoundCRS, engineeringCRS } from './classes/crs';
import { verticalDatum, geodeticDatum, engineeringDatum } from './classes/datum';
import { unitOfMeasurement } from './classes/unit-of-measurement';
import { ellipsoid } from './classes/ellipsoid';
import { primeMeridian } from './classes/prime-meridian';
import { coordinateSystemAxis } from './classes/coordinate-sys-axis';
import { coordinateOpMethod } from './classes/coordinate-op-method';
import { coordinateOpParameter } from './classes/coordinate-op-parameter';

import {
  cartesianCoordinateSystem,
  verticalCoordinateSystem,
  ellipsoidalCoordinateSystem,
  sphericalCoordinateSystem,
} from './classes/coordinate-systems';


export const itemClassConfiguration = {
  "coordinate-ops--conversion": conversion,
  "coordinate-ops--transformation": transformation,
  "coordinate-ops--concatenated": concatenatedOperation,
  "datums--engineering": engineeringDatum,
  "datums--geodetic": geodeticDatum,
  "datums--vertical": verticalDatum,
  "crs--compound": compoundCRS,
  "crs--engineering": engineeringCRS,
  "crs--geodetic": geodeticCRS,
  "crs--projected": projectedCRS,
  "crs--vertical": verticalCRS,
  "ellipsoid": ellipsoid,
  "unit-of-measurement": unitOfMeasurement,
  "prime-meridian": primeMeridian,
  "coordinate-sys-axis": coordinateSystemAxis,
  "coordinate-op-method": coordinateOpMethod,
  "coordinate-op-parameter": coordinateOpParameter,
  "coordinate-sys--cartesian": cartesianCoordinateSystem,
  "coordinate-sys--vertical": verticalCoordinateSystem,
  "coordinate-sys--ellipsoidal": ellipsoidalCoordinateSystem,
  "coordinate-sys--spherical": sphericalCoordinateSystem,
} as const;
