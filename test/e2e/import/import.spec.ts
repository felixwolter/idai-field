import {browser, protractor} from 'protractor';

let common = require("../common.js");
let importPage = require('./import.page');
let resourcesPage = require('../resources/resources.page');
import {NavbarPage} from '../navbar.page';
let delays = require('../config/delays');

let EC = protractor.ExpectedConditions;

describe('import tests -- ', function() {

    beforeEach(function() {
        importPage.get();
    });

    let importIt = function(url) {
        importPage.clickImportButton();
        expect(importPage.getSourceOptionValue(1)).toEqual("http");
        importPage.clickSourceOption(1);
        expect(importPage.getFormatOptionValue(0)).toEqual("native");
        importPage.clickFormatOption(0);
        common.typeIn(importPage.getImportURLInput(), url);
        importPage.clickStartImportButton();
    };

    it('importer should import a valid iDAI.field JSONL file via HTTP', function() {
        importIt("./test/test-data/importer-test-ok.jsonl");
        browser.sleep(2000);
        NavbarPage.clickNavigateToResources();

        browser.wait(EC.presenceOf(resourcesPage.getListItemEl('obob1')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(resourcesPage.getListItemEl('obob2')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(resourcesPage.getListItemEl('obob3')), delays.ECWaitTime);
        browser.wait(EC.presenceOf(resourcesPage.getListItemEl('obob4')), delays.ECWaitTime);
    });

    it('importer should delete already imported iDAI.field documents if an error occurs', function() {

        importIt("./test/test-data/importer-test-constraint-violation.jsonl");
        NavbarPage.awaitAlert('existiert bereits', false);
        NavbarPage.clickNavigateToResources();

        browser.wait(EC.presenceOf(resourcesPage.getListItemEl('testf1')), delays.ECWaitTime);

        expect(resourcesPage.getListItemIdentifierText(0)).not.toEqual('obob1');
        expect(resourcesPage.getListItemIdentifierText(0)).not.toEqual('obob2');
    });

    it('importer should abort if an empty geometry is found', function() {

        importIt("./test/test-data/importer-test-empty-geometry.jsonl");
        NavbarPage.awaitAlert('nicht definiert', false);
    });

    it('importer should abort if a geometry with invalid coordinates is found', function() {

        importIt("./test/test-data/importer-test-invalid-geometry-coordinates.jsonl");
        NavbarPage.awaitAlert('sind nicht valide', false);
    });

    it('importer should abort if a geometry with an unsupported type is found', function() {

        importIt("./test/test-data/importer-test-unsupported-geometry-type.jsonl");
        NavbarPage.awaitAlert('nicht unterstützt', false);
    });
});
