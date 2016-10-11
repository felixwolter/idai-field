var common = require("../common.js");
var utils = require("../utils.js");

fdescribe('idai field app', function() {

    var mapEl;
    
    function clickMap(toRight, toBottom) {
        browser.actions()
            .mouseMove(mapEl, {x: toRight, y: toBottom})
            .click()
            .perform();
    }

    function setMarker() {
        clickMap(100,100);
    }

    function setPolygon() {
        clickMap(100,100);
        clickMap(200,200);
        clickMap(100,200);
        clickMap(100,100);
    }
    

    function mapOption(what) {
        return element(by.id('map-editor-button-'+what)).click();
    }
    
    function clickReeditGeometry() {
        return element(by.id('document-view-button-edit-geometry')).click();
    }

    function createObjectWithGeometry(identifier,geometry,geofun) {
        return common.clickCreateObjectButton()
            .then(common.selectType)
            .then(common.chooseGeometry(geometry))
            .then(geofun)
            .then(mapOption('ok'))
            .then(common.typeInIdentifier(identifier))
            .then(common.scrollUp)
            .then(common.saveObject);
    }
    
    beforeEach(function(){
        browser.get('/#/resources');
        mapEl = element(by.id("map-container"));
    });

    it('should create a new item with point geometry ', function() {
        createObjectWithGeometry('33','point',setMarker)
            .then(common.expectObjectCreatedSuccessfully('33'));
    });

    it('should create a new item with polygon geometry ', function() {
        createObjectWithGeometry('34','polygon',setPolygon)
            .then(common.expectObjectCreatedSuccessfully('34'));
    });
    
    it('should modify a polygon geometry ', function() {
        createObjectWithGeometry('35','polygon',setPolygon)
            .then(common.gotoView)
            .then(clickReeditGeometry)
            .then(clickMap(100,100));
    });
    
    it('should delete a polygon geometry ', function() {
        createObjectWithGeometry('36','polygon',setPolygon)
            .then(common.gotoView)
            .then(clickReeditGeometry)
            .then(mapOption('delete'))
            .then(mapOption('ok'))
            .then(function(){
                expect(element.all(by.css('#document-view-field-geometry span')).get(0).getText()).toEqual('Keine');
            })
    });

});