import {Document, NewDocument, ProjectConfiguration} from 'idai-components-2/core';
import {ImportStrategy} from './import-strategy';
import {DocumentDatastore} from "../datastore/document-datastore";
import {Validator} from '../model/validator';
import {M} from '../../m';
import {IdaiFieldFindResult} from '../datastore/core/cached-read-datastore';


const removeEmptyStrings = (obj: any) => { Object.keys(obj).forEach((prop) => {
   if (obj[prop] === "") { delete obj[prop] }
    }); return obj; };


/**
 * @author Daniel de Oliveira
 * @author Juliane Watson
 */
export class MeninxFindImportStrategy implements ImportStrategy {


    constructor(private validator: Validator,
                private datastore: DocumentDatastore,
                private projectConfiguration: ProjectConfiguration,
                private username: string) { }

    /**
     * @throws errorWithParams
     */
    public async importDoc(importDoc: NewDocument): Promise<Document> {

        importDoc.resource.relations['isRecordedIn'] =
            [await this.getIsRecordedInId(importDoc.resource.identifier[0] + '000')];
        importDoc.resource.relations['liesWithin'] =
            [await this.getLiesWithinId(importDoc.resource.relations['liesWithin'][0])];


        let updateDoc: NewDocument|Document;

        let exists = false;
        const existingOne = await this.getExistingDoc(importDoc.resource.identifier);
        if (existingOne) { // new document -> create

            exists = true;
            updateDoc = MeninxFindImportStrategy.mergeInto(existingOne, importDoc as any);

        } else {

            updateDoc = importDoc;

            MeninxFindImportStrategy.checkTypeOfSherd(updateDoc.resource.sherdTypeCheck, updateDoc.resource, updateDoc.resource.amount);
            delete updateDoc.resource.amount;
            delete updateDoc.resource.sherdTypeCheck;
        }


        updateDoc.resource = removeEmptyStrings(updateDoc.resource);
        console.log(exists ? 'update' : 'create', updateDoc);

        return exists
            ? await this.datastore.update(updateDoc as Document, this.username)
            : await this.datastore.create(updateDoc, this.username);
    }


    private async getExistingDoc(resourceIdentifier: string) {

        let importDocExistenceFindResult: IdaiFieldFindResult<Document>;
        try {
            importDocExistenceFindResult = await this.datastore.find(
                { constraints: { "identifier:match": resourceIdentifier } });
        } catch (err) { throw "no find result obtained" }
        if (importDocExistenceFindResult.documents.length > 1) throw ["More than one doc found for identifier ", resourceIdentifier];

        return importDocExistenceFindResult.documents.length === 1
            ? importDocExistenceFindResult.documents[0]
            : undefined;
    }


    private async getIsRecordedInId(trenchIdentifier: string) {

        try {
            const trench = await this.datastore.find({
                constraints: { "identifier:match": trenchIdentifier},
                types: ['Trench']});
            return trench.documents[0].resource.id;
        } catch (err) {
            throw [M.IMPORT_FAILURE_NO_OPERATION_ASSIGNABLE, trenchIdentifier];
        }
    }


    private async getLiesWithinId(liesWithinIdentifier: string) {

        let liesWithinTargetFindResult: IdaiFieldFindResult<Document>;
        try {
            liesWithinTargetFindResult = await this.datastore.find({
                constraints: { "identifier:match": liesWithinIdentifier},
                types: ["Feature", "DrillCoreLayer", "Floor", "Grave", "Layer", "Other", "Architecture", "SurveyUnit", "Planum", "Room", "Burial"]});
        } catch (err) {
            throw [M.IMPORT_FAILURE_NO_FEATURE_ASSIGNABLE, liesWithinIdentifier];
        }

        if (liesWithinTargetFindResult.documents.length > 1) {
            console.error("cannot get liesWithinId for identifier", liesWithinIdentifier);
            throw [M.IMPORT_FAILURE_NO_FEATURE_ASSIGNABLE, "More than one SU found for identifier " +
                liesWithinTargetFindResult.documents.map(_ => _.resource.identifier).join(' -- ')];
        }

        return liesWithinTargetFindResult.documents[0].resource.id;
    }


    private static mergeInto(updateDoc: Document|NewDocument, importDoc: Document) {

        if (importDoc.resource.shortDescription.length > 0) updateDoc.resource.shortDescription = importDoc.resource.shortDescription;
        if (importDoc.resource.hasVesselFormPottery.length > 0) updateDoc.resource.hasVesselFormPottery = importDoc.resource.hasVesselFormPottery;
        if (importDoc.resource.hasTypeNumber.length > 0) updateDoc.resource.hasTypeNumber = importDoc.resource.hasTypeNumber;
        if (importDoc.resource.type.length > 0) updateDoc.resource.type = importDoc.resource.type;

        MeninxFindImportStrategy.checkTypeOfSherd(importDoc.resource.sherdTypeCheck, updateDoc.resource, importDoc.resource.amount);

        if (importDoc.resource.hasDecorationTechniquePottery.length > 0) updateDoc.resource.hasDecorationTechniquePottery = importDoc.resource.hasDecorationTechniquePottery;
        if (importDoc.resource.hasComment.length > 0) updateDoc.resource.hasComment = importDoc.resource.hasComment;
        if (importDoc.resource.hasProvinience.length > 0) updateDoc.resource.hasProvinience = importDoc.resource.hasProvinience;

        updateDoc.resource.relations['liesWithin'] = importDoc.resource.relations['liesWithin'];
        updateDoc.resource.relations['isRecordedIn'] = importDoc.resource.relations['isRecordedIn'];

        return updateDoc;
    }


    private static checkTypeOfSherd(typeSherd:any, obj: any, amount: number) {
        if (typeSherd === "B") {
            obj.hasAmountSherdsRimShoulder = amount;
        } else if (typeSherd === "C"){
            obj.hasAmountSherdsRimBase = amount;
        } else if (typeSherd === "P"){
            obj.hasAmountRimSherds = amount;
        } else if (typeSherd === "F"){
            obj.hasAmountSherdsBase = amount;
        } else if (typeSherd === "A"){
            obj.hasAmountSherdsHandles = amount;
        } };
}
