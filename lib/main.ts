#!/usr/bin/env node

var clc = require("cli-color");
import { Command } from "commander";
import { readFileSync } from "fs";
import { getLocalConfig, loadConfig } from "./config";
import componentsConstructor from "./core/fspa-component-constructor";
import copySource from "./core/fspa-copy-source";
import coreConstructor from "./core/fspa-core-constructor";
import scanner from "./core/fspa-scanner";
import { LogStyleAndColor, log } from "./log";

var figlet = require("figlet");
const program = new Command();

const packageFile = require("../package.json");
let appPackageJson;
program.version(packageFile.version);

program
  .command("build")
  .description("Build application")
  .action(async () => {
    welcomeMessaage();
    appPackageJson = JSON.parse(String(readFileSync("package.json")));
    log(
      `Building application (${appPackageJson.name}@${appPackageJson.version})`
    );
    try {
      loadFspaConfig();
      await startBuild();
    } catch (error: any) {
      log(`Error to build File SPA`, LogStyleAndColor.RED);
      log(`${error.message}`, LogStyleAndColor.RED);
    }
  });

program.parse(process.argv);

function loadFspaConfig() {
  log("Loading config...");
  loadConfig(appPackageJson.name);
  log("Config loaded!", LogStyleAndColor.GREEN_BOLD);
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
  await componentsConstructor.start();
  coreConstructor.start();
}
