import {Document} from 'idai-components-2/core';
import {ProjectConfiguration} from 'idai-components-2/configuration';
import {Static} from '../../static';
import {IdaiFieldDocumentDatastore} from '../../../../app/core/datastore/idai-field-document-datastore';
import {IdaiFieldDocumentConverter} from '../../../../app/core/datastore/idai-field-document-converter';
import {ImageTypeUtility} from '../../../../app/common/image-type-utility';
import {IdaiFieldImageDocumentDatastore} from '../../../../app/core/datastore/idai-field-image-document-datastore';

/**
 * This is a subsystem test.
 * The use of mocks is intentionally reduced.
 *
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
export function main() {

    const projectConfiguration = new ProjectConfiguration({
        'types': [
            {
                'type': 'Trench',
                'fields': []
            },
            {
                'type': 'Image',
                'fields': []
            }
        ]
    });


    describe('CachedDatastoreExtensions/Subsystem', () => {

        let converter;
        let documentCache;
        let datastore;


        function failOnWrongErr(err) {

            if (!err) fail("Wrong Err - undefined");
            if (err.indexOf('Wrong') === -1) fail('Wrong Err' + err);
        }


        beforeEach(async done => {

            spyOn(console, 'debug'); // suppress console.debug

            converter = new IdaiFieldDocumentConverter(new ImageTypeUtility(projectConfiguration));
            const result = Static.createPouchdbDatastore('testdb');
            datastore = result.datastore;
            documentCache = result.documentCache;

            await new IdaiFieldImageDocumentDatastore(
                datastore, documentCache, converter).
                    create(Static.doc('Image','Image','Image','image0'));
            await new IdaiFieldDocumentDatastore(
                datastore, documentCache, converter).
                    create(Static.doc('Trench','Trench','Trench','trench0'));
            done();
        });


        afterEach(async done => {

            new PouchDB('testdb').destroy().then(() => {done()})
        }, 5000);


        it('throw when creating an image type with IdaiFieldDocumentDatastore', async done => {

            datastore = new IdaiFieldDocumentDatastore(datastore, documentCache,
                converter);
            try {
                await datastore.create(Static.doc('Img','Img','Image','img'));
                fail();
            } catch (expected) {
                failOnWrongErr(expected);
            }
            done();
        });


        it('throw when creating a non image type with IdaiFieldImageDocumentDatastore', async done => {

            datastore = new IdaiFieldImageDocumentDatastore(
                datastore, documentCache, converter);
            try {
                await datastore.create(Static.doc('trench1','trench1','Trench','t1'));
                fail();
            } catch (expected) {
                failOnWrongErr(expected);
            }
            done();
        });


        it('throw when updating an image type with IdaiFieldDocumentDatastore', async done => {

            datastore = new IdaiFieldDocumentDatastore(
                datastore, documentCache, converter);
            try {
                await datastore.update(Static.doc('Img','Img','Image','img'));
                fail();
            } catch (expected) {
                failOnWrongErr(expected);
            }
            done();
        });


        it('throw when updating a non image type with IdaiFieldImageDocumentDatastore', async done => {

            datastore = new IdaiFieldImageDocumentDatastore(
                datastore, documentCache, converter);
            try {
                await datastore.update(Static.doc('trench1','trench1','Trench','t1'));
                fail();
            } catch (expected) {
                failOnWrongErr(expected);
            }
            done();
        });


        it('throw when deleting an image type with IdaiFieldDocumentDatastore', async done => {

            datastore = new IdaiFieldDocumentDatastore(
                datastore, documentCache, converter);
            try {
                await datastore.remove(Static.doc('Img','Img','Image','img'));
                fail();
            } catch (expected) {
                failOnWrongErr(expected);
            }
            done();
        });


        it('throw when deleting a non image type with IdaiFieldImageDocumentDatastore', async done => {

            datastore = new IdaiFieldImageDocumentDatastore(
                datastore, documentCache, converter);
            try {
                await datastore.remove(Static.doc('trench1','trench1','Trench','t1'));
                fail();
            } catch (expected) {
                failOnWrongErr(expected);
            }
            done();
        });


        it('throw when getting an image type with IdaiFieldDocumentDatastore', async done => {

            datastore = new IdaiFieldDocumentDatastore(
                datastore, documentCache, converter);
            try {
                await datastore.get('image0', { skip_cache: true });
                fail();
            } catch (expected) {
                failOnWrongErr(expected);
            }
            done();
        });


        it('throw when getting a non image type with IdaiFieldImageDocumentDatastore', async done => {

            datastore = new IdaiFieldImageDocumentDatastore(
                datastore, documentCache, converter);
            try {
                await datastore.get('trench0', { skip_cache: true });
                fail();
            } catch (expected) {
                failOnWrongErr(expected);
            }
            done();
        });
    });
}
