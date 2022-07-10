// @ts-nocheck
const controls = require("./controls.js");
const ExcelJS = require('exceljs');
const path = require('path');

const tableInitialCount = 20;
const tableBatchCount = 20;
const defaultTimeoutShort = 2000;
const defaultTimeout = 2000;
const defaultTimeoutLong = 4000;


class MovieAppRobot extends controls.Robot {
    constructor(page){
        super(page);
    }
}

const selectors = {                         
    planAnchorSelectorPath: "navbarTogglerDemo01 > ul > li:nth-child(2) > a",
    shopAnchorSelectorPath: "navbarTogglerDemo01 > ul > li:nth-child(3) > a",

    planningContainerID:    "planner-container",
    shoppingContainerID:    "shop-container"
}
module.exports = {
    MovieAppRobot: MovieAppRobot,
    selectors: selectors
};



