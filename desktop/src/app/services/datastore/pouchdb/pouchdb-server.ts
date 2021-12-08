import {Injectable} from '@angular/core';
import { Imagestore, ImageVariant } from 'idai-field-core';
import { FsAdapter } from '../../filestore/fs-adapter';

const express = typeof window !== 'undefined' ? window.require('express') : require('express');
const remote = typeof window !== 'undefined' ? window.require('@electron/remote') : undefined;
const PouchDB = typeof window !== 'undefined' ? window.require('pouchdb-browser') : require('pouchdb-node');
const expressPouchDB = (typeof window !== 'undefined' ? window.require : require)('express-pouchdb'); // Get rid of warning
const expressBasicAuth = typeof window !== 'undefined' ? window.require('express-basic-auth') : require('express-basic-auth');


@Injectable()
export class PouchdbServer {

    private password: string;

    public getPassword = () => this.password;

    public setPassword = (password: string) => this.password = password;

    constructor(private filesystem: FsAdapter, private imagestore: Imagestore) {}


    /**
     * Provides Fauxton and the CouchDB REST API
     */
    public async setupServer() {

        const self = this;
        const app = express();

        app.use(expressBasicAuth({
            challenge: true,
            authorizer: (_: string, password: string) =>
                expressBasicAuth.safeCompare(password, this.password),
            unauthorizedResponse: () => ({ status: 401, reason: 'Name or password is incorrect.' })
        }));

        app.post('/files/:project/*', (req: any, res: any, next: any) => {
            // https://stackoverflow.com/a/16599008
            req.on('data', function(data) {
                self.filesystem.writeFile('/' + req.params['project'] + '/' + req.params[0], data)
            });
            req.on('end', function() {
                res.status(200).send({ status: 'ok' });
            });
        });

        app.get('/files/:project/*', (req: any, res: any) => {
            const path = '/' + req.params['project'] + '/' + req.params[0];

            if (!self.filesystem.exists(path)) {
                res.status(200).send({ status: 'notfound' });
            } else {
                if (self.filesystem.isDirectory(path)) {
                    res.status(200).send({ files: self.filesystem.listFiles(path) });
                } else {
                    res
                        .header('Content-Type', 'image/png')
                        .status(200).sendFile(self.imagestore.getData(req.params[0], ImageVariant.ORIGINAL));
                }
            }
        });

        // prevent the creation of new databases when syncing
        app.put('/:db', (_: any, res: any) =>
            res.status(401).send( { status: 401 }));

        app.use('/', expressPouchDB(PouchDB, {
            logPath: remote.getGlobal('appDataPath') + '/pouchdb-server.log',
            mode: 'fullCouchDB',
            overrideMode: {
                include: ['routes/fauxton'],
                exclude: [
                    'routes/authentication',
                    'routes/authorization',
                    'routes/session'
                ]
            }
        }));

        await app.listen(3000, function() {
            console.debug('PouchDB Server is listening on port 3000');
        });
    }
}
