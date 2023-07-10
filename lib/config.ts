import { readFileSync } from "fs";
import path from "path";

let config: FSPAConfig;

export interface FSPAConfig {
  webAppName: string;
  prefix: string;
  sourceFolder: string;
  outDir: string;
}

export function getLocalConfig(): FSPAConfig {
  if (!config) {
    throw new Error("Config not loaded!");
  }
  return config;
}

export function loadConfig(webAppName = "") {
  try {
    config = JSON.parse(String(readFileSync("fspa.json")));
    config.webAppName = webAppName;
  } catch (error) {
    throw new Error(`No such file "fspa.json", please create one.`);
  }
}

export const FSPAConsts = {
  webCopyFolder: "web-copy",
  preBuildFolder: "pre-build",
  templatesFolder: path.join(__dirname, "templates"),
  componentsFileName: "components.js",
};
