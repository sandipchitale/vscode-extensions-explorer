import * as fs from 'fs';
import * as path from 'path';
import { AddressInfo } from 'net';
import * as URL from 'url';
import * as http from 'http';

import * as vscode from 'vscode';

let PORT = 4567;

/**
 * Manages webview panels
 */
class WebviewInEditor {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: WebviewInEditor | undefined;

  private static readonly viewType = 'WebviewInEditor';

  private readonly panel: vscode.WebviewPanel;
  private readonly extensionPath: string;
  private readonly builtAppFolder: string;
  private disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionPath: string): WebviewInEditor {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    // If we already have a panel, show it.
    // Otherwise, create Webview in editor panel.
    if (WebviewInEditor.currentPanel) {
      WebviewInEditor.currentPanel.panel.reveal(column);
    } else {
      WebviewInEditor.currentPanel = new WebviewInEditor(extensionPath, column || vscode.ViewColumn.One);
    }
    return WebviewInEditor.currentPanel;
  }

  // private uri: vscode.Uri | undefined = undefined;

  private constructor(extensionPath: string, column: vscode.ViewColumn) {
    this.extensionPath = extensionPath;
    this.builtAppFolder = 'dist';

    // Create and show a new webview panel
    this.panel = vscode.window.createWebviewPanel(WebviewInEditor.viewType, 'Extensions explorer', column, {
      // Enable javascript in the webview
      enableScripts: true,

      retainContextWhenHidden: true,

      // And restrict the webview to only loading content from our extension's `media` directory.
      localResourceRoots: [
        vscode.Uri.file(path.join(this.extensionPath, this.builtAppFolder)),
        vscode.Uri.parse(`http://localhost:${PORT}/`),
      ]
    });

    this.panel.iconPath = vscode.Uri.file(path.join(this.extensionPath, 'images', 'icon.png'));

    // Set the webview's initial html content
    this.panel.webview.html = this._getHtmlForWebview();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage((data: any) => {
        switch (data.command) {
          case 'settings':
            this.settings();
            break;
          case 'reloadExtension':
            this.loadExtensions();
            break;
          case 'showRunningExtensionsView':
              this.showRunningExtensionsView();
              break;
          case 'showPackageJSON':
            this.showPackageJSON(data.extension);
            break;
          case 'installedExtensions':
            this.installedExtensions();
            break;
          case 'searchExtension':
            this.searchExtension(data.extension);
            break;
          case 'showExtensionRepository':
            this.showExtensionRepository(data.extension);
            break;
          case 'showExtensionRepository':
            this.showExtensionRepository(data.extension);
            break;
          case 'showMarketplaceEntry':
            this.showMarketplaceEntry(data.extension);
            break;
          case 'showExtensionKeybindings':
            this.showExtensionKeybindings(data.extension);
            break;
          case 'copyExtensionId':
            this.copyExtensionId(data.extensionId);
            break;
          case 'showExtensionSettings':
            this.showExtensionSettings(data.extensionId);
            break;
          case 'openExtensionPath':
            this.openExtensionPath(data.extensionPath);
            break;
          case 'copyExtensionPath':
            this.copyExtensionPath(data.extensionPath);
            break;
          case 'exploreExtensionsPath':
            this.exploreExtensionsPath();
            break;
          case 'exploreExtensionPath':
            this.exploreExtensionPath(data.extensionPath);
            break;
          case 'showMessage':
            vscode.window.showInformationMessage(data.message);
            break;
          case 'showErrorMessage':
            vscode.window.showErrorMessage(data.message);
            break;
          case 'close':
            break;
        }

      },
      null,
      this.disposables
    );

    vscode.window.onDidChangeActiveColorTheme((colorTheme: vscode.ColorTheme) => {
      this.setColorTheme(colorTheme);
    });

    setTimeout(() => {
      this.loadExtensions();
    }, 1000);
  }

  loadExtensions() {
    let extensions: any[] = [];
    let activeExtensions: any[] = [];
    let inactiveextensions: any[] = [];

    activeExtensions = vscode.extensions.all.filter((extension) => true  === extension.isActive ).map((extension) => {
      (extension as any).active = true;
      (extension as any).name = extension.packageJSON.displayName || extension.packageJSON.name;
      return extension;
    });
    inactiveextensions = vscode.extensions.all.filter((extension) => false === extension.isActive).map((extension) => {
      (extension as any).active = false;
      (extension as any).name = extension.packageJSON.displayName || extension.packageJSON.name;
      return extension;
    });

    activeExtensions.sort((extensionA, extensionB) => {
      return extensionA.name.localeCompare(extensionB.name);
    });

    inactiveextensions.sort((extensionA, extensionB) => {
      return extensionA.name.localeCompare(extensionB.name);
    });

    extensions = [...activeExtensions, ...inactiveextensions];

    extensions.forEach((extension) => {
      try {
        (extension as any).icon = `http://localhost:${PORT}?icon=${vscode.Uri.file(path.join(extension.extensionPath, extension.packageJSON.icon))}`;
      } catch (error) {
        (extension as any).icon = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs';
      }
    });

    this.panel.webview.postMessage({
      command: 'extensionsLoaded',
      extensions
    });
  }

  showRunningExtensionsView() {
    vscode.commands.executeCommand('workbench.action.showRuntimeExtensions');
  }

  async showPackageJSON(extension: any) {
    const packageJSONDoc = await vscode.workspace.openTextDocument({
      language: 'jsonc',
      content: `// package.json for extension ${extension.name}\n${JSON.stringify(extension.packageJSON, null, 2)}`
    });
    vscode.window.showTextDocument(packageJSONDoc, {
      preserveFocus: false,
      preview: false
    });
  }

  installedExtensions() {
    vscode.commands.executeCommand('workbench.extensions.search', `@installed`);
  }

  searchExtension(extension: any) {
    vscode.commands.executeCommand('workbench.extensions.search', `@id:${extension.id}`);
  }

  async showExtensionRepository(extension: any) {
    if (extension.packageJSON.repository) {
      if (typeof extension.packageJSON.repository === 'string') {
        vscode.env.openExternal(vscode.Uri.parse(extension.packageJSON.repository));
      } else {
        vscode.env.openExternal(vscode.Uri.parse(extension.packageJSON.repository.url));
      }
    }
  }

  async showMarketplaceEntry(extension: any) {
    if (extension.packageJSON.repository) {
      vscode.env.openExternal(vscode.Uri.parse(`https://marketplace.visualstudio.com/items?itemName=${extension.id}`));
    }
  }

  async showExtensionKeybindings(extension: any) {
    await vscode.commands.executeCommand('workbench.action.openGlobalKeybindings');
    const keybindingsDoc = await vscode.workspace.openTextDocument({
      language: 'jsonc',
      content: `// ${extension.packageJSON.contributes.keybindings.length} keybindings for extension ${extension.name}\n${JSON.stringify(extension.packageJSON.contributes.keybindings, null, 2)}`
    });
    vscode.window.showTextDocument(keybindingsDoc, {
      preserveFocus: false,
      preview: false,
      viewColumn: vscode.ViewColumn.Beside
    });
  }

  copyExtensionId(extensionId: string) {
    vscode.env.clipboard.writeText(extensionId);
  }

  showExtensionSettings(extensionId: string) {
    vscode.commands.executeCommand('workbench.action.openSettings', `@ext:${extensionId}`);
  }

  openExtensionPath(extensionPath: string) {
    vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(extensionPath), true);
  }

  copyExtensionPath(extensionPath: string) {
    vscode.env.clipboard.writeText(extensionPath);
  }

  exploreExtensionsPath() {
    if (vscode.extensions.all.length > 0 && vscode.extensions.all[0].extensionPath) {
      vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(path.dirname(vscode.extensions.all[0].extensionPath)));
    }
  }

  exploreExtensionPath(extensionPath: string) {
    vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(extensionPath));
  }

  settings() {
    vscode.commands.executeCommand('workbench.action.openSettings', `@ext:sandipchitale.vscode-extensions-explorer`);
  }

  setColorTheme(colorTheme: vscode.ColorTheme) {
    this.panel.webview.postMessage({
      command: 'colorTheme',
      colorTheme
    });
  }

  refreshView() {
    this.panel.webview.postMessage({
      command: 'refreshView'
    });
  }

  public dispose() {
    WebviewInEditor.currentPanel = undefined;

    // Clean up our resources
    this.panel.dispose();

    while (this.disposables.length) {
      const x = this.disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  /**
   * Returns html of the start page (index.html)
   */
  private _getHtmlForWebview() {
    // path to dist folder
    const appDistPath = path.join(this.extensionPath, 'dist');
    const appDistPathUri = vscode.Uri.file(appDistPath);

    // path as uri
    const baseUri = this.panel.webview.asWebviewUri(appDistPathUri);

    // get path to index.html file from dist folder
    const indexPath = path.join(appDistPath, 'index.html');

    // read index file from file system
    let indexHtml = fs.readFileSync(indexPath, { encoding: 'utf8' });

    // update the base URI tag
    indexHtml = indexHtml.replace('<base href="/">', `<base href="${String(baseUri)}/">`);

    return indexHtml;
  }
}

/**
 * Activates extension
 * @param context vscode extension context
 */
export function activate(context: vscode.ExtensionContext) {
  // const app = express();

  // app.get('/', (req, res) => {
  //     if (req.query.icon) {
  //         const filePath = URL.fileURLToPath(req.query.icon as string);
  //         if (fs.existsSync(filePath)) {
  //             if (path.extname(filePath) === '.png') {
  //                 res.sendFile(filePath);
  //             }
  //         }
  //     }
  // });

  // const server = app.listen(() => {
  //   PORT = (server.address() as any).port;
  // });

  const server = http.createServer((req, res) => {
    const url = URL.parse(req.url as string, true);
    if (url.query.icon) {
      const filePath = URL.fileURLToPath(url.query.icon as string);
      if (fs.existsSync(filePath)) {
        const extname = path.extname(filePath).toString();
        if ('.png' === extname || '.gif' === extname) {
          res.writeHead(200);
          fs.createReadStream(filePath).pipe(res);
        }
      }
    }
  }).listen(() => {
    PORT = (server.address() as AddressInfo).port;
  });


  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-extensions-explorer.show-extensions-explorer', () => {
      WebviewInEditor.createOrShow(context.extensionPath);
    })
  );
}
