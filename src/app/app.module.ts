import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

// import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
// import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
// import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';

// import { ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
// import { OverlayPanelModule } from 'primeng/overlaypanel';
// import { SelectButtonModule } from 'primeng/selectbutton';
// import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
// import { TooltipModule } from 'primeng/tooltip';
// import { TreeTableModule } from 'primeng/treetable';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SplitButtonModule } from 'primeng/splitbutton';

import { AppService } from './app.service';
import { AppComponent } from './app.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    // BreadcrumbModule,
    ButtonModule,
    CheckboxModule,
    // DialogModule,
    DropdownModule,
    // InputSwitchModule,
    InputTextareaModule,
    InputTextModule,
    // ListboxModule,
    MenuModule,
    // OverlayPanelModule,
    // SelectButtonModule,
    SplitButtonModule,
    TableModule,
    TabViewModule,
    ToggleButtonModule,
    ToolbarModule,
    // TooltipModule,
    // TreeTableModule
    // SplitButtonModule,
  ],
  providers: [
    AppService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
