import { sameset } from 'tsfun';
import { AppConfigurator, CategoryConverter, ChangesStream, ConfigLoader, ConfigReader, createDocuments, Datastore,
    Document, DocumentCache, NiceDocs, PouchdbDatastore, Query, RelationsManager, Resource,
    SyncService } from 'idai-field-core';
import { PouchdbServer } from '../../../src/app/services/datastore/pouchdb/pouchdb-server';
import { Imagestore } from '../../../src/app/services/imagestore/imagestore';
import { PouchDbFsImagestore } from '../../../src/app/services/imagestore/pouch-db-fs-imagestore';
import { ImageDocumentsManager } from '../../../src/app/components/image/overview/view/image-documents-manager';
import { ImageOverviewFacade } from '../../../src/app/components/image/overview/view/imageoverview-facade';
import { ImagesState } from '../../../src/app/components/image/overview/view/images-state';
import { makeDocumentsLookup } from '../../../src/app/components/import/import/utils';
import { ImageRelationsManager } from '../../../src/app/services/image-relations-manager';
import { Validator } from '../../../src/app/model/validator';
import { ResourcesStateManager } from '../../../src/app/components/resources/view/resources-state-manager';
import { ViewFacade } from '../../../src/app/components/resources/view/view-facade';
import { SettingsProvider } from '../../../src/app/services/settings/settings-provider';
import { SettingsService } from '../../../src/app/services/settings/settings-service';
import { TabManager } from '../../../src/app/services/tabs/tab-manager';
import { IndexerConfiguration } from '../../../src/app/indexer-configuration';
import { StateSerializer } from '../../../src/app/services/state-serializer';
import { makeExpectDocuments } from '../../../../core/test/test-helpers';
import { DocumentHolder } from '../../../src/app/components/docedit/document-holder';

import PouchDB = require('pouchdb-node');

const fs = require('fs');


class IdGenerator {
    public generateId() {
        return Math.floor(Math.random() * 10000000).toString();
    }
}


/**
 * Boot project via settings service such that it immediately starts syncinc with http://localhost:3003/synctestremotedb
 */
export async function setupSettingsService(pouchdbdatastore, pouchdbserver, projectName = 'testdb') {

    const settingsProvider = new SettingsProvider();

    const settingsService = new SettingsService(
        new PouchDbFsImagestore(
            undefined, undefined, pouchdbdatastore.getDb()) as Imagestore,
        pouchdbdatastore,
        pouchdbserver,
        undefined,
        new AppConfigurator(new ConfigLoader(new ConfigReader(), pouchdbdatastore)),
        undefined,
        settingsProvider
    );

    const settings = await settingsService.updateSettings({
        languages: ['de', 'en'],
        isAutoUpdateActive: false,
        hostPassword: '',
        syncTargets: {},
        dbs: [projectName],
        selectedProject: '',
        imagestorePath: process.cwd() + '/test/test-temp/imagestore',
        username: 'synctestuser'
    });

    await settingsService.bootProjectDb(settings.selectedProject, true);

    const projectConfiguration = await settingsService.loadConfiguration();
    return { settingsService, projectConfiguration, settingsProvider };
}


export interface App {

    remoteChangesStream: ChangesStream,
    viewFacade: ViewFacade,
    documentHolder: DocumentHolder,
    datastore: Datastore,
    settingsService: SettingsService,
    settingsProvider: SettingsProvider,
    resourcesStateManager: ResourcesStateManager,
    stateSerializer: StateSerializer,
    tabManager: TabManager,
    imageOverviewFacade: ImageOverviewFacade,
    relationsManager: RelationsManager,
    imagestore: Imagestore,
    imageRelationsManager: ImageRelationsManager
}


export async function createApp(projectName = 'testdb'): Promise<App> {

    const pouchdbServer = new PouchdbServer();

    const pouchdbDatastore = new PouchdbDatastore(
        (name: string) => new PouchDB(name),
        new IdGenerator());
    pouchdbDatastore.createDbForTesting(projectName);
    pouchdbDatastore.setupChangesEmitter();

    const { settingsService, projectConfiguration, settingsProvider } = await setupSettingsService(
        pouchdbDatastore, pouchdbServer, projectName);

    const { createdIndexFacade } = IndexerConfiguration.configureIndexers(projectConfiguration);

    const imagestore = new PouchDbFsImagestore(undefined, undefined, pouchdbDatastore.getDb());
    imagestore.init(settingsProvider.getSettings());

    const documentCache = new DocumentCache();
    const categoryConverter = new CategoryConverter(projectConfiguration);

    const datastore = new Datastore(
        pouchdbDatastore, createdIndexFacade, documentCache, categoryConverter, () => settingsProvider.getSettings().username);

    const remoteChangesStream = new ChangesStream(
        pouchdbDatastore,
        createdIndexFacade,
        documentCache,
        categoryConverter,
        () => settingsProvider.getSettings().username);

    const stateSerializer = jasmine.createSpyObj('stateSerializer', ['load', 'store']);
    stateSerializer.load.and.returnValue(Promise.resolve({}));
    stateSerializer.store.and.returnValue(Promise.resolve());

    const tabSpaceCalculator = jasmine.createSpyObj('tabSpaceCalculator',
        ['getTabSpaceWidth', 'getTabWidth']);
    tabSpaceCalculator.getTabSpaceWidth.and.returnValue(1000);
    tabSpaceCalculator.getTabWidth.and.returnValue(0);

    const tabManager = new TabManager(createdIndexFacade, tabSpaceCalculator, stateSerializer,
        datastore,
        () => Promise.resolve());
    tabManager.routeChanged('/project');

    const resourcesStateManager = new ResourcesStateManager(
        datastore,
        createdIndexFacade,
        stateSerializer,
        tabManager,
        projectName,
        projectConfiguration,
        true
    );

    const messages = jasmine.createSpyObj('messages', ['add']);

    const viewFacade = new ViewFacade(
        datastore,
        remoteChangesStream,
        resourcesStateManager,
        undefined,
        createdIndexFacade,
        messages,
        new SyncService(pouchdbDatastore)
    );

    const relationsManager = new RelationsManager(
        datastore,
        projectConfiguration,
    );

    const imageRelationsManager = new ImageRelationsManager(
        datastore,
        relationsManager,
        imagestore,
        projectConfiguration
    );

    const documentHolder = new DocumentHolder(
        projectConfiguration,
        relationsManager,
        new Validator(projectConfiguration, (q: Query) => datastore.find(q)),
        datastore
    );

    const imagesState = new ImagesState(projectConfiguration);
    const imageDocumentsManager = new ImageDocumentsManager(imagesState, datastore);
    const imageOverviewFacade = new ImageOverviewFacade(imageDocumentsManager, imagesState, projectConfiguration);

    return {
        remoteChangesStream,
        viewFacade,
        documentHolder,
        datastore,
        settingsService,
        settingsProvider,
        resourcesStateManager,
        stateSerializer,
        tabManager,
        imageOverviewFacade,
        relationsManager,
        imagestore,
        imageRelationsManager
    }
}


