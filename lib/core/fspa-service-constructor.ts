import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { FSPAConsts } from "../config";
import { LogStyleAndColor, log } from "../log";
import { FSPAService } from "../models/fspa-items";
import { convertClassName } from "../utils/functions";
import { scannedServices } from "./fspa-scanner";
const webpack = require("webpack");

class FSPAServiceConstructor {
  scannedServices: FSPAService[] = [];
  async start() {
    return;
    log("Start service constructor...");
    this.scannedServices = scannedServices;
    if (!this.scannedServices?.length) {
      log("Not have services to construct!", LogStyleAndColor.YELLOW);
    }
    await this.build();
  }

  private async build() {
    for (const serviceConfig of this.scannedServices) {
      this.buildServiceFile(serviceConfig);
    }
    await this.tscSercvices();
    await this.createServicesBundle();
    log("Services constructor success!", LogStyleAndColor.CYAN);
  }
  private tscSercvices() {
    return new Promise((res, rej) => {
      const servicePaths = this.scannedServices.map(
        (cConfig) => `./${cConfig.creatorPath}`
      );
      for (const servicePath of servicePaths) {
        execSync(
          `tsc ${servicePath} --outDir ${servicePath.slice(
            0,
            servicePath.lastIndexOf("/")
          )}`
        );
      }
      res("");
    });
  }

  private createServicesBundle() {
    return new Promise((res, rej) => {
      const servicePaths = this.scannedServices.map(
        (cConfig) => `./${cConfig.creatorPath.replace("ts", "js")}`
      );
      const compiler = webpack({
        entry: servicePaths,
        output: {
          filename: FSPAConsts.servicesFileName,
          path: path.resolve(__dirname, FSPAConsts.preBuildFolder),
        },
        resolve: {
          extensions: [".ts", ".js"],
        },
        module: {
          rules: [
            {
              test: /\.ts$/,
              use: "ts-loader",
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
          return res("");
        });
      });
    });
  }

  private buildServiceFile(config: FSPAService) {
    // "c"VarName is a alias to component.
    const cClassContent = String(readFileSync(config.creatorPath));
    if (!cClassContent) return;
    let [className, classContent] = this.getClassParts(cClassContent);

    const componentFileContent =
      classContent?.slice(0, classContent.lastIndexOf("}") + 1) +
      `\n $fspaServiceToken = "${convertClassName(className)}"; \n}`;

    writeFileSync(config.creatorPath, componentFileContent);
    log(
      `@Service: <${className}> ${config.creatorPath.replace(
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

  private getClassParts(cClassContent: string): [string, string] {
    if (!cClassContent) return [null, null];
    let classContent = cClassContent.slice(0, cClassContent.lastIndexOf("}"));
    const className = /class\s+(\w+)/.exec(classContent)[1];

    return [className, classContent];
  }
}

export default new FSPAServiceConstructor();
