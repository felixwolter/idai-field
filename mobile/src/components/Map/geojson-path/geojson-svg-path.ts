/**
 *
 * Functions to convert GeoJSON Geometry objects into SVG ( Scalable Vector Graphics) path elements.
 * Only supports iDAI field supported Geometry objects
 * (Polygon, Multipolygon, Linestring, Multilinestring, Point, Multipoint)
 */
import { Position } from 'geojson';

/**
 * PolygonToPath
 * Convert GEOJSON Polygon to path string <Path d=PolygonToPath(pol) />
 * Exterior ring coordinates need to be converted to 'cut' holes in polygon
 * with inner ring coordinates (https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule)
 * @param polygon Polygon coordinates
 * @returns string to be used with SVG path element
 */
export const PolygonToPath = (polygon: Position[][]): string => {
   
    let path = '';
    polygon.forEach((ringCoordinates, i) => {
        path += ' ' + LineStringToPath(i === 0 ? ringCoordinates.slice().reverse() : ringCoordinates);
    });

    return path;
};

export const LineStringToPath = (lineString: Position[]): string => {

    let path = `M${lineString[0][0]} ${lineString[0][1]}`;
    for(let i = 1; i < lineString.length; i++)
        path += ` L${lineString[i][0]} ${lineString[i][1]}`;

    return path;

};
