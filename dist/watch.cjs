var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/watch.js
var import_axios = __toESM(require("axios"), 1);
var path = require("path");
var FormData = require("form-data");
var { spawn } = require("child_process");
require("dotenv").config();
var zapGptConnectUrl = "http://local.zapgptconnect.com.br";
var ls = spawn(process.execPath, ["dist/index.cjs"], {
  cwd: path.resolve(__dirname, ".."),
  stdio: ["inherit", "pipe", "pipe"]
}).on("error", (error) => {
});
ls.stdout.on("data", async (output) => {
  const form = new FormData();
  form.append("output", output);
  const requestConfig = {
    headers: {
      ...form.getHeaders()
    }
  };
  try {
    const response = await import_axios.default.post(`${zapGptConnectUrl}/api/setlog/${process.env.LIGHTSAIL_ID}`, form, requestConfig);
    console.log(`DATA:`);
    console.log(response.data);
  } catch (error) {
    console.log(`ERROR: ${error.message}`);
  }
});
ls.on("close", (code) => {
});
