import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  vscode: any;

  // tslint:disable-next-line: variable-name
  _message = new Subject();

  constructor() {
    // tslint:disable-next-line: no-string-literal
    this.vscode = window['acquireVsCodeApi']();
    window.addEventListener('message', event => {
      const message = event.data; // The JSON data our extension sent
      this._message.next(message);
    });
  }

  get messageFromExtension() {
    return this._message.asObservable();
  }

  reloadExtension() {
    this.vscode.postMessage({
      command: 'reloadExtension'
    });
  }

  showRunningExtensionsView() {
    this.vscode.postMessage({
      command: 'showRunningExtensionsView'
    });
  }

  showPackageJSON(extension: any) {
    this.vscode.postMessage({
      command: 'showPackageJSON',
      extension
    });
  }

  installedExtensions() {
    this.vscode.postMessage({
      command: 'installedExtensions'
    });
  }

  searchExtension(extension: any) {
    this.vscode.postMessage({
      command: 'searchExtension',
      extension
    });
  }

  showExtensionRepository(extension: any) {
    this.vscode.postMessage({
      command: 'showExtensionRepository',
      extension
    });
  }

  showMarketplaceEntry(extension: any) {
    this.vscode.postMessage({
      command: 'showMarketplaceEntry',
      extension
    });
  }

  showExtensionKeybindings(extension: any) {
    this.vscode.postMessage({
      command: 'showExtensionKeybindings',
      extension
    });
  }

  copyExtensionId(extensionId: string) {
    this.vscode.postMessage({
      command: 'copyExtensionId',
      extensionId
    });
  }

  showExtensionSettings(extensionId: string) {
    this.vscode.postMessage({
      command: 'showExtensionSettings',
      extensionId
    });
  }


  openExtensionPath(extensionPath: any) {
    this.vscode.postMessage({
      command: 'openExtensionPath',
      extensionPath
    });
  }

  copyExtensionPath(extensionPath: any) {
    this.vscode.postMessage({
      command: 'copyExtensionPath',
      extensionPath
    });
  }

  exploreExtensionPath(extensionPath: any) {
    this.vscode.postMessage({
      command: 'exploreExtensionPath',
      extensionPath
    });
  }

  exploreExtensionsPath() {
    this.vscode.postMessage({
      command: 'exploreExtensionsPath'
    });
  }

  showMessage(message: string) {
    this.vscode.postMessage({
      command: 'showMessage',
      message
    });
  }

  showErrorMessage(message: string) {
    this.vscode.postMessage({
      command: 'showErrorMessage',
      message
    });
  }

  close() {
    this.vscode.postMessage({
      command: 'close'
    });
  }
}