export function createHelpers(app) {

    const projectImageDir = app.settingsProvider.getSettings().imagestorePath
        + app.settingsProvider.getSettings().selectedProject
        + '/';
    const createDocuments = makeCreateDocuments(
        app.datastore, projectImageDir, app.settingsProvider.getSettings().username);
    const updateDocument = makeUpdateDocument(
        app.datastore, app.settingsProvider.getSettings().username);
    const getDocument = makeGetDocument(app.datastore);
    const expectDocuments = makeExpectDocuments(app.datastore);
    const expectResources = makeExpectResources(app.datastore);
    const expectImagesExist = makeExpectImagesExist(projectImageDir);
    const expectImagesDontExist = makeExpectImagesDontExist(projectImageDir);
    const createProjectDir = makeCreateProjectDir(projectImageDir);
    const createImageInProjectDir = makeCreateImageInProjectImageDir(projectImageDir);

    return {
        createDocuments,
        updateDocument,
        expectDocuments,
        expectResources,
        expectImagesExist,
        expectImagesDontExist,
        createProjectDir,
        createImageInProjectDir,
        getDocument
    }
}


function makeCreateProjectDir(projectImageDir) {

    return function createProjectDir() {
        try {
            // TODO node 12 supports fs.rmdirSync(path, {recursive: true})
            const files = fs.readdirSync(projectImageDir);
            for (const file of files) {
                fs.unlinkSync(projectImageDir + file);
            }
            if (fs.existsSync(projectImageDir)) fs.rmdirSync(projectImageDir);
        } catch (e) {
            console.log("error deleting tmp project dir", e)
        }
        fs.mkdirSync(projectImageDir, { recursive: true });
    }
}


function makeExpectImagesExist(projectImageDir) {

    return function expectImagesExist(...ids) {

        for (const id of ids) {
            expect(fs.existsSync(projectImageDir + id)).toBeTruthy();
        }
    }
}


function makeExpectImagesDontExist(projectImageDir) {

    return function expectImagesDontExist(...ids) {

        for (const id of ids) {
            expect(fs.existsSync(projectImageDir + id)).not.toBeTruthy();
        }
    }
}


function makeCreateDocuments(datastore: Datastore,
                             projectImageDir: string,
                             username: string) {

    return async function create(documents: NiceDocs, project?: string) {

        const documentsLookup = createDocuments(documents);
        for (const document of Object.values(documentsLookup)) {
            if (project) document.project = project;
            await datastore.create(document);
        }
        for (const [id, type, _] of documents) {
            if (type === 'Image') makeCreateImageInProjectImageDir(projectImageDir)(id);
        }

        const storedDocuments = [];
        for (const doc of Object.values(documentsLookup)) {
            storedDocuments.push( await datastore.get(doc.resource.id) );
        }
        return makeDocumentsLookup(storedDocuments);
    }
}


function makeUpdateDocument(datastore: Datastore, username: string) {

    return async function updateDocument(id: Resource.Id,
                                         callback: (document: Document) => void) {

        const oldDocument = await datastore.get(id);
        callback(oldDocument);
        await datastore.update(oldDocument);
    }
}


function makeExpectResources(datastore: Datastore) {

    return async function expectDocuments(...resourceIdentifiers: string[]) {

        const documents = (await datastore.find({})).documents;
        expect(sameset(documents.map(doc => doc.resource.identifier), resourceIdentifiers)).toBeTruthy();
    }
}


function makeCreateImageInProjectImageDir(projectImageDir: string) {

    return function createImageInProjectImageDir(id: string) {

        fs.closeSync(fs.openSync(projectImageDir + id, 'w'));
        expect(fs.existsSync(projectImageDir + id)).toBeTruthy();
    }
}


function makeGetDocument(datastore: Datastore) {

    return async function getDocument(id: Resource.Id) {

        return await datastore.get(id);
    }
}
