import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { FSPAConsts, getLocalConfig } from "../config";

class FSPATCopySource {
  start() {
    this.copyWebSource();
  }
  dist() {
    const config = getLocalConfig();
    try {
      const targetFolder = config.outDir;
      const sourceFolder = path.join(__dirname, FSPAConsts.preBuildFolder);
      if (existsSync(targetFolder)) {
        execSync(`rm -rf ${targetFolder}`);
      }
      mkdirSync(targetFolder);

      execSync(`cp -a ${sourceFolder}/. ${targetFolder}/`);

      if (existsSync(sourceFolder)) {
        // execSync(`rm -rf ${sourceFolder}`);
      }
    } catch (error: any) {
      throw new Error(String(error.output));
    }
  }

  private copyWebSource() {
    try {
      const targetFolder = FSPAConsts.itemsBuilderFolder;

      if (existsSync(targetFolder)) {
        execSync(`rm -rf ${targetFolder}`);
      }
      mkdirSync(targetFolder);

      execSync(`cp -a ${getLocalConfig().sourceFolder}/. ${targetFolder}/`);
    } catch (error: any) {
      throw new Error(String(error.output));
    }
  }

  tscWebSource() {
    const outDir = path.join(__dirname, FSPAConsts.preDistFolder);

    try {
      execSync(
        `tsc --outDir ${FSPAConsts.preDistFolder} --sourceMap false -p tsconfig.fspa.json --listFiles`
      );
    } catch (error: any) {
      throw new Error(String(error.output));
    }
  }
}

export default new FSPATCopySource();
