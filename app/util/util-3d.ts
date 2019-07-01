import * as THREE from 'three';
import {FieldDocument} from 'idai-components-2';


/**
 * @author Thomas Kleinke
 */

export const has3DPointGeometry = (document: FieldDocument): boolean => {

    return document.resource.geometry != undefined &&
        document.resource.geometry.type == 'Point' &&
        document.resource.geometry.coordinates != undefined &&
        document.resource.geometry.coordinates.length == 3;
};


export const has3DLineGeometry = (document: FieldDocument): boolean => {

    return document.resource.geometry != undefined &&
        document.resource.geometry.type == 'LineString' &&
        document.resource.geometry.coordinates != undefined &&
        !document.resource.geometry.coordinates.find(point => point.length != 3);
};


export const has3DPolygonGeometry = (document: FieldDocument): boolean => {

    return document.resource.geometry != undefined &&
        document.resource.geometry.type == 'Polygon' &&
        document.resource.geometry.coordinates != undefined &&
        !document.resource.geometry.coordinates
            .find(path => path.find((point: number[]) => point.length != 3));
};


export const getPointVector = (coordinates: number[]): THREE.Vector3 => {

    return new THREE.Vector3(coordinates[0], coordinates[2], -coordinates[1]);
};