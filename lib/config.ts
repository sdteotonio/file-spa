import { readFileSync } from "fs";
import path from "path";

let config: FSPAConfig;

export interface FSPAConfig {
  webAppName?: string;
  prefix?: string;
  sourceFolder?: string;
  outDir?: string;
}

export function getLocalConfig(): FSPAConfig {
  if (!config) {
    throw new Error("Config not loaded!");
  }
  return config;
}

export function loadConfig(webAppName = "", options?: Partial<FSPAConfig>) {
  try {
    config = { ...JSON.parse(String(readFileSync("fspa.json"))), ...options };
    config.webAppName = webAppName;
    validateConfig(config);
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export const FSPAConsts = {
  itemsBuilderFolder: "fspa-builder",
  preBuildFolder: "pre-build",
  preDistFolder: "pre-dist",
  templatesFolder: path.join(__dirname, "templates"),
  componentsTemplateFileName: "component.template",
  componentsFileName: "components.js",
  servicesFileName: "services.js",
  coreFileName: "core.js",
};

function validateConfig(config: FSPAConfig) {
  if (!config.prefix)
    throw new Error(
      'The prefix tag is required. Provide one in the "prefix" parameter in fspa.json.'
    );
  if (!config.sourceFolder)
    throw new Error(
      'The source folder is required. Provide one in the "sourceFolder" parameter in fspa.json.'
    );
  if (!config.outDir)
    throw new Error(
      'The out dir is required. Provide one in the "outDir" parameter in fspa.json.'
    );
}
