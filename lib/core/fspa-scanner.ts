import { readdirSync } from "fs";
import path from "path";
import { FSPAConfig, FSPAConsts, getLocalConfig } from "../config";
import { LogStyleAndColor, log } from "../log";
import { FSPAComponent } from "../models/fspa-items";
import { ScannGroupFileEnds, ScannGroupFileType } from "../models/scann-group";
export let scannedComponents: FSPAComponent[] = [];

class FSPAScanner {
  fspaConfig: FSPAConfig;

  start() {
    log("Start scanner...");
    this.fspaConfig = getLocalConfig();
    this.scanFolderAndFindItems();
    log("Scanner success!", LogStyleAndColor.GREEN_BOLD);
  }

  private scanFolderAndFindItems(folder?: string) {
    if (FSPAConsts.webCopyFolder.includes(".")) return;
    const folderCompletePath = folder ? folder : `${FSPAConsts.webCopyFolder}`;

    const folderElements = readdirSync(folderCompletePath);
    const mappedComponentsName: string[] = [];

    (folderElements || []).forEach((folderItem) => {
      if (folderItem.includes(".")) {
        const [itemName] = folderItem.split(".");
        // IsFile
        if (
          folderItem.includes(ScannGroupFileType.Component) &&
          !mappedComponentsName.includes(itemName)
        ) {
          // IsComponent
          this.appendComponentToBuild(itemName, folderCompletePath);
          mappedComponentsName.push(itemName);
        } else if (folderItem.includes(ScannGroupFileType.Service)) {
          // IsService
        }
      } else if (!folderItem.includes(".")) {
        this.scanFolderAndFindItems(`${folderCompletePath}/${folderItem}`);
      }
    });
  }

  private appendComponentToBuild(
    componentName: string,
    componentFolder: string
  ) {
    log(
      `@Component: <${componentName}>(${componentFolder})`,
      LogStyleAndColor.BLUE_BOLD
    );
    const componentFiles = readdirSync(componentFolder);
    const componentFactory: FSPAComponent = {
      templatePath: null,
      creatorPath: null,
      componentName,
      newComponentFilename: "",
      stylePath: null,
      tag: `${this.fspaConfig.prefix}-${componentName}`,
    };

    for (const componentFileName of componentFiles) {
      const componentFilePath = `${componentFolder}/${componentFileName}`;
      if (componentFileName.endsWith(ScannGroupFileEnds.ComponentTemplate)) {
        componentFactory.templatePath = componentFilePath;
      } else if (
        componentFileName.endsWith(ScannGroupFileEnds.ComponentStyle)
      ) {
        componentFactory.stylePath = componentFilePath;
      } else if (
        componentFileName.endsWith(ScannGroupFileEnds.ComponentClass)
      ) {
        componentFactory.newComponentFilename = `${componentName}.component.ts`;
        componentFactory.creatorPath = componentFilePath;
      }
    }

    if (componentFactory.creatorPath && componentFactory.templatePath) {
      scannedComponents.push(componentFactory);
    } else {
      throw new Error(
        `Component "${componentName}" must be have class and template!`
      );
    }
  }
  private getRelativeComponentClasspath(componentFilePath: string): string {
    const newPath = componentFilePath
      .replace(
        this.fspaConfig.sourceFolder,
        path.join(__dirname, FSPAConsts.webCopyFolder)
      )
      .replace(".ts", ".js");

    return newPath;
  }
}

export default new FSPAScanner();
