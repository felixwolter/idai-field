var resourcesPage = require('../resources/resources.page');
var documentViewPage = require('./document-view.page');
var EC = protractor.ExpectedConditions;
var delays = require('../config/delays');


/**
 * @author Daniel de Oliveira
 */
describe('document view tests --', function() {

    beforeEach(function () {
        resourcesPage.get();
    });

    it('document view should show the fields present in the object', function () {
        resourcesPage.performCreateResource('1', 0);
        resourcesPage.clickSelectResource("1");
        expect(documentViewPage.getFieldName(0)).toBe('Identifier'); // with the correct field label
        expect(documentViewPage.getFieldValue(0)).toBe('1');
    });

    /**
     * Addresses an issue where fields were shown double.
     */
    it('document view should show only the fields present in the object', function () {
        resourcesPage.performCreateResource('1', 0);
        resourcesPage.clickSelectResource("1");
        documentViewPage.getFields().then(function(items) {
            expect(items.length).toBe(1);
        });
    });

    it('document view should show the relations present in the object', function () {
        resourcesPage.performCreateLink();
        resourcesPage.clickSelectResource("1");
        expect(documentViewPage.getRelationName(0)).toBe('Sohn von'); // with the correct relation label
        expect(documentViewPage.getRelationValue(0)).toBe('2');
    });

    /**
     * Addresses an issue where relations were shown double.
     */
    it('document view should show only relations present in the object', function () {
        resourcesPage.performCreateLink();
        resourcesPage.clickSelectResource("1");
        documentViewPage.getRelations().then(function(relations) {
            expect(relations.length).toBe(1);
        });
    });

    /**
     * Addresses an issue where relations were still shown after cancelling edit and discarding changes
     * (they were not saved though).
     */
    it('fields view should show only relations present in the object', function () {
        resourcesPage.performCreateResource('1');
        resourcesPage.performCreateResource('2');
        resourcesPage.clickSelectResource("1");
        resourcesPage.clickEditDocument();
        resourcesPage.clickRelationsTab();
        resourcesPage.clickAddRelationForGroupWithIndex(0);
        resourcesPage.typeInRelationByIndices(0, 0, '2');
        resourcesPage.clickChooseRelationSuggestion(0, 0, 0);
        resourcesPage.clickSelectResource("1");
        resourcesPage.clickDiscardInModal();

        browser.wait(EC.visibilityOf(element(by.tagName('document-view'))), delays.ECWaitTime); // to prove document view is visible
        documentViewPage.getRelations().then(function(relations) {
            expect(relations.length).toBe(0);
        });
    });
});