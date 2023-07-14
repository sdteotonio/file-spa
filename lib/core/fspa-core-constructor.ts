import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { FSPAConsts } from "../config";
import { LogStyleAndColor, log } from "../log";
const webpack = require("webpack");
class FSPACoreConstructor {
  async start() {
    await this.runWebpack();
    this.createIndexHtml();
  }

  private runWebpack() {
    return new Promise((res, rej) => {
      const compiler = webpack({
        entry: path.resolve(__dirname, "framework", "fspa.core.js"),
        output: {
          filename: FSPAConsts.coreFileName,
          path: path.resolve(__dirname, FSPAConsts.preBuildFolder),
        },
        resolve: {
          extensions: [".js"],
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

          res("");
        });
      });
    });
  }

  private createIndexHtml() {
    const indexHtml = String(
      readFileSync(path.join(FSPAConsts.itemsBuilderFolder, "index.html"))
    );

    const bodyTagClosedIndex = indexHtml.indexOf("</body>");
    if (bodyTagClosedIndex < 0) {
      throw new Error("HTML to be have <body> tag.");
    }

    const htmlBeforeBodyTag = indexHtml.slice(0, bodyTagClosedIndex);

    const scriptFiles = [
      FSPAConsts.coreFileName,
      FSPAConsts.componentsFileName,
    ].map((fl) => `<script src="${fl}"></script>\n`);

    const newHtmlFileContent = htmlBeforeBodyTag
      .concat(...scriptFiles)
      .concat(indexHtml.slice(bodyTagClosedIndex));
    writeFileSync(
      path.join(__dirname, FSPAConsts.preBuildFolder, "index.html"),
      newHtmlFileContent
    );
  }
}

export default new FSPACoreConstructor();
