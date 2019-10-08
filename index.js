#!/usr/bin/env node

const program = require('commander');
const inquirer = require('inquirer');
const chalk = require("chalk");
const pkg = require('./package.json');
const Canvas = require('canvas');
const fs = require("fs");
const boxen = require('boxen');


var app

program
  .version(pkg.version)
  .usage('<command> [options] <app-name> [folder-name]')
  .on("--help", () => {
    console.log(`
  Examples:

    ${chalk.gray("# create a new chrome-extentions project")}
    $ crx-cli create`
    )
  })
  .command('create')
  .description('generate a new chrome-extensions project')
  .action(() => {
    const opts = [{
      type: 'input',
      name: 'appName',
      message: 'Please enter the app name for your project：',
      validate: appName => {
        if (!appName) {
          return '⚠️  app name must not be null！';
        }
        return true;
      }
    }, {
      type: 'input',
      name: 'anthor'
    }, {
      type: 'input',
      name: 'description'
    }];
    inquirer.prompt(opts).then((value) => {
      app = value
      createIcon(app.appName)
      createFiles()
      initializing(pkg)
    })
  });

program.parse(process.argv)

const BOXEN_OPTS = {
  padding: 1,
  margin: 1,
  align: 'center',
  borderColor: '#678491',
  borderStyle: 'round'
};

function initializing(pkg) {
  const messages = [
    `🎉  Welcome to use crx-cli ${chalk.grey(`v${pkg.version}`)} `,
    chalk.grey('https://github.com/liustay/crx-cli')
  ];

  console.log(boxen(messages.join('\n'), BOXEN_OPTS));
}


// 创建菜单栏icon
function createIcon(appName) {
  console.log("Create icon...")
  const canvas = Canvas.createCanvas(48, 48, 'png')
  const ctx = canvas.getContext('2d')
  ctx.beginPath();
  ctx.arc(24, 24, 24, 0, 2 * Math.PI);
  ctx.fillStyle = "green";
  ctx.fill();

  ctx.font = 'bold 30px sans-serif'
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(appName[0].toUpperCase(), 24, 28)
  fs.writeFileSync('icon.png', canvas.toBuffer())
}

// 创建文件
function createFiles() {
  fs.writeFileSync('popup.html', popupPage(app))
  fs.writeFileSync('background.js', backgroundPage(app))
  fs.writeFileSync('manifest.json', manifestPage(app))
}

function popupPage(app) {
  console.log("Create popup...")
  return `<!-- You can create popup page here -->
  <html>
    <head>
      <title>${app.appName}</title>
      <style>
        body {
          width: 200px;
          text-align: center;
          padding: 30px;
          font-size: 20px;
        }
      </style>
    </head>
    <body>
      <p>Welcome,</p>
      <p>This is popup.html.</p>
    </body>
  </html>`
}

function backgroundPage(){
  console.log("Create background...")
  return `/*
    Please run it in chrome://extensions/

    Once App has been loaded, a background page will stay running as long as it is performing an action,
    such as calling a Chrome API or issuing a network request. Additionally, the background page will not
    unload until all visible views and all message ports are closed. Note that opening a view does not cause
    the event page to load, but only prevents it from closing once loaded.
    */
  `
}

function manifestPage(app){
  console.log("Create manifest...")
  return `{
  "name": "${app.appName}",
  "version": "1.0",
  "author": "${app.anthor}",
  "description": "${app.description}",
  "manifest_version": 2,
  "icons": {
    "48": "icon.png"
  },
  "background": {
    "scripts": ["background.js"],
    "persistent": false
  },
  "permissions": [],
  "browser_action": {
    "default_popup": "popup.html"
  },
  "content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self'"
}`
}
