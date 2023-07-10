import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { FSPAConsts, getLocalConfig } from "../config";

class FSPATCopySource {
  start() {
    this.execCopy();
  }

  private execCopy() {
    try {
      const targetFolder = FSPAConsts.webCopyFolder;

      if (existsSync(targetFolder)) {
        execSync(`rm -rf ${targetFolder}`);
      }
      mkdirSync(targetFolder);

      execSync(`cp -a ${getLocalConfig().sourceFolder}/. ${targetFolder}/`);
    } catch (error: any) {
      throw new Error(String(error.output));
    }
  }
}

export default new FSPATCopySource();
