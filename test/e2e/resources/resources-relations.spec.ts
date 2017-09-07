import {browser, protractor, element, by} from 'protractor';
import {ResourcesPage} from './resources.page';
import {DocumentViewPage} from '../widgets/document-view.page';
import {DoceditPage} from '../docedit/docedit.page';
import {NavbarPage} from '../navbar.page';

const EC = protractor.ExpectedConditions;
const delays = require('../config/delays');

describe('resources/relations --', function() {

    beforeEach(function() {
        ResourcesPage.get();
        browser.wait(EC.visibilityOf(element(by.id('idai-field-brand'))), delays.ECWaitTime);
    });

    it ('create links for relations', function() {
        ResourcesPage.performCreateLink();
        ResourcesPage.clickSelectResource('1');
        DocumentViewPage.getRelationValue(1).then(relVal=>{
            expect(relVal).toEqual('2')
        });
        DocumentViewPage.clickRelation(1);
        DocumentViewPage.getRelationValue(1).then(relVal=>{
            expect(relVal).toEqual('1')
        });
    });

    it('create a new relation and the corresponding inverse relation', function() {
        ResourcesPage.performCreateLink();
        ResourcesPage.openEditByDoubleClickResource('2');
        expect(DoceditPage.getRelationButtonText(1, 0, 0)).toEqual('1');
        DoceditPage.clickCloseEdit();
        ResourcesPage.clickSelectResource('1');
        DocumentViewPage.clickEditDocument();
        expect(DoceditPage.getRelationButtonText(0, 0, 0)).toEqual('2');
    });

    it('edit a resource that contains a relation', function() {
        ResourcesPage.performCreateLink();
        expect(NavbarPage.getMessageText()).toContain('erfolgreich');
        ResourcesPage.openEditByDoubleClickResource('2');
        DoceditPage.clickFieldsTab();
        DoceditPage.typeInInputField('123');
        DoceditPage.clickSaveDocument();
        expect(NavbarPage.getMessageText()).toContain('erfolgreich');
    });

    it('delete a relation and the corresponding inverse relation', function() {
        ResourcesPage.performCreateLink();
        ResourcesPage.clickSelectResource('1');
        DocumentViewPage.getRelations().then(function(relations) {
            expect(relations.length).toBe(1);
        });
        ResourcesPage.clickSelectResource('2');
        DocumentViewPage.getRelations().then(function(relations) {
            expect(relations.length).toBe(1);
        });
        DocumentViewPage.clickEditDocument();
        DoceditPage.clickRelationsTab();
        DoceditPage.clickRelationDeleteButtonByIndices(1, 0, 0);
        DoceditPage.clickSaveDocument();
        DocumentViewPage.getRelations().then(function(relations) {
            expect(relations.length).toBe(0);
        });
        ResourcesPage.clickSelectResource('1');
        DocumentViewPage.getRelations().then(function(relations) {
            expect(relations.length).toBe(0);
        });
    });

    it('delete inverse relations when deleting a resource', function() {
        ResourcesPage.performCreateLink();
        ResourcesPage.openEditByDoubleClickResource('2');
        ResourcesPage.clickDeleteDocument();
        ResourcesPage.clickDeleteInModal();
        ResourcesPage.clickSelectResource('1');
        DocumentViewPage.getRelations().then(function(relations) {
            expect(relations.length).toBe(0);
        });
    });

});
