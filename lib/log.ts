import { format } from "date-fns";
var clc = require("cli-color");
export function log(message: string, colorAndStyle = LogStyleAndColor.CYAN) {
  const now = new Date();
  console.log(
    colorClc[LogStyleAndColor.BLACK_BRIGHT](`[${format(now, "HH:mm:ss")}] -`),
    colorClc[colorAndStyle](`${message}`)
  );
}

export enum LogStyleAndColor {
  CYAN,
  RED,
  GREEN,
  BLUE_UNDERLINE,
  BLUE_BOLD,
  YELLOW,
  BLACK_BRIGHT,
  GREEN_BOLD,
}

const colorClc = {
  [LogStyleAndColor.BLACK_BRIGHT]: clc.blackBright,
  [LogStyleAndColor.YELLOW]: clc.yellow,
  [LogStyleAndColor.CYAN]: clc.cyan,
  [LogStyleAndColor.RED]: clc.red,
  [LogStyleAndColor.GREEN_BOLD]: clc.green.bold,
  [LogStyleAndColor.GREEN]: clc.green,
  [LogStyleAndColor.BLUE_UNDERLINE]: clc.blue.underline,
  [LogStyleAndColor.BLUE_BOLD]: clc.blue.bold,
};
