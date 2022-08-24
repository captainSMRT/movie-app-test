const puppeteer = require('puppeteer');
var controls = require('../MovieAppControls.js');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const selectors = controls.selectors;
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
require("jest-sorted");

let rpa = null;
let browser = null;
let context = null;
let page = null;
let navigationPromise;
let recorder = null;
let pageURL = "http://34.200.255.113/";

const tableInitialCount = 30;
const tableBatchCount = 30;
const defaultTimeout = 1000;
const defaultTimeoutLong = 12000;
const defaultTimeoutVeryLong = 120000;


describe("Movie App e2e test",()=>{
    
    beforeAll(async()=>{
        browser = await puppeteer.launch
        ({
            ignoreHTTPSErrors: true,
            headless: true,
            defaultViewport: null,
            args:
            [
                "--force-device-scale-factor=0.9",
                '--start-maximized',
            ]
        });

        page = await browser.newPage();
        rpa = new controls.MovieAppRobot(page);
        
        await page.setViewport({ width: 1366, height: 768});
    });
    
    afterAll(async()=>{
       await browser.close();
    });
    
    beforeEach(async()=>{
        await page.goto(pageURL);
        recorder = new PuppeteerScreenRecorder(page);
        await recorder.start(`./video/${expect.getState().currentTestName}.mp4`);
        let selectorTarget = rpa.transformIDtoJQueryFormat(selectors.shopAnchorSelectorPath);
        await rpa.page.waitForSelector(selectorTarget);
        
    }); 

    afterEach(async()=> {
        await recorder.stop();
    });

    test(`Test 001`,async()=>{

        let testCaseNumber = "Test 001";
        let stepCounter = 0;

        console.log(`${testCaseNumber} Accessing shopping page...`);
        await rpa.performClick(selectors.shopAnchorSelectorPath, testCaseNumber, ++stepCounter);
        
        console.log(`${testCaseNumber} Validating if at shopping page...`);
        var isAtShoppingPage = await rpa.doesIDExists(selectors.shoppingContainerID);
        expect(isAtShoppingPage, "Shopping page is not loaded").toBe(true);
    });

    test(`Test 002`,async()=>{

        let testCaseNumber = "Test 002";
        let stepCounter = 0;

        console.log(`${testCaseNumber} Accessing Planning page...`);
        await rpa.performClick(selectors.planAnchorSelectorPath, testCaseNumber, ++stepCounter);
        
        console.log(`${testCaseNumber} Validating if at planning page...`);
        var isAtPlanningPage = await rpa.doesIDExists(selectors.planningContainerID);
        expect(isAtPlanningPage, "Planning page is not loaded").toBe(true);
    });
});



