import {NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { overviewRouting } from './overview.routing';
import { OverviewComponent } from './overview.component';
import { DocumentViewComponent } from './document-view.component';
import { DocumentViewWrapperComponent } from './document-view-wrapper.component';
import { OverviewHomeComponent } from './overview-home.component';
import { DocumentEditWrapperComponent } from './document-edit-wrapper.component';
import { IdaiComponents2Module } from 'idai-components-2/idai-components-2';
import {MapWrapperComponent} from './map-wrapper.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {MapComponent} from "./map/map.component";

@NgModule({
    imports: [
        overviewRouting,
        BrowserModule,
        NgbModule,
        IdaiComponents2Module
    ],
    declarations: [
        OverviewComponent,
        DocumentViewComponent,
        OverviewHomeComponent,
        DocumentEditWrapperComponent,
        DocumentViewWrapperComponent,
        MapWrapperComponent,
        MapComponent
    ],
    providers: [
    ]
})

export class OverviewModule {}