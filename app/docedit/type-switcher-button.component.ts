import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {Messages} from 'idai-components-2/messages';
import {ConfigLoader, IdaiType} from 'idai-components-2/configuration';

@Component({
    moduleId: module.id,
    selector: 'type-switcher-button',
    templateUrl: './type-switcher-button.html'
})

/**
 * @author Thomas Kleinke
 */
export class TypeSwitcherButtonComponent implements OnChanges{

    @Input() type: string;

    @Output() onTypeChanged: EventEmitter<string> = new EventEmitter<string>();

    private typesTreeList: Array<IdaiType>;

    constructor(private configLoader: ConfigLoader,
                private messages: Messages) {}

    ngOnChanges() {

        this.initializeTypes().catch(msgWithParams => this.messages.add(msgWithParams));
    }

    public isTypeSwitchingPossible(): boolean {

        return this.typesTreeList
            && this.typesTreeList.length > 0
            && this.typesTreeList[0].children
            && this.typesTreeList[0].children.length > 0;
    }

    public chooseType(type: IdaiType) {

        this.type = type.name;
        this.onTypeChanged.emit(type.name);
    }

    private initializeTypes(): Promise<any> {

        return this.configLoader.getProjectConfiguration().then(projectConfiguration => {
            const typeObject: IdaiType = projectConfiguration.getTypesMap()[this.type];
            if (typeObject.parentType) {
                this.typesTreeList = [typeObject.parentType];
            } else {
                this.typesTreeList = [typeObject];
            }
        });
    }

}
