#!/usr/bin/env node

var clc = require("cli-color");
import { Command } from "commander";
import { readFileSync } from "fs";
import { FSPAConfig, getLocalConfig, loadConfig } from "./config";
import componentsConstructor from "./core/fspa-component-constructor";
import copySource from "./core/fspa-copy-source";
import coreConstructor from "./core/fspa-core-constructor";
import scanner from "./core/fspa-scanner";
import servicesConstructor from "./core/fspa-service-constructor";
import { LogStyleAndColor, log } from "./log";

var figlet = require("figlet");
const program = new Command();

const packageFile = require("../package.json");
let appPackageJson;
program.version(packageFile.version);

program
  .command("build")
  .option("-p, --prefix <char>", "App tag prefix to components")
  .description("Build application")
  .action(async (params) => {
    welcomeMessaage();
    appPackageJson = JSON.parse(String(readFileSync("package.json")));
    log(
      `Building application (${appPackageJson.name}@${appPackageJson.version})`
    );
    try {
      loadFspaConfig(paramsToConfigOptions(params));
      await startBuild();
      log(`Build success!`, LogStyleAndColor.GREEN_BOLD);
    } catch (error: any) {
      log(`Error to build File SPA`, LogStyleAndColor.RED);
      log(`${error.message}`, LogStyleAndColor.RED);
    }
  });

program.parse(process.argv);

function paramsToConfigOptions(params: FSPAConfig): Partial<FSPAConfig> {
  const opts: FSPAConfig = {};
  if (params.prefix) {
    opts.prefix = params.prefix;
  }
  return opts;
}

function loadFspaConfig(options?: Partial<FSPAConfig>) {
  log("Loading config...");
  loadConfig(appPackageJson.name, options);
  log(`Sources folder: /${getLocalConfig().sourceFolder}`);
}

function welcomeMessaage() {
  console.log(
    clc.green(
      figlet.textSync("File SPA", {
        font: "Doom",
        horizontalLayout: "default",
        verticalLayout: "default",
      })
    )
  );
}
async function startBuild() {
  copySource.start();
  scanner.start();
  await servicesConstructor.start();
  await componentsConstructor.start();
  await coreConstructor.start();
  copySource.tscWebSource();
  await componentsConstructor.createComponentsBundle();
  copySource.dist();
}
