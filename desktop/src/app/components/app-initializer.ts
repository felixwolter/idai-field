import { CategoryConverter, ConstraintIndex, DocumentCache, FulltextIndex, Indexer, IndexFacade, PouchdbDatastore, ProjectConfiguration } from 'idai-field-core';
import { AngularUtility } from '../angular/angular-utility';
import { ImageConverter } from '../services/imagestore/image-converter';
import { Imagestore } from '../services/imagestore/imagestore';
import { InitializationProgress } from './initialization-progress';
import { IndexerConfiguration } from '../indexer-configuration';
import {SettingsService} from '../services/settings/settings-service';
import {SettingsSerializer} from '../services/settings/settings-serializer';
import {Settings} from '../services/settings/settings';
import {SampleDataLoader} from '../services/datastore/field/sampledata/sample-data-loader';
import {PouchdbServer} from '../services/datastore/pouchdb/pouchdb-server';


const remote = typeof window !== 'undefined' ? window.require('@electron/remote') : undefined;


interface Services {
    projectConfiguration?: ProjectConfiguration;
    fulltextIndex?: FulltextIndex;
    constraintIndex?: ConstraintIndex;
    indexFacade?: IndexFacade;
}


export class AppInitializerServiceLocator {

    private services: Services = {};


    public init(services: Services) {

        this.services = services;
    }


    public get projectConfiguration(): ProjectConfiguration {
        if (!this.services.projectConfiguration) {
            console.error('project configuration has not yet been provided');
            throw 'project configuration has not yet been provided';
        }
        return this.services.projectConfiguration;
    }


    public get fulltextIndex(): FulltextIndex {
        if (!this.services.fulltextIndex) {
            console.error('fulltext index has not yet been provided');
            throw 'fulltext index has not yet been provided';
        }
        return this.services.fulltextIndex;
    }


    public get constraintIndex(): ConstraintIndex {
        if (!this.services.constraintIndex) {
            console.error('constraint index has not yet been provided');
            throw 'constraint index has not yet been provided';
        }
        return this.services.constraintIndex;
    }


    public get indexFacade(): IndexFacade {
        if (!this.services.indexFacade) {
            console.error('index facade has not yet been provided');
            throw 'index facade has not yet been provided';
        }
        return this.services.indexFacade;
    }
}


export const appInitializerFactory = (
        serviceLocator: AppInitializerServiceLocator,
        settingsService: SettingsService,
        pouchdbDatastore: PouchdbDatastore,
        pouchdbServer: PouchdbServer,
        documentCache: DocumentCache,
        imageConverter: ImageConverter,
        imagestore: Imagestore,
        progress: InitializationProgress
    ) => async (): Promise<void> => {

    await pouchdbServer.setupServer();

    const settings = await loadSettings(settingsService, progress);

    await setUpDatabase(settingsService, settings, progress);

    await loadSampleData(settings, pouchdbDatastore.getDb(), imageConverter, progress);

    const services = await loadConfiguration(settingsService, progress);
    serviceLocator.init(services);

    await loadDocuments(serviceLocator, pouchdbDatastore.getDb(), documentCache, progress);

    return await AngularUtility.refresh(700);
};


const loadSettings = async (settingsService: SettingsService, progress: InitializationProgress): Promise<Settings> => {

    await progress.setPhase('loadingSettings');
    const settings = await settingsService.updateSettings(await (new SettingsSerializer).load());
    await progress.setEnvironment(settings.dbs[0], Settings.getLocale());

    return settings;
}


const setUpDatabase = async (settingsService: SettingsService, settings: Settings, progress: InitializationProgress) => {

    await progress.setPhase('settingUpDatabase');
    try {
        await settingsService.bootProjectDb(settings.selectedProject, settings.selectedProject === 'test');
    } catch (msgWithParams) {
        await progress.setError('databaseError');
    }
}


const loadSampleData = async (settings: Settings, db: PouchDB.Database, imageConverter: ImageConverter, progress: InitializationProgress) => {

    if (settings.selectedProject === 'test') {
        await progress.setPhase('loadingSampleObjects');
        const loader = new SampleDataLoader(imageConverter, settings.imagestorePath, Settings.getLocale());
        return loader.go(db, settings.selectedProject);
    }
}


const loadConfiguration = async (settingsService: SettingsService, progress: InitializationProgress): Promise<Services> => {

    await progress.setPhase('loadingConfiguration');

    let configuration: ProjectConfiguration;
    try {
        configuration = await settingsService.loadConfiguration();
    } catch(err) {
        progress.setError('configurationError', err);
        return Promise.reject();
    }

    const { createdConstraintIndex, createdFulltextIndex, createdIndexFacade } = IndexerConfiguration.configureIndexers(configuration);
    return {
        projectConfiguration: configuration,
        constraintIndex: createdConstraintIndex,
        fulltextIndex: createdFulltextIndex,
        indexFacade: createdIndexFacade
    };
};


const loadDocuments = async (serviceLocator: AppInitializerServiceLocator, db: PouchDB.Database<{}>, documentCache: DocumentCache, progress: InitializationProgress) => {

    await progress.setPhase('loadingDocuments');
    progress.setDocumentsToIndex((await db.info()).doc_count);

    await Indexer.reindex(serviceLocator.indexFacade, db, documentCache,
        new CategoryConverter(serviceLocator.projectConfiguration),
        (count) => progress.setIndexedDocuments(count),
        () => progress.setPhase('indexingDocuments'),
        (error) => progress.setError(error)
    );
}
