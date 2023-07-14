import { readdirSync } from "fs";
import path from "path";
import { FSPAConfig, FSPAConsts, getLocalConfig } from "../config";
import { LogStyleAndColor, log } from "../log";
import { FSPAComponent, FSPAService } from "../models/fspa-items";
import { ScannGroupFileEnds, ScannGroupFileType } from "../models/scann-group";
export let scannedComponents: FSPAComponent[] = [];
export let scannedServices: FSPAService[] = [];

class FSPAScanner {
  fspaConfig: FSPAConfig;
  mappedComponentsName: string[] = [];
  mappedServicesName: string[] = [];
  start() {
    log("Start scanner...");
    this.fspaConfig = getLocalConfig();
    this.scanFolderAndFindItems();
    this.cleanVariables();
    log("Scanner success!", LogStyleAndColor.GREEN_BOLD);
  }
  cleanVariables() {
    this.mappedComponentsName = [];
    this.mappedServicesName = [];
  }

  private scanFolderAndFindItems(folder?: string) {
    if (FSPAConsts.itemsBuilderFolder.includes(".")) return;
    const folderCompletePath = folder
      ? folder
      : `${FSPAConsts.itemsBuilderFolder}`;

    const folderElements = readdirSync(folderCompletePath);

    (folderElements || []).forEach((folderItem) => {
      if (folderItem.includes(".")) {
        const [itemName] = folderItem.split(".");
        // IsFile
        if (folderItem.includes(ScannGroupFileType.Component)) {
          // IsComponent
          this.appendComponentToBuild(
            itemName,
            folderCompletePath,
            folderElements.filter((fl) =>
              fl.includes(ScannGroupFileType.Component)
            )
          );
        } else if (folderItem.includes(ScannGroupFileType.Service)) {
          // IsService
          this.appendServiceToBuild(
            itemName,
            path.join(folderCompletePath, folderItem)
          );
        }
      } else if (!folderItem.includes(".")) {
        this.scanFolderAndFindItems(`${folderCompletePath}/${folderItem}`);
      }
    });
  }

  private appendServiceToBuild(
    serviceName: string,
    serviceCreatorPath: string
  ) {
    if (this.mappedServicesName.includes(serviceName)) return;
    const fspaService: FSPAService = {
      creatorPath: serviceCreatorPath,
      serviceName,
    };

    if (fspaService.creatorPath && fspaService.serviceName) {
      scannedServices.push(fspaService);
    } else {
      throw new Error(`Service "${serviceName}" must be have class and name!`);
    }
    this.mappedServicesName.push(serviceName);
  }

  private appendComponentToBuild(
    componentName: string,
    componentFolder: string,
    componentFiles: string[]
  ) {
    if (this.mappedComponentsName.includes(componentName)) return;
    const componentFactory: FSPAComponent = {
      templatePath: null,
      creatorPath: null,
      componentName,
      newComponentFilename: "",
      stylePath: null,
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
    this.mappedComponentsName.push(componentName);
  }
}

export default new FSPAScanner();
