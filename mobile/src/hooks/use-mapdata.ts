import { Document, FieldGeometry, Query } from 'idai-field-core';
import { useCallback, useEffect, useState } from 'react';
import { Matrix4 } from 'react-native-redash';
import { viewBoxPaddingX, viewBoxPaddingY } from '../components/Project/Map/GLMap/constants';
import {
    GeometryBoundings, getGeometryBoundings,
    getMinMaxCoords,
    processTransform2d,
    setupTransformationMatrix, ViewPort
} from '../components/Project/Map/GLMap/geojson';
import { DocumentRepository } from '../repositories/document-repository';

const searchQuery: Query = {
    q: '*',
    constraints: { 'geometry:exist': 'KNOWN' }
};

export interface CameraView {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

type mapDataReturn = [Document[], Matrix4 | undefined, CameraView | undefined, (docId: string) => void];


const useMapData = (
        repository: DocumentRepository,
        viewPort: ViewPort | undefined,
        selectedDocumentIds: string[]): mapDataReturn => {

    const [geoDocuments, setGeoDocuments] = useState<Document[]>([]);
    const [geometryBoundings, setGeometryBoundings] = useState<GeometryBoundings | null>(null);
    const [transformMatrix, setTransformMatrix] = useState<Matrix4>();
    const [cameraView, setCameraView] = useState<CameraView>();

    const focusMapOnDocumentIds = useCallback(async (docIds: string[]) => {

        if(!transformMatrix) return;
        
        const geoDocs: FieldGeometry[] = [];
        const docs = await repository.getMultiple(docIds);
        docs.forEach(doc => {
            if(doc.resource.geometry) geoDocs.push(doc.resource.geometry);
        });
        if(!geoDocs.length) return;
        const { minX, minY, maxX, maxY } = getMinMaxCoords(geoDocs);
        const [left, bottom] = processTransform2d(transformMatrix, [minX,minY]);
        const [right, top] = processTransform2d(transformMatrix, [maxX,maxY]);
        setCameraView({
            left: left - viewBoxPaddingX,
            right: right + viewBoxPaddingX,
            bottom: bottom - viewBoxPaddingY,
            top: top + viewBoxPaddingY });
    },[repository,transformMatrix]);

    const focusMapOnDocumentId = (docId: string) => focusMapOnDocumentIds([docId]);


    useEffect(() => {

        repository.find(searchQuery)
            .then(result => {
                setGeoDocuments(result.documents);
                setGeometryBoundings(getGeometryBoundings(result.documents));
            }).catch(err => console.log('Document not found. Error:',err));
    },[repository]);


    useEffect(() => setTransformMatrix( setupTransformationMatrix(geometryBoundings,viewPort)),
        [geometryBoundings, viewPort]);


    useEffect(() => {focusMapOnDocumentIds(selectedDocumentIds);},[selectedDocumentIds, focusMapOnDocumentIds]);


    return [geoDocuments, transformMatrix, cameraView, focusMapOnDocumentId];
};


export default useMapData;