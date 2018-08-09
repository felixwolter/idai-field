import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import {IdaiFieldFeatureDocument} from 'idai-components-2/field';
import {on} from 'tsfun';
import {ObserverUtil} from '../../util/observer-util';


export type MatrixSelectionChange = {

    ids: Array<string>;
    changeType: 'added'|'removed';
}


/**
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 */
export class MatrixSelection {

    private selectedDocumentsIds: Array<string> = [];
    private observers: Array<Observer<MatrixSelectionChange>> = [];


    public changesNotifications = (): Observable<MatrixSelectionChange> => ObserverUtil.register(this.observers);
    public notifyObservers = (change: MatrixSelectionChange) => ObserverUtil.notify(this.observers, change);


    public getSelectedDocuments(documents: Array<IdaiFieldFeatureDocument>): Array<IdaiFieldFeatureDocument> {

        return this.selectedDocumentsIds.map(id => {
            return documents.find(on('resource.id:')(id)) as IdaiFieldFeatureDocument;
        });
    }


    public add(id: string) {

        if (this.selectedDocumentsIds.includes(id)) return;

        this.selectedDocumentsIds.push(id);
        this.notifyObservers({ ids: [id], changeType: 'added' });
    }


    public addOrRemove(id: string) {

        if (this.selectedDocumentsIds.includes(id)) {
            this.selectedDocumentsIds.splice(this.selectedDocumentsIds.indexOf(id), 1);
            this.notifyObservers({ ids: [id], changeType: 'removed' });
        } else {
            this.selectedDocumentsIds.push(id);
            this.notifyObservers({ ids: [id], changeType: 'added' });
        }
    }


    public clear() {

        this.notifyObservers({ ids: this.selectedDocumentsIds, changeType: 'removed' });
        this.selectedDocumentsIds = [];
    }
}