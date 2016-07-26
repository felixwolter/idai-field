import {describe, expect, it} from '@angular/core/testing';
import {IdigCsvParser} from "../app/import/idig-csv-parser";
import {M} from "../app/m";

/**
 * @author Sebastian Cuy
 */
export function main() {

    describe('IdigCsvParser', () => {

        it('should create objects from file content', (done) => {

            var fileContent  = 'Contributor	Coverage	CoverageSpatial	CoverageSpatialAreaCartesian_double	CoverageSpatialBoundsCartesian_bbox	CoverageSpatialCRS	CoverageSpatialCartesian_rpt	CoverageSpatialElevations_rpt	CoverageSpatialPoints_rpt	CoverageTemporal	CoverageTemporalStart	CoverageTemporal_range	Creator	Date	DateTimeZone	Date_range	Description	Format	FormatDiameter	FormatDiameter_double	FormatDimensions	FormatDimensions_double	FormatHeight	FormatHeight_double	FormatLength	FormatLength_double	FormatLocked	FormatMaximumDimension	FormatMaximumDimension_double	FormatPreservedHeight	FormatPreservedHeight_double	FormatSidelined	FormatStatus	FormatThickness	FormatThickness_double	FormatTrashed	FormatWidth	FormatWidth_double	Identifier	Identifier_uuid	Language	Publisher	Relation	RelationBelongsTo	RelationBelongsTo_uuid	RelationIncludes	RelationIncludes_uuid	RelationIsAbove	RelationIsAbove_uuid	RelationIsBelow	RelationIsBelow_uuid	RelationIsCoevalWith	RelationIsCoevalWith_uuid	Relation_uuid	Rights	Source	Subject	Title	Type\n'
                + '	Daly 2010	J/10,13-1/19,2/2	6.485	ENVELOPE(389.878, 392.499, 378.549, 381.697)	Cartesian	MULTIPOLYGON(POLYGON(390.289 381.684, 390.403 381.582, 390.802 381.32, 391.089 380.979, 391.254 380.932, 391.323 380.965, 391.405 381.091, 391.303 381.515, 391.322 381.524, 391.319 381.536, 391.342 381.532, 391.491 381.599, 391.518 381.503, 391.52 381.503, 391.698 380.955, 391.886 380.931, 391.919 380.93, 392.261 380.838, 392.286 380.851, 392.499 379.686, 392.499 379.686, 392.499 379.685, 392.281 379.527, 392.275 379.524, 392.256 379.51, 392.051 379.381, 392.105 378.914, 392.112 378.868, 392.11 378.868, 392.11 378.867, 392.018 378.851, 390.314 378.549, 389.878 380.081, 389.894 380.09, 389.894 380.09, 390.361 380.394, 389.954 381.237, 389.973 381.36, 389.972 381.439, 390.289 381.697, 390.289 381.684))	POINT(51.884,52.06)	GEOMETRYCOLLECTION(POLYGON Z (392.284 380.832 51.932, 391.919 380.93 51.933, 391.704 380.937 51.947, 391.52 381.503 51.973, 391.319 381.536 51.953, 391.45 381.024 51.894, 391.127 380.873 51.92, 390.865 381.204 51.923, 390.551 381.451 51.955, 390.289 381.684 51.964, 390.289 381.697 51.964, 389.972 381.439 52.06, 389.976 381.205 51.983, 390.382 380.407 51.989, 389.894 380.09 52.002, 390.332 378.564 52.051, 392.11 378.867 52.002, 392.048 379.405 51.969, 392.281 379.527 51.975, 392.499 379.685 51.957, 392.284 380.832 51.932), POLYGON Z (392.286 380.851 51.921, 392.069 380.743 51.913, 391.926 380.926 51.917, 391.675 380.958 51.921, 391.491 381.599 51.919, 391.303 381.515 51.92, 391.405 381.091 51.884, 391.295 380.921 51.894, 391.089 380.979 51.904, 390.802 381.32 51.919, 390.264 381.674 51.981, 389.981 381.408 52.054, 389.954 381.237 51.942, 390.377 380.361 51.941, 389.878 380.081 52.007, 390.314 378.549 52.057, 392.112 378.868 51.981, 392.031 379.369 51.94, 392.256 379.51 51.948, 392.499 379.686 51.947, 392.286 380.851 51.921))					Jun 25, 2010	Europe/Athens	2010-06-25T12:00:00Z	After a light cleaning pass, we open south of the cistern. Our eastern limit is the north-south line between the midpoints of Pier 2 and Pier 3. A morning rain had revealed what looked like a red layer at center that ended at west along a strip of green. We take a light pass to clarify. In 2009 they had taken passes in this area (Basket 4; p. 9061; 4th BC) that stopped somewhat arbitrarily when a level equal to that previously dug at east was reached. It appears that the area at east to which this pass was made equivalent was 2007 Basket 1. Our pass here finds several different layers. At the extreme west there is a band (W. ca. .50m) of green fill (bedrock crushed up in re-use or possible disturbance). At north is a pocket of ash and charcoal amid grey fill. At center a red fill was found. While at southwest a brown and grey area emerged. As the brown and grey appeared to lie atop some of the red, we take it first as Basket 17. We take the ash and grey as Basket 20.										0					0	Archived			0			16	Agora:Basket:daly:2010:b:16	en	Athenian Agora Excavations	"ΒΖ South 2015, Context 3\nΒΖ South 2015, Context 12\nmartens:2013:b:49\ndaly:2010:b:17"	"Undefined\nUndefined"	"Agora:NotebookPage:ΒΖ-48-38\nAgora:NotebookPage:ΒΖ-48-37"			"ΒΖ South 2015, Context 3\nΒΖ South 2015, Context 12\nmartens:2013:b:49\ndaly:2010:b:17"	"909BA096-A83F-4B56-BC2A-CBDB389C0E0A\n86AE83A2-F795-43DB-90A7-6F8278589436\nAgora:Basket:martens:2013:b:49\nAgora:Basket:daly:2010:b:17"					"909BA096-A83F-4B56-BC2A-CBDB389C0E0A\n86AE83A2-F795-43DB-90A7-6F8278589436\nAgora:Basket:martens:2013:b:49\nAgora:Basket:daly:2010:b:17"	http://www.ascsa.edu.gr/index.php/publications/rights-and-permissions-for-using-ascsa-images		Daly 2010 | Context | Room 5 and Room 6 Classical Building | South of Cistern (Daly 2010)	Room 5 and Room 6 Classical Building; South of Cistern (Daly 2010)	Context\n'
                + '	Daly 2010	J/11,13-1/20,2/2	2.995	ENVELOPE(390.715, 392.509, 378.668, 380.694)	Cartesian	MULTIPOLYGON(POLYGON(392.509 379.693, 392.241 379.542, 392.039 379.421, 392.065 379.21, 392.114 378.843, 391.347 378.758, 390.81 378.668, 390.715 378.974, 390.935 379.11, 390.952 379.125, 390.747 380.482, 392.367 380.694, 392.509 379.693))	POINT(51.875,51.996)	GEOMETRYCOLLECTION(POLYGON Z (392.355 380.548 51.912, 391.749 380.413 51.886, 391.575 380.343 51.875, 391.418 380.127 51.896, 391.516 379.637 51.902, 390.935 379.11 51.986, 390.715 378.974 51.981, 390.81 378.668 51.996, 392.105 378.885 51.976, 392.039 379.421 51.933, 392.492 379.693 51.946, 392.355 380.548 51.912), POLYGON Z (392.509 379.693 51.9, 392.367 380.694 51.924, 390.747 380.482 51.938, 391.013 378.721 51.992, 392.114 378.843 51.906, 392.036 379.427 51.908, 392.509 379.693 51.9))					Jun 25 - 29, 2010	Europe/Athens	[2010-06-25T12:00:00Z TO 2010-06-29T12:00:00Z]	Grey-brown fill, moderately packed. This pass reveals several different layers or stroses. At the far east the brown soil seems to dip deeper (a possible pit) which we take separately. The brown elsewhere appears to yield to a harder red in spots (particularly where Pier Foundation 3 intersects with Wall R) and some layers of grey-green perhaps similar to the strip at west found in Basket 16. In general this lower strosis of green--as well as the harder red--appears to have more pottery and charcoal than the grey-brown taken in this basket. Washing this pottery reveals one ostrakon with Xanthippos and several others as well.										0					0	Archived			0			17	Agora:Basket:daly:2010:b:17	en	Athenian Agora Excavations	"ΒΖ South 2015, Context 6\nΒΖ South 2015, Context 12\ndaly:2010:b:16"	Undefined	Agora:NotebookPage:ΒΖ-48-39			"ΒΖ South 2015, Context 12\nUndefined\nUndefined\nΒΖ South 2015, Context 6"	"86AE83A2-F795-43DB-90A7-6F8278589436\nAgora:Basket:daly:2010:b:74\nAgora:Basket:daly:2010:b:19\n9D73E234-D41E-4B46-867A-ECE35D52351C"	daly:2010:b:16	Agora:Basket:daly:2010:b:16			"9D73E234-D41E-4B46-867A-ECE35D52351C\n86AE83A2-F795-43DB-90A7-6F8278589436\nAgora:Basket:daly:2010:b:16"	http://www.ascsa.edu.gr/index.php/publications/rights-and-permissions-for-using-ascsa-images		Daly 2010 | Context | Room 5 and Room 6 Classical Building | South of Cistern (Daly 2010)	Room 5 and Room 6 Classical Building; South of Cistern (Daly 2010)	Context\n';

            var parser = new IdigCsvParser();
            var objects = [];
            parser.parse(fileContent).subscribe(object => {
                expect(object).not.toBe(undefined);
                objects.push(object);
            }, () => {
                fail();
            }, () => {
                expect(objects[0]['resource']['@id']).toEqual("Agora:Basket:daly:2010:b:16");
                expect(objects[0]['resource']['type']).toEqual("Context");
                expect(objects[0]['id']).toEqual("Agora:Basket:daly:2010:b:16");
                expect(objects[1]['resource'].title).toEqual("Room 5 and Room 6 Classical Building; South of Cistern (Daly 2010)");
                expect(objects.length).toEqual(2);
                done();
            });

        });

        it('should abort on syntax errors in file content', (done) => {

            var fileContent  = 'Contributor	Coverage	CoverageSpatial	CoverageSpatialAreaCartesian_double	CoverageSpatialBoundsCartesian_bbox	CoverageSpatialCRS	CoverageSpatialCartesian_rpt	CoverageSpatialElevations_rpt	CoverageSpatialPoints_rpt	CoverageTemporal	CoverageTemporalStart	CoverageTemporal_range	Creator	Date	DateTimeZone	Date_range	Description	Format	FormatDiameter	FormatDiameter_double	FormatDimensions	FormatDimensions_double	FormatHeight	FormatHeight_double	FormatLength	FormatLength_double	FormatLocked	FormatMaximumDimension	FormatMaximumDimension_double	FormatPreservedHeight	FormatPreservedHeight_double	FormatSidelined	FormatStatus	FormatThickness	FormatThickness_double	FormatTrashed	FormatWidth	FormatWidth_double	Identifier	Identifier_uuid	Language	Publisher	Relation	RelationBelongsTo	RelationBelongsTo_uuid	RelationIncludes	RelationIncludes_uuid	RelationIsAbove	RelationIsAbove_uuid	RelationIsBelow	RelationIsBelow_uuid	RelationIsCoevalWith	RelationIsCoevalWith_uuid	Relation_uuid	Rights	Source	Subject	Title	Type\n'
                + '	Daly 2010	J/10,13-1/19,2/2	6.485	ENVELOPE(389.878, 392.499, 378.549, 381.697)	Cartesian	MULTIPOLYGON(POLYGON(390.289 381.684, 390.403 381.582, 390.802 381.32, 391.089 380.979, 391.254 380.932, 391.323 380.965, 391.405 381.091, 391.303 381.515, 391.322 381.524, 391.319 381.536, 391.342 381.532, 391.491 381.599, 391.518 381.503, 391.52 381.503, 391.698 380.955, 391.886 380.931, 391.919 380.93, 392.261 380.838, 392.286 380.851, 392.499 379.686, 392.499 379.686, 392.499 379.685, 392.281 379.527, 392.275 379.524, 392.256 379.51, 392.051 379.381, 392.105 378.914, 392.112 378.868, 392.11 378.868, 392.11 378.867, 392.018 378.851, 390.314 378.549, 389.878 380.081, 389.894 380.09, 389.894 380.09, 390.361 380.394, 389.954 381.237, 389.973 381.36, 389.972 381.439, 390.289 381.697, 390.289 381.684))	POINT(51.884,52.06)	GEOMETRYCOLLECTION(POLYGON Z (392.284 380.832 51.932, 391.919 380.93 51.933, 391.704 380.937 51.947, 391.52 381.503 51.973, 391.319 381.536 51.953, 391.45 381.024 51.894, 391.127 380.873 51.92, 390.865 381.204 51.923, 390.551 381.451 51.955, 390.289 381.684 51.964, 390.289 381.697 51.964, 389.972 381.439 52.06, 389.976 381.205 51.983, 390.382 380.407 51.989, 389.894 380.09 52.002, 390.332 378.564 52.051, 392.11 378.867 52.002, 392.048 379.405 51.969, 392.281 379.527 51.975, 392.499 379.685 51.957, 392.284 380.832 51.932), POLYGON Z (392.286 380.851 51.921, 392.069 380.743 51.913, 391.926 380.926 51.917, 391.675 380.958 51.921, 391.491 381.599 51.919, 391.303 381.515 51.92, 391.405 381.091 51.884, 391.295 380.921 51.894, 391.089 380.979 51.904, 390.802 381.32 51.919, 390.264 381.674 51.981, 389.981 381.408 52.054, 389.954 381.237 51.942, 390.377 380.361 51.941, 389.878 380.081 52.007, 390.314 378.549 52.057, 392.112 378.868 51.981, 392.031 379.369 51.94, 392.256 379.51 51.948, 392.499 379.686 51.947, 392.286 380.851 51.921))					Jun 25, 2010	Europe/Athens	2010-06-25T12:00:00Z	After a light cleaning pass, we open south of the cistern. Our eastern limit is the north-south line between the midpoints of Pier 2 and Pier 3. A morning rain had revealed what looked like a red layer at center that ended at west along a strip of green. We take a light pass to clarify. In 2009 they had taken passes in this area (Basket 4; p. 9061; 4th BC) that stopped somewhat arbitrarily when a level equal to that previously dug at east was reached. It appears that the area at east to which this pass was made equivalent was 2007 Basket 1. Our pass here finds several different layers. At the extreme west there is a band (W. ca. .50m) of green fill (bedrock crushed up in re-use or possible disturbance). At north is a pocket of ash and charcoal amid grey fill. At center a red fill was found. While at southwest a brown and grey area emerged. As the brown and grey appeared to lie atop some of the red, we take it first as Basket 17. We take the ash and grey as Basket 20.										0					0	Archived			0			16	Agora:Basket:daly:2010:b:16	en	Athenian Agora Excavations	"ΒΖ South 2015, Context 3\nΒΖ South 2015, Context 12\nmartens:2013:b:49\ndaly:2010:b:17"	"Undefined\nUndefined"	"Agora:NotebookPage:ΒΖ-48-38\nAgora:NotebookPage:ΒΖ-48-37"			"ΒΖ South 2015, Context 3\nΒΖ South 2015, Context 12\nmartens:2013:b:49\ndaly:2010:b:17"	"909BA096-A83F-4B56-BC2A-CBDB389C0E0A\n86AE83A2-F795-43DB-90A7-6F8278589436\nAgora:Basket:martens:2013:b:49\nAgora:Basket:daly:2010:b:17"					"909BA096-A83F-4B56-BC2A-CBDB389C0E0A\n86AE83A2-F795-43DB-90A7-6F8278589436\nAgora:Basket:martens:2013:b:49\nAgora:Basket:daly:2010:b:17"	http://www.ascsa.edu.gr/index.php/publications/rights-and-permissions-for-using-ascsa-images		Daly 2010 | Context | Room 5 and Room 6 Classical Building | South of Cistern (Daly 2010)	Room 5 and Room 6 Classical Building; South of Cistern (Daly 2010)	Context\n'
                + '	Daly 2010	J/11,13-1/20,2/2	2.995	ENVELOPE(390.715, 392.509, 378.668, 380.694)	Cartesian	MULTIPOLYGON(POLYGON(392.509 379.693, 392.241 379.542, 392.039 379.421, 392.065 379.21, 392.114 378.843, 391.347 378.758, 390.81 378.668, 390.715 378.974, 390.935 379.11, 390.952 379.125, 390.747 380.482, 392.367 380.694, 392.509 379.693))	POINT(51.875,51.996)	GEOMETRYCOLLECTION(POLYGON Z (392.355 380.548 51.912, 391.749 380.413 51.886, 391.575 380.343 51.875, 391.418 380.127 51.896, 391.516 379.637 51.902, 390.935 379.11 51.986, 390.715 378.974 51.981, 390.81 378.668 51.996, 392.105 378.885 51.976, 392.039 379.421 51.933, 392.492 379.693 51.946, 392.355 380.548 51.912), POLYGON Z (392.509 379.693 51.9, 392.367 380.694 51.924, 390.747 380.482 51.938, 391.013 378.721 51.992, 392.114 378.843 51.906, 392.036 379.427 51.908, 392.509 379.693 51.9))					Jun 25 - 29, 2010	Europe/Athens	[2010-06-25T12:00:00Z TO 2010-06-29T12:00:00Z]	Grey-brown fill, moderately packed. This pass reveals several different layers or stroses. At the far east the brown soil seems to dip deeper (a possible pit) which we take separately. The brown elsewhere appears to yield to a harder red in spots (particularly where Pier Foundation 3 intersects with Wall R) and some layers of grey-green perhaps similar to the strip at west found in Basket 16. In general this lower strosis of green--as well as the harder red--appears to have more pottery and charcoal than the grey-brown taken in this basket. Washing this pottery reveals one ostrakon with Xanthippos and several others as well.										0					0	Archived			0			17		en	Athenian Agora Excavations	"ΒΖ South 2015, Context 6\nΒΖ South 2015, Context 12\ndaly:2010:b:16"	Undefined	Agora:NotebookPage:ΒΖ-48-39			"ΒΖ South 2015, Context 12\nUndefined\nUndefined\nΒΖ South 2015, Context 6"	"86AE83A2-F795-43DB-90A7-6F8278589436\nAgora:Basket:daly:2010:b:74\nAgora:Basket:daly:2010:b:19\n9D73E234-D41E-4B46-867A-ECE35D52351C"	daly:2010:b:16	Agora:Basket:daly:2010:b:16			"9D73E234-D41E-4B46-867A-ECE35D52351C\n86AE83A2-F795-43DB-90A7-6F8278589436\nAgora:Basket:daly:2010:b:16"	http://www.ascsa.edu.gr/index.php/publications/rights-and-permissions-for-using-ascsa-images		Daly 2010 | Context | Room 5 and Room 6 Classical Building | South of Cistern (Daly 2010)	Room 5 and Room 6 Classical Building; South of Cistern (Daly 2010)	Context\n';

            var parser = new IdigCsvParser();
            var objects = [];
            parser.parse(fileContent).subscribe(object => {
                expect(object).not.toBe(undefined);
                objects.push(object);
            }, (error) => {
                expect(objects.length).toEqual(1);
                expect(objects[0]['resource']['@id']).toEqual("Agora:Basket:daly:2010:b:16");
                expect(error).toEqual(jasmine.any(SyntaxError));
                expect(error.message).toEqual(M.IMPORTER_FAILURE_MANDATORYCSVFIELDMISSING);
                expect(error.lineNumber).toEqual(2);
                done();
            });

        });

    });
}