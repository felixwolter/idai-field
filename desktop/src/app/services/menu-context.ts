export type MenuContext = 'default'|'docedit'|'modal'|'projects'|'configuration'|'geometryEdit'|'mapLayersEdit'
    |'georeferenceEdit'|'configurationEdit'|'configurationModal'|'valuelistsManagement';

    
/**
 * @author Thomas Kleinke
 */
export module MenuContext {

    export const DEFAULT = 'default';
    export const DOCEDIT = 'docedit';
    export const MODAL = 'modal';
    export const PROJECTS = 'projects';
    export const CONFIGURATION = 'configuration';
    export const GEOMETRY_EDIT = 'geometryEdit';
    export const MAP_LAYERS_EDIT = 'mapLayersEdit';
    export const GEOREFERENCE_EDIT = 'georeferenceEdit';
    export const CONFIGURATION_EDIT = 'configurationEdit';
    export const CONFIGURATION_MODAL = 'configurationModal';
    export const VALUELISTS_MANAGEMENT = 'valuelistsManagement';
}
