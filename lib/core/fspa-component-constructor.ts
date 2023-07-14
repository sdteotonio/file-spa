import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { FSPAConsts, getLocalConfig } from "../config";
import { LogStyleAndColor, log } from "../log";
import { FSPAComponent } from "../models/fspa-items";
import {
  FSPATemplateComponentKeys,
  FSPATemplateReplacerModel,
  templateReplace,
} from "../models/fspa-templates";
import { convertClassName } from "../utils/functions";
import { scannedComponents } from "./fspa-scanner";
const webpack = require("webpack");

class FSPAComponentConstructor {
  scannedComponents: FSPAComponent[] = [];
  async start() {
    log("Start components constructor...");
    this.scannedComponents = scannedComponents;
    if (!this.scannedComponents?.length) {
      throw new Error("Not have components to construct!");
    }
    await this.build();
  }

  private async build() {
    const tempBuildPath = path.join(__dirname, FSPAConsts.preBuildFolder);

    if (existsSync(tempBuildPath)) {
      execSync(`rm -rf ${tempBuildPath}`);
    }

    mkdirSync(tempBuildPath);

    for (const componentConfig of this.scannedComponents) {
      this.buildComponentFile(componentConfig);
    }
  }

  createComponentsBundle() {
    return new Promise((res, rej) => {
      const componentsPaths = this.scannedComponents.map(
        (cConfig) => `./${cConfig.creatorPath}`
      );

      const compiler = webpack({
        entry: componentsPaths,
        output: {
          filename: FSPAConsts.componentsFileName,
          path: path.resolve(__dirname, FSPAConsts.preBuildFolder),
        },
        resolve: {
          extensions: [".ts", ".js"],
        },
        module: {
          rules: [
            {
              test: /\.ts$/,
              use: {
                loader: "ts-loader",
                options: {
                  configFile: "tsconfig.fspa.json",
                },
              },
              exclude: /node_modules/,
            },
          ],
        },
      });
      compiler.run((err, stats) => {
        const error =
          err ||
          (stats?.compilation?.errors?.length
            ? stats?.compilation?.errors
            : null);
        if (error) {
          log(error, LogStyleAndColor.RED);
          return rej(error);
        }
        compiler.close((closeErr) => {
          if (closeErr) log(closeErr, LogStyleAndColor.RED);
          log("Components constructor success!", LogStyleAndColor.GREEN_BOLD);
          return res("");
        });
      });
    });
  }

  private buildComponentFile(componentConfig: FSPAComponent) {
    // "c"VarName is a alias to component.
    const cTemplate: string = String(
      readFileSync(componentConfig.templatePath)
    );
    let cStyle: string = "";
    if (componentConfig.stylePath) {
      cStyle = String(readFileSync(componentConfig.stylePath));
    }
    const cClassContent = String(readFileSync(componentConfig.creatorPath));
    let [className, classContent] = this.getComponentClassParts(cClassContent);

    classContent = this.defineClassExtends(className, classContent);
    classContent = this.defineClassConstructor(classContent);

    const componentTag = `${getLocalConfig().prefix}${convertClassName(
      className
    )}`;

    const componentDataReplacers: FSPATemplateReplacerModel<FSPATemplateComponentKeys>[] =
      [
        {
          key: FSPATemplateComponentKeys.TAG,
          value: componentTag,
        },
        {
          key: FSPATemplateComponentKeys.CLASS_NAME,
          value: className,
        },
        {
          key: FSPATemplateComponentKeys.TEMPLATE,
          value: cTemplate,
        },
        {
          key: FSPATemplateComponentKeys.STYLE,
          value: cStyle,
        },
      ];
    const template = String(
      readFileSync(
        path.join(
          FSPAConsts.templatesFolder,
          FSPAConsts.componentsTemplateFileName
        )
      )
    );
    const templateReplaced = templateReplace<FSPATemplateComponentKeys>(
      componentDataReplacers,
      template
    );
    const componentFileContent = classContent + templateReplaced;
    writeFileSync(componentConfig.creatorPath, componentFileContent);
    log(
      `@Component: <${componentTag}> ${componentConfig.creatorPath.replace(
        FSPAConsts.itemsBuilderFolder,
        ""
      )}`,
      LogStyleAndColor.BLUE_BOLD
    );
  }

  getClassContentBody(classContent: string): string {
    return classContent?.slice(
      classContent.indexOf("{") + 1,
      classContent.lastIndexOf("}")
    );
  }

  private defineClassConstructor(classContent: string): string {
    if (classContent.includes("constructor(")) {
      if (!classContent.includes("super(")) {
        const constructorIndex = classContent.indexOf("constructor");
        const partBelowConstructor = classContent.slice(constructorIndex);
        let constructorValue = partBelowConstructor.slice(
          0,
          partBelowConstructor.indexOf("{") + 1
        );
        classContent = classContent.replace(
          constructorValue,
          constructorValue?.replace("{", "{ \n\tsuper();")
        );
      }
    } else if (!classContent.includes("constructor(")) {
      const partBelowClassKey = classContent.slice(
        classContent.indexOf("class")
      );
      let constructorValue = partBelowClassKey.slice(
        0,
        partBelowClassKey.indexOf("{") + 1
      );
      classContent = classContent.replace(
        constructorValue,
        constructorValue?.replace("{", "{ \n\tconstructor(){\n\tsuper();\n\t}")
      );
    }
    return classContent;
  }
  defineClassExtends(className: string, classContent: string): string {
    if (!classContent.includes("extends")) {
      classContent = classContent.replace(
        className,
        `${className} extends HTMLElement`
      );
    }
    return classContent;
  }

  private getComponentClassParts(cClassContent: string): [string, string] {
    if (!cClassContent) return [null, null];
    let classContent = cClassContent.slice(0, cClassContent.lastIndexOf("}"));
    const className = /class\s+(\w+)/.exec(classContent)[1];

    return [className, classContent];
  }
}

export default new FSPAComponentConstructor();
