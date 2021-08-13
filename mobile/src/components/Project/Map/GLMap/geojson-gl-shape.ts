
import { Position } from 'geojson';
import { Document, ProjectConfiguration } from 'idai-field-core';
import { Matrix4 } from 'react-native-redash';
import {
    BufferGeometry, CircleGeometry, Line,
    LineBasicMaterial, Mesh, MeshBasicMaterial, Object3D, Scene, Shape, ShapeGeometry, Vector2
} from 'three';
import { pointRadius, strokeWidth } from './constants';
import { processTransform2d } from './geojson';
import { arrayDim } from './geojson/cs-transform/utils/cs-transform-utils';


interface ShapeFunction<T extends Position | Position[] | Position[][] | Position[][][]> {
    (matrix: Matrix4,scene: Scene, config: ProjectConfiguration, document: Document, coordinates: T): void;
}

export interface ObjectData {
    isSelected: boolean;
}

export enum ObjectChildValues {
    selected = 'selected',
    notSelected = 'notSelected',
}


export const polygonToShape: ShapeFunction<Position[][] | Position[][][]> =
        (matrix, scene, config, document,coordinates) => {
    
    if(!coordinates) return;

    const color = config.getCategory(document.resource.category)?.color || 'black';
    const shapes: Shape[] = [];
    const parent = new Object3D();

    if(isPosition2d(coordinates)) shapes.push(geoJsonPolyToShape(matrix, coordinates));
    else if(isPosition3d(coordinates)) coordinates.forEach(polygon => shapes.push(geoJsonPolyToShape(matrix, polygon)));

    // selected Child
    const material = new MeshBasicMaterial({
        color,
        opacity: 0.6,
    });
    shapes.forEach(shape => {
        const geo = new ShapeGeometry(shape);
        const selected = new Mesh(geo, material);
        selected.name = ObjectChildValues.selected;
        selected.visible = false;
        parent.add(selected);
    });

    // not selected Child
    const notSelectedMaterial = new LineBasicMaterial( { color, linewidth: strokeWidth } );
    shapes.forEach(shape => {
        shape.autoClose = true;
        const points = shape.getPoints();
        const geometryPoints = new BufferGeometry().setFromPoints( points );
        const notSelected = new Line( geometryPoints, notSelectedMaterial);
        notSelected.name = ObjectChildValues.notSelected;
        notSelected.renderOrder = 1;
        parent.add(notSelected);
    });
    
    addObjectInfo(parent,document);
    scene.add(parent);
};


const geoJsonPolyToShape = ( matrix: Matrix4, polygon: Position[][]): Shape => {
    
    const shape = new Shape();
    polygon.forEach((ringCoords, i) => {
        if(i === 0){
            ringCoords.forEach((pos: Position, i: number) => {
                const [x,y] = processTransform2d(matrix,pos);
                if(i === 0) shape.moveTo(x ,y );
                else shape.lineTo(x ,y );
            });
        }

    });
    return shape;
};


export const lineStringToShape:
    ShapeFunction<Position[] | Position[][]> = (matrix, scene, config, document, coordinates) => {

    if(!coordinates) return;

    const parent = new Object3D();
    const color = config.getCategory(document.resource.category)?.color || 'black';
    const geos: BufferGeometry[] = [];

    if(isPosition1d(coordinates)) geos.push(geoJsonLineToShape(matrix,coordinates));
    else coordinates.forEach(lineString => geos.push(geoJsonLineToShape(matrix, lineString)));

    // selected Child
    geos.forEach(geo => {
        const selectedLine = new Line(geo, lineStringMaterial(color, true));
        selectedLine.name = ObjectChildValues.selected;
        selectedLine.visible = false;
        parent.add(selectedLine);
    });

    // not selected Child
    geos.forEach(geo => {
        const notSelectedLine = new Line(geo,lineStringMaterial(color, false));
        notSelectedLine.name = ObjectChildValues.notSelected;
        notSelectedLine.visible = true;
        notSelectedLine.renderOrder = 1;
        parent.add(notSelectedLine);
    });

    addObjectInfo(parent, document);
    scene.add(parent);
};


const geoJsonLineToShape = (matrix: Matrix4, coordinates: Position[]): BufferGeometry => {

    const points: Vector2[] = [];
    coordinates.forEach(point => {
        const [x,y] = processTransform2d(matrix,point);
        points.push(new Vector2(x,y));
    });
    return new BufferGeometry().setFromPoints(points);
};

// eslint-disable-next-line max-len
export const multiPointToShape: ShapeFunction<Position[]> = (matrix, scene, config, document, coordinates) =>
    coordinates.forEach(point => pointToShape(matrix, scene, config, document, point));


export const pointToShape: ShapeFunction<Position> = (matrix, scene, config, document, coordinates): void => {

    if(!coordinates) return;
  
    const [x,y] = processTransform2d(matrix,coordinates);
    const parent = new Object3D();
    const color = config.getCategory(document.resource.category)?.color || 'black';
    const radius = pointRadius;
    const segments = 30; //<-- Increase or decrease for more resolution
    
    const circleGeometry = new CircleGeometry( radius, segments );
    circleGeometry.translate(x ,y ,0);

    // selected Child
    const selectedCircle = new Mesh(circleGeometry, pointMaterial(color, true));
    selectedCircle.name = ObjectChildValues.selected;
    selectedCircle.visible = false;
    parent.add(selectedCircle);

    // not selected Child
    const notSelectedCircle = new Mesh(circleGeometry, pointMaterial(color, false));
    notSelectedCircle.name = ObjectChildValues.notSelected;
    notSelectedCircle.visible = true;
    notSelectedCircle.renderOrder = 1;
    parent.add(notSelectedCircle);

    addObjectInfo(parent, document);
    scene.add(parent);
};


const addObjectInfo = (object: Object3D, doc: Document) => {

    object.name = doc.resource.identifier;
    object.uuid = doc.resource.id;
    const userData: ObjectData = {
        isSelected: false,
    };
    object.userData = userData;
};

const isPosition1d = (coords: Position[] | Position[][]): coords is Position[] => arrayDim(coords) === 2;
const isPosition2d = (coords: Position[][] | Position[][][]): coords is Position[][] => arrayDim(coords) === 3;
const isPosition3d = (coords: Position[][] | Position[][][]): coords is Position[][][] => arrayDim(coords) === 4;


const lineStringMaterial = (color: string, isSelected: boolean = false) =>
    new LineBasicMaterial({ color: color, linewidth: strokeWidth, opacity: isSelected ? 1 : 0.7 });


const pointMaterial = (color: string, isSelected: boolean = false) =>
    new MeshBasicMaterial({ color, opacity: isSelected ? 1 : 0.7 } );