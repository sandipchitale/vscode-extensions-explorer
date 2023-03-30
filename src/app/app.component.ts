import { AfterViewInit, Component, Inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { TranslateService } from '@ngx-translate/core';

import { AppService } from './app.service';

// import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('main')
  mainElement;

  public busy = false;

  public showFilters = false;

  extensions: any[] = [];

  // extensionCommands: MenuItem[] = [];

  constructor(
    private translate: TranslateService,
    private appService: AppService,
    @Inject(DOCUMENT) private document: Document,
    private ngZone: NgZone) {
    this.translate.setDefaultLang('en');

    this.appService.messageFromExtension.subscribe((message: any) => {
      this.ngZone.run(() => {
        switch (message.command) {
          case 'extensionsLoaded':
            this.extensions = message.extensions;
            break;
          case 'colorTheme':
            this.adjustTheme();
            break;
          case 'refreshView':
            break;
        }
      });
    });

    // this.extensionCommands = [
    //   {
    //     label: 'Show package.json',
    //     icon: 'pi pi-refresh',
    //     command: () => {
    //       //
    //     }
    //   }
    // ];
  }

  ngOnInit(): void {
    // this.rt();
  }

  ngAfterViewInit(): void {
    this.adjustTheme();
  }

  adjustTheme() {
    let theme = 'light-theme';
    if (document.body.classList.contains('vscode-light')) {
      theme = 'light-theme';
    } else if (document.body.classList.contains('vscode-dark')) {
      theme = 'dark-theme';
    }
    const themeLink = this.document.getElementById('app-theme') as HTMLLinkElement;
    if (themeLink) {
        themeLink.href = theme + '.css';
    }
  }

  reloadExtension() {
    this.appService.reloadExtension();
  }

  showRunningExtensionsView() {
    this.appService.showRunningExtensionsView();
  }

  showPackageJSON(extension: any) {
    this.appService.showPackageJSON(extension);
  }

  doesNotHaveSettings(extension: any) {
    if (extension.packageJSON?.contributes?.configuration) {
      return false;
    }
    return true;
  }

  installedExtensions() {
    this.appService.installedExtensions();
  }

  searchExtension(extension: any) {
    this.appService.searchExtension(extension);
  }

  doesNotHaveRepository(extension: any) {
    if (extension.packageJSON?.repository) {
      return false;
    }
    return true;
  }

  showExtensionRepository(extension: any) {
    this.appService.showExtensionRepository(extension);
  }

  showMarketplaceEntry(extension: any) {
    this.appService.showMarketplaceEntry(extension);
  }

  doesNotHaveKeybindings(extension: any) {
    if (extension.packageJSON?.contributes?.keybindings) {
      return false;
    }
    return true;
  }

  showExtensionKeybindings(extension: any) {
    this.appService.showExtensionKeybindings(extension);
  }

  copyExtensionId(extensionId: string) {
    this.appService.copyExtensionId(extensionId);
  }

  showExtensionSettings(extensionId: string) {
    this.appService.showExtensionSettings(extensionId);
  }

  openExtensionPath(extensionPath) {
    this.appService.openExtensionPath(extensionPath);
  }

  copyExtensionPath(extensionPath) {
    this.appService.copyExtensionPath(extensionPath);
  }

  exploreExtensionsPath() {
    this.appService.exploreExtensionsPath();
  }

  exploreExtensionPath(extensionPath) {
    this.appService.exploreExtensionPath(extensionPath);
  }

  close() {
    this.appService.close();
  }
}
