// @ts-nocheck
"use strict";
const tableInitialCount = 20;
const tableBatchCount = 20;
const defaultTimeoutShort = 2500;
const defaultTimeout = 3000;
const defaultTimeoutLong = 4000;

class Robot {

    constructor(page) {
        this.page = page;
    }

    async waitTillHTMLRendered  (timeout = 30000) {
        const checkDurationMsecs = 1000;
        const maxChecks = timeout / checkDurationMsecs;
        let lastHTMLSize = 0;
        let checkCounts = 1;
        let countStableSizeIterations = 0;
        const minStableSizeIterations = 3;
      
        while(checkCounts++ <= maxChecks){
          let html = await this.page.content();
          let currentHTMLSize = html.length; 
      
          let bodyHTMLSize = await this.page.evaluate(() => document.body.innerHTML.length);
      
          if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
            countStableSizeIterations++;
          else 
            countStableSizeIterations = 0; //reset the counter
      
          if(countStableSizeIterations >= minStableSizeIterations) {
            break;
          }
      
          lastHTMLSize = currentHTMLSize;
          await this.page.waitForTimeout(checkDurationMsecs);
        }  
    };
    
    //Find and click elementID 
    async performSelectorClick(elementID, testCaseID, testCaseStep, isRequired=true, timeout=defaultTimeout){
        await this.page.waitForTimeout(timeout);
        
        if(isRequired || await this.page.$(elementID) != null) 
        {
            try {
                await this.page.click(elementID);
            } catch(error) {
                expect(false, `${elementID} cannot be found in the UI`).toBe(true);
            }
        }
        
        await this.page.waitForTimeout(timeout);
    }
    
    // ElementID will transform to jQuery format. Click will be performed after that. 
    async performClick(elementID, testCaseID, testCaseStep, isRequired=true, timeout=defaultTimeout, options = {}){
        var offsetX = options.offsetX ?? 0;
        var offsetY = options.offsetY ?? 0;
        var isOffsetRequired = !(offsetX == 0 && offsetY == 0);
        
        let elementIDTransformed = this.transformIDtoJQueryFormat(elementID);
    
        await this.page.waitForTimeout(timeout);
        
        if(isRequired || await this.page.$(elementIDTransformed) !== null) 
        {
            try {
                if(isOffsetRequired) {
                    const element = await this.page.$(elementIDTransformed);
                    const elementBoundingBox = await element.boundingBox();
                    
                    await this.page.waitForTimeout(defaultTimeout);
                    await this.page.mouse.click(elementBoundingBox.x + elementBoundingBox.width * offsetX, elementBoundingBox.y + elementBoundingBox.height * offsetY);
                } else {
                    await this.page.click(elementIDTransformed);
                }
            } catch(error) {
                expect(false, `${elementID} cannot be found in the UI`).toBe(true);
            }
        }
        
        await this.page.waitForTimeout(timeout);
    }
    
    // ElementID will transform to jQuery format. Click will be performed after that. 
    async  performNClick(elementID, clickCount, testCaseID, testCaseStep, isRequired=true, timeout=defaultTimeout){
        let elementIDTransformed = this.transformIDtoJQueryFormat(elementID);        
        await this.page.waitForTimeout(timeout);
        
        if(isRequired || await this.page.$(elementIDTransformed) !== null) 
        {
            try {
                for(let i = 0; i < clickCount; i++) {
                    await this.page.click(elementIDTransformed);
                    await this.page.waitForTimeout(10);
                    await this.page.click(elementIDTransformed);
                }
            } catch(error) {
                expect(false, `${elementID} cannot be found in the UI`).toBe(true);
            }
        }
        
        await this.page.waitForTimeout(timeout);    
    }

    //[TODO] revisit save button logic, remove this function if performClick or performSelectorClick could be used.
    async performSaveButtonClick(footerButtonsSelector, testCaseID, testCaseStep, timeout=defaultTimeout){        
        let footerButtonsSelectorTransformed = this.transformIDtoJQueryFormat(footerButtonsSelector);
        
        await this.page.waitForTimeout(timeout);
        
        let saveButtonSelector = await this.page.evaluate(function({footerButtonsSelectorTransformed}){
            let saveButtonSelectorFromUI = "";
            document.querySelectorAll(footerButtonsSelectorTransformed).forEach(
                function(footerButton){
                    if (footerButton.innerText.toLowerCase() == "save") {
                        saveButtonSelectorFromUI = footerButton.id;
                        return false;
                    }
                }
            )
            return saveButtonSelectorFromUI;
            //sap.ui.getCore().getElementById("container-finlync.ui5.apps.accounts---detailDetail--page").mAggregations.footer.mAggregations.content[2].firePress()
        },{footerButtonsSelectorTransformed});
        await this.page.waitForTimeout(timeout);
    
        await this.page.click("#" + saveButtonSelector);
    
        await this.page.waitForTimeout(timeout);
    }
    
    //[TODO] revisit delete button logic, remove this function ifconsole.log performClick or performSelectorClick could be used.
    async performDeleteButtonClick(footerButtonsSelector, testCaseID, testCaseStep, timeout=defaultTimeout){    
        let footerButtonsSelectorTransformed = this.transformIDtoJQueryFormat(footerButtonsSelector);
    
        await this.page.waitForTimeout(timeout);
        
        let deleteButtonSelector = await this.page.evaluate(function({footerButtonsSelectorTransformed}){
            let deleteButtonSelectorFromUI = "";
            document.querySelectorAll(footerButtonsSelectorTransformed).forEach(
                function(footerButton){
                    if (footerButton.innerText.toLowerCase() == "delete") {
                        deleteButtonSelectorFromUI = footerButton.id;
                        return false;
                    }
                }
            )
            return deleteButtonSelectorFromUI;
            //sap.ui.getCore().getElementById("container-finlync.ui5.apps.accounts---detailDetail--page").mAggregations.footer.mAggregations.content[3].firePress()
        },{footerButtonsSelectorTransformed});
        await this.page.waitForTimeout(timeout);
    
        await this.page.click("#" + deleteButtonSelector);
    
        await this.page.waitForTimeout(timeout);
    }
    
    //Select radio item in radio container
    async performRadioBtnSelect(radioContainerID, radioIndex, testCaseID, testCaseStep, timeout=defaultTimeout){    
        let radioContainerIDTransformed = this.transformIDtoJQueryFormat(radioContainerID);
        let radioIndexHTML = `${radioContainerIDTransformed} > ul > li:nth-child(${radioIndex + 1})`;
        try {
            await this.page.waitForSelector(radioIndexHTML);
            await this.page.waitForTimeout(timeout);
            await this.page.click(radioIndexHTML);
            await this.page.waitForTimeout(timeout);
        } catch(error) {
            expect(false, `${radioIndexHTML} cannot be found in the UI`).toBe(true);
        }

    }
    
    //Click on popup button. Next, element will be selected. Lastly, popup will be closed.
    async performSelectOptionByKey(popupID, popupBtnID, selectElementKey, testCaseID, testCaseStep, timeout=defaultTimeout) {        
        let popupBtnIDTransformed = this.transformIDtoJQueryFormat(popupBtnID);
        let popupIDTransformed = this.transformIDtoJQueryFormat(popupID);
        
        try {
            await this.page.click(popupBtnIDTransformed);
        } catch {
            expect(false, `${popupID} cannot be found in the UI`).toBe(true);
        }
        await this.page.waitForTimeout(timeout);
    
        let sapSelectElementID = await this.page.evaluate(function({popupIDTransformed, selectElementKey}){
            let sapSelectElementIDFromUI = "";
            document.querySelectorAll(`${popupIDTransformed} > ul > li`).forEach(function(item){
                if(selectElementKey.toLowerCase() == item.innerText.toLowerCase().split("\n")[0].split(" ")[0]){
                    sapSelectElementIDFromUI = item.id;
                    return false; //Act as a break to traditional for loop
                }
            });
            return sapSelectElementIDFromUI;
        },{popupIDTransformed, selectElementKey});
        await this.page.waitForTimeout(timeout);
        if(sapSelectElementID == "") {
            expect(sapSelectElementID, `${selectElementKey} cannot be found in the dropdown list`).not.toBe("");
        }

        sapSelectElementID = this.transformIDtoJQueryFormat(sapSelectElementID);
        try {
            await this.page.click(sapSelectElementID);
        } catch {
            expect(false, `${sapSelectElementID} cannot be found in the UI`).toBe(true);
        }
        await this.page.waitForTimeout(timeout);
    }
    
    //Check if checkbox(es) are checked. If it is not checked, it will be checked now. 
    // Set shouldClickEvenIfChecked to check a checkbox regardless if it is checked or not.
    async performCheckCheckboxes (checkboxIDs, testCaseID, testCaseStep, shouldClickEvenIfChecked=false, timeout=defaultTimeout){
        for(let i = 0; i < checkboxIDs.length; i++) {
        let checkboxIDTransformed = this.transformIDtoJQueryFormat(checkboxIDs[i]);
            await this.page.waitForTimeout(timeout);
            
            let isClassFound = false;
            if(!shouldClickEvenIfChecked) {
                isClassFound = await this.page.evaluate(function({checkboxIDTransformed}){
                    let isClassFoundFromUI = $(checkboxIDTransformed).attr("aria-checked") == "true" || $(checkboxIDTransformed).hasClass("sapMCbMarkChecked");//sapMCbMarkChecked
                    return isClassFoundFromUI;
                }, {checkboxIDTransformed});
                await this.page.waitForTimeout(timeout);
            }
            if(!isClassFound) {
                try {
                    await this.page.click(checkboxIDTransformed);
                } catch(error) {
                    expect(false, `Checkbox ${checkboxIDs[i]} cannot be found in the UI`).toBe(true);
                }
            }
            
            await this.page.waitForTimeout(timeout);
        }
    }
    
    //Click on popup button. Next, elements will be checked based on the key. Lastly, popup will be closed.
    //Key is usually at the start of the string. We can set mustKeyBeInFront to be false to find key regardless of its position.
    async performCheckboxItemsSelect (inputID, popupID, checkboxElementKeys, popupSwitchID, testCaseID, testCaseStep, mustKeyBeInFront = true, timeout=defaultTimeout, itemSuffix="-selectMulti", toClearItems = true){
        
        itemSuffix  = itemSuffix == null ? "" : itemSuffix; 
    
        let inputIDTransformed = this.transformIDtoJQueryFormat(inputID);
        let popupIDTransformed = this.transformIDtoJQueryFormat(popupID);
        let popupSwitchIDTransformed = this.transformIDtoJQueryFormat(popupSwitchID);
    
        let isDisabled = await this.checkIfAttributeNameAndValueExistsInID(inputID, "disabled", "disabled", testCaseID, testCaseStep);
    
        if(isDisabled) {
            return;
        }

        try {
            if(toClearItems){
            //Clear checked checkboxes
                await this.page.focus(inputIDTransformed);
                
                for (let i = 0; i < 100; i++) {
                    await this.page.keyboard.press('Backspace');
                }
                await this.page.waitForTimeout(defaultTimeout);
            }
        } catch(error) {
            expect(false, `Input ${inputID} cannot be found in the UI`).toBe(true);
        }
        try {
            //Open the Popup
            await this.page.click(popupSwitchIDTransformed);
        } catch(error) {
            expect(false, `Popup button ${popupSwitchID} cannot be opened because it cannot be found in the UI`).toBe(true);
        }
        await this.page.waitForTimeout(timeout);
        
        //Mapping UI5.elementKeys to UI5.generatedID e.g. Converting ["SG","AF"] to ["__item713-selectMulti", "__item529-selectMulti"]
        //Reasoning: generatedID is not static, such that it changes each time page is reloaded or popup is re-opened.
        let sapCheckBoxElementIDs = await this.page.evaluate(function({popupIDTransformed, checkboxElementKeys, mustKeyBeInFront, itemSuffix}){
            let sapCheckBoxElementIDsFromUI = [];
            for(let i = 0; i < checkboxElementKeys.length; i++) {
                document.querySelectorAll(`${popupIDTransformed} > ul > li`).forEach(function(item){
                    if(mustKeyBeInFront) {
                        if(checkboxElementKeys[i].toLowerCase() == item.innerText.toLowerCase().split("\n")[0].split(" ")[0]){
                            sapCheckBoxElementIDsFromUI.push(item.id + itemSuffix);
                            return false; //Act as a break to traditional for loop
                        }
                    } else {
                        if(item.innerText.toLowerCase().includes(checkboxElementKeys[i].toLowerCase())){
                            sapCheckBoxElementIDsFromUI.push(item.id+ itemSuffix);
                            return false; //Act as a break to traditional for loop
                        }
                    }
    
                });
            }
            return sapCheckBoxElementIDsFromUI;
        },{popupIDTransformed, checkboxElementKeys, mustKeyBeInFront, itemSuffix});
        await this.page.waitForTimeout(timeout);
        expect(
            sapCheckBoxElementIDs.length, 
            `No checkbox selector(s) found for [${checkboxElementKeys.toString()}]`
        ).toBeGreaterThan(0);
        // expect(
        //     sapCheckBoxElementIDs.length, 
        //     `Some checkbox(es) could not be found. Selectors found for [${checkboxElementKeys.toString()}]: ${sapCheckBoxElementIDs}`
        // ).toBe(checkboxElementKeys.length);
        
        //Selecting the checkboxes
        for(let i = 0; i < sapCheckBoxElementIDs.length; i++) {
            let sapElementIDTransformed =  this.transformIDtoJQueryFormat(sapCheckBoxElementIDs[i]);
            try {
                await this.page.click(sapElementIDTransformed);
            } catch(error) {
                expect(false, `Checkbox ${sapCheckBoxElementIDs[i]} cannot be found in the UI`).toBe(true);
            }
        }
        await this.page.waitForTimeout(timeout);
        
        //Close the popup
        try {
            await this.page.click(popupSwitchIDTransformed);
        } catch(error) {
            expect(false, `Popup button ${popupSwitchID} cannot be closed because it cannot be found in the UI`).toBe(true);
        }
        
        await this.page.waitForTimeout(timeout);
    }
    
    async performCheckboxItemsClear (inputID, testCaseID, testCaseStep) {
        let inputIDTransformed = this.transformIDtoJQueryFormat(inputID);
        await this.page.focus(inputIDTransformed);
                
        for (let i = 0; i < 100; i++) {
            await this.page.keyboard.press('Backspace');
        }
        await this.page.waitForTimeout(defaultTimeout);
    }

    //Type something into the search bar. Click on search after that.
    async performSearchBarOnSearch(searchBarID, searchBtn, searchTerm, testCaseID, testCaseStep, timeout=defaultTimeout, options={}) {
        let toClearSearchBar = options.toClearSearchBar ? true : false;
        let searchBarIDTransformed = this.transformIDtoJQueryFormat(searchBarID);
        let searchButtonIDTransformed = this.transformIDtoJQueryFormat(searchBtn);
        searchTerm = searchTerm.trim();

        if(toClearSearchBar) {
            const textInput = await this.page.$(searchBarIDTransformed);
            await textInput.press('Backspace');      //https://github.com/puppeteer/puppeteer/issues/1648  | user: liorur
            await textInput.click({ clickCount: 3 }) //https://stackoverflow.com/questions/52631057/how-to-delete-existing-text-from-input-using-puppeteer
            await textInput.press('Backspace'); 
        }
        
        await this.page.waitForTimeout(timeout);
    
        try {
            await this.page.type(searchBarIDTransformed, searchTerm);
        } catch(error) {
            expect(false, `Searchbar ${searchBarID} cannot be found in the UI`).toBe(true);
        }
        await this.page.waitForTimeout(timeout);
        // await this.page.evaluate(function({searchBarID, searchTerm}){
        //     sap.ui.getCore().getElementById(searchBarID).setValue(searchTerm);
        // },{searchBarID, searchTerm});
        //await this.page.waitForTimeout(timeout);

        try {
            await this.page.click(searchButtonIDTransformed);
        } catch(error) {
            expect(false, `Button ${searchBtn} cannot be found in the UI`).toBe(true);
        }
        await this.page.waitForTimeout(timeout);
        // await this.page.evaluate(function({searchBarID}){
        //     sap.ui.getCore().getElementById(searchBarID).Search();
        // }, {searchBarID});
        //await this.page.waitForTimeout(timeout);
    }
    
    //Type something into the text bar. 
    //isSelectingFromPopupFirstCheckbox can be set to true if there will exist a popup with checkbox after typing something
    async performTextOnChange(textBarID, text, testCaseID, testCaseStep, isSelectingFromPopupFirstCheckbox = false, toPressEnterKey= false, timeout=defaultTimeout, delayDuration=1000) {
        text = text.toString();
        let textBarIDTransformed = this.transformIDtoJQueryFormat(textBarID);
    
        await this.page.waitForTimeout(timeout);
    
        try {
            const textInput = await this.page.$(textBarIDTransformed);
            await textInput.press('Backspace');      //https://github.com/puppeteer/puppeteer/issues/1648  | user: liorur
            await textInput.click({ clickCount: 3 }) //https://stackoverflow.com/questions/52631057/how-to-delete-existing-text-from-input-using-puppeteer
            await textInput.type(text, {delay: delayDuration});
        
            // await this.page.type(textBarIDTransformed, text);
            if(isSelectingFromPopupFirstCheckbox){
                await this.page.waitForTimeout(timeout);
                await textInput.press("ArrowDown");
                await textInput.press("Enter");
            } 
            if (toPressEnterKey) {
                await this.page.waitForTimeout(timeout);
                await textInput.press("Enter");
            }        
            await this.page.waitForTimeout(timeout);
        } catch(error) {
            expect(false, `Textbar ${textBarID} cannot be found in the UI`).toBe(true);
        }

    }
    
    //Change date. Require a date, and a calendarPicker. See Balances test case for an example.
    async performDateOnChange(oCalendarPicker, dateID, date, testCaseID, testCaseStep, isDatePickerClosed = true, timeout=defaultTimeout) {
        await this.page.waitForTimeout(timeout);
    
        let dateIDTransformed = this.transformIDtoJQueryFormat(dateID);
        let datePickerIDTransformed = this.transformIDtoJQueryFormat(oCalendarPicker.datePickerID);
    
        let dayPickerDisplayIDTransformed = this.transformIDtoJQueryFormat(oCalendarPicker.dayPickerDisplayID);
    
        let monthPickerIDTransformed = this.transformIDtoJQueryFormat(oCalendarPicker.monthPickerID);
        let monthPickerDisplayIDTransformed = this.transformIDtoJQueryFormat(oCalendarPicker.monthPickerDisplayID);
    
        let yearPickerIDTransformed = this.transformIDtoJQueryFormat(oCalendarPicker.yearPickerID);
        let yearRangePickerDisplayIDTransformed = this.transformIDtoJQueryFormat(oCalendarPicker.yearRangePickerDisplayID);
        let yearPickerDisplayIDTransformed = this.transformIDtoJQueryFormat(oCalendarPicker.yearPickerDisplayID);
        
        let oDate = new Date(date);
        expect(oDate.toString(), `Date is not valid: ${date}`).not.toBe("Invalid Date");
        
        let yearFromDate = oDate.getFullYear();
        let monthFromDate = oDate.toLocaleString('default', { month: 'long' });
        let dayFromDate = oDate.getDate();
    
        if(isDatePickerClosed)  {
            try {
                await this.page.click(datePickerIDTransformed);
            } catch(error) {
                expect(false, `Date-Picker ${datePickerIDTransformed} cannot be found in the UI`).toBe(true);
            }
            await this.page.waitForTimeout(timeout);
        }
    
        try {
            await this.page.click(yearPickerIDTransformed);
            await this.page.waitForTimeout(timeout);
            await this.page.click(yearPickerIDTransformed);
            await this.page.waitForTimeout(timeout);
        } catch(error) {
            expect(false, `Year-Picker ${yearPickerIDTransformed} cannot be found in the UI`).toBe(true);
        }

        let yearRangeSelectorID = await this.page.evaluate(function({yearRangePickerDisplayIDTransformed, yearFromDate}){
            let yearRangeSelectorIDFromUI = "";
            document.querySelectorAll(`${yearRangePickerDisplayIDTransformed} > div > div`).forEach(function (yearRange) {
                let startYear = parseInt(yearRange.innerText.split(" ")[0]);
                let endYear = parseInt(yearRange.innerText.split(" ")[2]);
    
                if(yearFromDate >= startYear && yearFromDate <= endYear){
                    yearRangeSelectorIDFromUI = yearRange.id;
                    return false;
                }
    
            });
            return yearRangeSelectorIDFromUI;
        }, {yearRangePickerDisplayIDTransformed, yearFromDate})
        await this.page.waitForTimeout(timeout);
        expect(yearRangeSelectorID, `Year-Range-Picker ${oCalendarPicker.yearRangePickerDisplayID} cannot be found in the UI`).not.toBe(""); 
        
        yearRangeSelectorID = this.transformIDtoJQueryFormat(yearRangeSelectorID);
        try {
            await this.page.click(yearRangeSelectorID);
        } catch(error) {
            expect(yearRangeSelectorID, `Year-Range-Selector ${yearRangeSelectorID} cannot be found in the UI`).not.toBe(true);
        }
        await this.page.waitForTimeout(timeout);
    
        let yearSelectorID = await this.page.evaluate(function({yearPickerDisplayIDTransformed, yearFromDate}){
            let yearSelectorIDFromUI = "";
            document.querySelectorAll(`${yearPickerDisplayIDTransformed} > div > div`).forEach(function (year) {
                if(year.innerText == yearFromDate) {
                    yearSelectorIDFromUI = year.id;
                    return false;
                }
            });
            return yearSelectorIDFromUI;
        }, {yearPickerDisplayIDTransformed, yearFromDate})
        await this.page.waitForTimeout(timeout);
        expect(yearSelectorID, `Year-Picker ${oCalendarPicker.yearPickerDisplayID} cannot be found in the UI`).not.toBe(""); 

        yearSelectorID = this.transformIDtoJQueryFormat(yearSelectorID);
        try {
            await this.page.click(yearSelectorID);
        } catch(error) {
            expect(false, `Year-Selector ${yearSelectorID} cannot be found in the UI`).toBe(true);
        }
        await this.page.waitForTimeout(timeout);

        try {
            await this.page.click(monthPickerIDTransformed);
        } catch(error) {
            expect(false, `Month-Picker ${monthPickerIDTransformed} cannot be found in the UI`).toBe(true);
        }
        await this.page.waitForTimeout(timeout);
    
        let monthSelectorID = await this.page.evaluate(function({monthPickerDisplayIDTransformed, monthFromDate}){
            let monthSelectorIDFromUI = "";
            document.querySelectorAll(`${monthPickerDisplayIDTransformed} > div > div`).forEach(function (month) {
                if(month.innerText == monthFromDate) {
                    monthSelectorIDFromUI = month.id;
                    return false;
                }
            });
            return monthSelectorIDFromUI;
        }, {monthPickerDisplayIDTransformed, monthFromDate})
        await this.page.waitForTimeout(timeout);
        expect(monthSelectorID, `Month-Picker ${oCalendarPicker.monthPickerDisplayID} cannot be found in the UI`).not.toBe(""); 

        monthSelectorID = this.transformIDtoJQueryFormat(monthSelectorID);
        try {
            await this.page.click(monthSelectorID);
        } catch(error) {
            expect(false, `Month-Selector ${monthSelectorID} cannot be found in the UI`).toBe(true);
        }
        await this.page.waitForTimeout(timeout);
    
        let daySelectorID = await this.page.evaluate(function({dayPickerDisplayIDTransformed, dayFromDate}){
            let daySelectorIDFromUI = "";
            let found = false;
            document.querySelectorAll(`${dayPickerDisplayIDTransformed} > div > div[data-sap-day]`).forEach(function (day) {
                if(!found && day.innerText == dayFromDate) {
                    daySelectorIDFromUI = day.id;
                    found = true;
                }
            });
            return daySelectorIDFromUI;
        }, {dayPickerDisplayIDTransformed, dayFromDate})
        await this.page.waitForTimeout(timeout);
        expect(daySelectorID, `Day-Picker ${oCalendarPicker.dayPickerDisplayID} cannot be found in the UI`).not.toBe(""); 

        daySelectorID = this.transformIDtoJQueryFormat(daySelectorID);
        try {
            await this.page.click(daySelectorID);
        } catch(error) {
            expect(false, `Day-Selector ${daySelectorID} cannot be found in the UI`).toBe(true);
        }
        await this.page.waitForTimeout(timeout);
    }
    
    //Get current value in textbar/textfield
    async retrieveValueFromText(textBarID, testCaseID, testCaseStep, timeout=defaultTimeout) {
        await this.page.waitForTimeout(timeout);
    
        let textBarIDTransformed = this.transformIDtoJQueryFormat(textBarID);

        try {
            await this.page.waitForSelector(textBarIDTransformed);
        } catch(error) {
            expect(false, `${textBarID} cannot be found in the UI`).toBe(true);
        }
    
        let value = await this.page.evaluate(function({textBarIDTransformed}){
            let textValue = $(textBarIDTransformed).val();
            return textValue;
        },{textBarIDTransformed});
    
        // let value = await this.page.evaluate(function({textBarID}){
        //     return sap.ui.getCore().getElementById(textBarID).mProperties.value;
        // },{textBarID});
        
        await this.page.waitForTimeout(timeout); 
        return value;
    }

    async retrieveValueFromNonInput(textBarID, testCaseID, testCaseStep, timeout=defaultTimeout) {
        await this.page.waitForTimeout(timeout);
    
        let textBarIDTransformed = this.transformIDtoJQueryFormat(textBarID);
    
        try {
            await this.page.waitForSelector(textBarIDTransformed);
        } catch(error) {
            expect(false, `${textBarID} cannot be found in the UI`).toBe(true);
        }

        let value = await this.page.evaluate(function({textBarIDTransformed}){
            let textValue = $(textBarIDTransformed).text();
            return textValue;
        },{textBarIDTransformed});
    
        // let value = await this.page.evaluate(function({textBarID}){
        //     return sap.ui.getCore().getElementById(textBarID).mProperties.value;
        // },{textBarID});
        
        await this.page.waitForTimeout(timeout); 
        return value;
    }
    
    //Get data information from date picker
    async retrieveDateInformationFromDatePicker(oDatePicker, testCaseID, testCaseStep, configuration = {}) {
        const timeout = configuration.timeout ?? defaultTimeout;
        const openDatePickerID = configuration.openDatePickerID ?? "";
        const closeDatePickerID = configuration.closeDatePickerID ?? "";
        let oDateInformation = {};
        if(openDatePickerID) {
            await this.performClick(openDatePickerID, testCaseID, testCaseStep);
        }

        let month = await this.retrieveValueFromNonInput(oDatePicker.monthPickerID, testCaseID, testCaseStep);
        //let day = dayPickerDisplayID sapUiCalItemSel;
        let year = await this.retrieveValueFromNonInput(oDatePicker.yearPickerID, testCaseID, testCaseStep);
        oDateInformation = {month: month, year: year};


        if(closeDatePickerID) {
            await this.performClick(openDatePickerID, testCaseID, testCaseStep);
        }

        return oDateInformation;
    }
    //Get current date from date field/picker
    async retrieveDateFromDatePicker(datePickerID, testCaseID, testCaseStep, timeout=defaultTimeout) {
        await this.page.waitForTimeout(timeout);
    
        let datePickerIDTransformed = this.transformIDtoJQueryFormat(datePickerID);
    
        try {
            await this.page.waitForSelector(datePickerIDTransformed);
        } catch(error) {
            expect(false, `Date Picker ${datePickerIDTransformed} cannot be found in the UI`).toBe(true);
        }

        let value = await this.page.evaluate(function({datePickerIDTransformed}){
            let textValue = $(datePickerIDTransformed).val();
            return textValue;
        },{datePickerIDTransformed});
    
        // let value = await this.page.evaluate(function({datePickerID}){
        //     return sap.ui.getCore().getElementById(datePickerID).mProperties.value;
        // },{datePickerID});
        
        await this.page.waitForTimeout(timeout); 
        return value;
    }
    
    //Get current key value from dropdown/select
    async retrieveKeyFromSelect(selectID, testCaseID, testCaseStep, timeout=defaultTimeout) {
        await this.page.waitForTimeout(timeout);
    
        let selectIDTransformed = this.transformIDtoJQueryFormat(selectID);
    
        try {
            await this.page.waitForSelector(selectIDTransformed);
        } catch(error) {
            expect(false, `Select ${selectID} cannot be found in the UI`).toBe(true);
        }

        let key = await this.page.evaluate(function({selectIDTransformed}){
            let textValue = $(selectIDTransformed).text();
            let keyFromTextValue = textValue.split(" ")[0].split("\n")[0];
            return keyFromTextValue;
        },{selectIDTransformed});
    
        // let value = await this.page.evaluate(function({selectID}){
        //     return sap.ui.getCore().getElementById(selectID).mProperties.selectedKey;
        // },{selectID});
        
        await this.page.waitForTimeout(timeout); 
        return key;
    }
    
    async displayAllTableElements(sapTableID, testCaseID, testCaseStep, triggerID=null, maxPageSize = -1, timeout=defaultTimeoutShort, busyIndicatorID= null) {        
        let busyIndicatorTransformed = busyIndicatorID == null ? null : this.transformIDtoJQueryFormat(busyIndicatorID);

        await this.page.waitForTimeout(timeout);
        let sapTableIDTransformed = this.transformIDtoJQueryFormat(sapTableID);

        try {
            await this.page.waitForSelector(sapTableIDTransformed);
        } catch(error) {
            expect(false, `Table ${sapTableID} cannot be found in the UI`).toBe(true);
        }

        let accountsFilteredCount = await this.getTableSizeCount(sapTableID, testCaseID, testCaseStep+".1");
        let numberOfRefresh =  Math.floor(accountsFilteredCount / tableBatchCount);
    
        numberOfRefresh = (maxPageSize != -1 && numberOfRefresh > maxPageSize)  ? maxPageSize : numberOfRefresh;
    
        await this.page.evaluate(function({sapTableID}){
            sap.ui.getCore().getElementById(sapTableID).scrollToIndex(0);
        },{sapTableID});
        
        for(let i = 0 ; i < numberOfRefresh; i++){
            if(triggerID == null) {
                await this.page.evaluate(function({sapTableID, tableBatchCount, i}){
                    sap.ui.getCore().getElementById(sapTableID).scrollToIndex(tableBatchCount * (i+1) + 1);
                },{sapTableID, tableBatchCount, i});

            } else {
                await this.performClick(triggerID, testCaseID, ++testCaseStep, false);
            }
            await this.page.waitForTimeout(defaultTimeout);
            if (busyIndicatorTransformed != null) 
            {
                await this.page.waitForSelector(busyIndicatorTransformed,{hidden: true, timeout: 65000});
            } 
            //await this.page.waitForFunction(`!document.querySelector('${sapTableIDTransformed} .sapUiLocalBusy')`);
        }
    
        return accountsFilteredCount;
    }
    
    async getTableSizeCount(sapTableID, testCaseID, testCaseStep, timeout=defaultTimeout) {
        await this.page.waitForTimeout(timeout);
    
        try {
            let sapTableIDTransformed = this.transformIDtoJQueryFormat(sapTableID);
            await this.page.waitForSelector(sapTableIDTransformed);
        } catch(error) {
            expect(false, `Table ${sapTableID} cannot be found in the UI`).toBe(true);
        }

        let tableSize = await this.page.evaluate(function({sapTableID}){
            let tableSize = sap.ui.getCore().getElementById(sapTableID).getMaxItemsCount();
            return !isNaN(tableSize) ? parseInt(tableSize) : -1;
        },{sapTableID});
        await this.page.waitForTimeout(timeout);
        return tableSize;
    }
    
    async retrieveAttributeFromElement(elementID, attributeName, testCaseID, testCaseStep, timeout=defaultTimeout) {
        await this.page.waitForTimeout(timeout);
    
        let elementIDTransformed = this.transformIDtoJQueryFormat(elementID);

        try {
            await this.page.waitForSelector(elementIDTransformed);
        } catch(error) {
            expect(false, `${elementID} cannot be found in the UI`).toBe(true);
        }

        let value = await this.page.evaluate(function({elementIDTransformed, attributeName}){
            let value = $(elementIDTransformed).attr(attributeName);
            return value;
        }, {elementIDTransformed, attributeName});
        await this.page.waitForTimeout(timeout);
    
        return value;
    }
    
    async retrieveStyleValueFromElement(elementID, styleName, testCaseID, testCaseStep, timeout=defaultTimeout) {
        await this.page.waitForTimeout(timeout);
    
        let elementIDTransformed = this.transformIDtoJQueryFormat(elementID);
    
        let value = await this.page.evaluate(function({elementIDTransformed, styleName}){
            let value = $(elementIDTransformed).css(styleName);
            return value;
        }, {elementIDTransformed, styleName});
        await this.page.waitForTimeout(timeout);
    
        return value;
    }

    async checkIfAttributeNameAndValueExistsInID(elementID, attributeName, attributeValue, testCaseID, testCaseStep, timeout=defaultTimeout) {
        await this.page.waitForTimeout(timeout);
    
        let elementIDTransformed = this.transformIDtoJQueryFormat(elementID);
    
        let isFound = await this.page.evaluate(function({elementIDTransformed, attributeName, attributeValue}){
            let isFound = $(elementIDTransformed).attr(attributeName) == attributeValue;
            return isFound;
        }, {elementIDTransformed, attributeName, attributeValue});
        await this.page.waitForTimeout(timeout);
    
        return isFound;
    }
    
    async captureScreenshot(screenshotPath) {
        //UI Flicker issue: https://stackoverflow.com/questions/68059664/puppeteer-page-screenshot-resizes-viewport
        //Documentation: https://github.com/puppeteer/puppeteer/blob/main/docs/api.md
        
        if(screenshotPath.length > 30) {
    
        } else {
            await this.page.screenshot({path: screenshotPath, captureBeyondViewport: false});
        }
    
    }
    
    async refreshPage(navigationPromise, url) {
        await this.page.goto(url);
    
        await navigationPromise;
        await this.waitTillHTMLRendered();
        await this.page.content();
    }
    async doesIDExists(idVal, timeout=defaultTimeout){
        idVal = this.transformIDtoJQueryFormat(idVal);
        await this.page.waitForTimeout(timeout);
    
        let isIDFound = await this.page.evaluate(function({idVal}){
            let isIDFound = $(idVal).length != 0;
            return isIDFound;
        }, {idVal});
        await this.page.waitForTimeout(timeout);
        
        return isIDFound;
    }
    
    async doesIDContainsClass(idVal, classVal, timeout=defaultTimeout){
        idVal = this.transformIDtoJQueryFormat(idVal);
        await this.page.waitForTimeout(timeout);
    
        let isClassFound = await this.page.evaluate(function({idVal, classVal}){
            let isClassFoundFromUI = $(idVal).hasClass(classVal);
            return isClassFoundFromUI;
        }, {idVal, classVal});
        await this.page.waitForTimeout(timeout);
        
        return isClassFound;
    }
    
    async clickTableAtIndex(tableID, index, testCaseNumber, stepCounter, columnNumber = -1){
        let tableRowID = -1;
        let tableIDTransformed = this.transformIDtoJQueryFormat(tableID);
    
        tableRowID = await this.page.evaluate(
            function({tableIDTransformed, index, columnNumber}){
                let tableRows = null;
                if(columnNumber == -1) {
                    tableRows = $(`${tableIDTransformed} > tbody > tr.sapMListTblRow:nth-child(${index + 1}`);
                    return tableRows[index].id;
                }  else {
                    console.log(`${tableIDTransformed} > tbody > tr.sapMListTblRow:nth-child(${index + 1}) > td:nth-child(${2 + columnNumber})`);
                    let columnIDAtRowIndex = $(`${tableIDTransformed} > tbody > tr.sapMListTblRow:nth-child(${index + 1}) > td:nth-child(${2 + columnNumber})`)[0].id;
                    return columnIDAtRowIndex;
                } 
                
            }, {tableIDTransformed, index, columnNumber });
        await this.page.waitForTimeout(defaultTimeout);
        await this.performClick(tableRowID, testCaseNumber, ++stepCounter);
    }
    
    async retrieveTableHeadersAndIndex(tableID, specificHeaders = [], isGroupHeaderExist = false){
        let tableHeadersAndIndex = {};
        let tableIDTransformed = this.transformIDtoJQueryFormat(tableID);
        
        tableHeadersAndIndex = await this.page.evaluate(
            function({tableIDTransformed, specificHeaders, isGroupHeaderExist }){
                let tableHeadersAndIndex = {};
                let tableHeaders = $(`${tableIDTransformed} > thead > tr >th.sapMListTblHeaderCell`);
                for(let i = 0; i < tableHeaders.length; i++) {
                    let tableHeader = tableHeaders[i].innerText;
                    
                    if(specificHeaders.length > 0 && !specificHeaders.includes(tableHeader)) {
                        continue;
                    }
    
                    if (tableHeadersAndIndex[tableHeader] == undefined) {
                        tableHeadersAndIndex[tableHeader] = {index: i, type: "header"};
                    } else {
                        tableHeadersAndIndex[tableHeader] = {index: i, type: "header", hasDuplicates: true};
                    }
                }
    
                let tableSideHeaders = !isGroupHeaderExist 
                                            ? $(`${tableIDTransformed} > tbody > tr.sapMListTblSubRow:nth-child(2) >  td > .sapMListTblSubCnt .sapMListTblSubCntHdr`)
                                            : $(`${tableIDTransformed} > tbody > tr.sapMListTblSubRow:nth-child(3) >  td > .sapMListTblSubCnt .sapMListTblSubCntHdr`)
                for(let i = 0; i < tableSideHeaders.length; i++) {
                    let tableHeader = tableSideHeaders[i].innerText;
                    
                    if(specificHeaders.length > 0 && !specificHeaders.includes(tableHeader)) {
                        continue;
                    }
                    
                    if (tableHeadersAndIndex[tableHeader] == undefined) {
                        tableHeadersAndIndex[tableHeader] = {index: i, type: "aside"};
                    } else {
                        tableHeadersAndIndex[tableHeader] = {index: i, type: "aside", hasDuplicates: true};
                    }
                }
                return tableHeadersAndIndex;
            }, {tableIDTransformed , specificHeaders, isGroupHeaderExist });
        await this.page.waitForTimeout(defaultTimeout);
    
        return tableHeadersAndIndex;
    }
    
    async retrieveValuesByIndexAndHeaderType(tableID, index, headerType, valueType, retrieveGroup=false, groupGap = 2){
        let values = [];
        let tableIDTransformed = this.transformIDtoJQueryFormat(tableID);
        
        values = await this.page.evaluate(
            function({tableIDTransformed, index, headerType, valueType, retrieveGroup, groupGap}){
                let values = [];
    
                let groupHeaders = retrieveGroup ? $(`${tableIDTransformed} > tbody > tr.sapMGHLI`).map(function(){ return this.innerText.split("\n")[0] }).get() : [];
                groupHeaders.unshift(null);
                if(headerType == "header") {
                    let tableRows = $(`${tableIDTransformed} > tbody > tr.sapMListTblRow`);
                    for(let i = 0; i < tableRows.length; i++) {
                        let rowValueByIndex = retrieveGroup ? {} : "";
                        let fullMonetaryText = "";
                        let monetaryTransformed = "";
                        switch(valueType) {
                            case("text"):
                                rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblCell")[index].innerText;
                                break;
                            case("hyperlink"):
                                rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblCell .sapMObjStatusText")[index].innerText;
                                break;
                            case("code"):
                                rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblCell")[index].innerText.split("(").pop().slice(0,-1);
                                break;
                            case("newLine"):
                                rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblCell")[index].innerText.split("\n").pop().slice(0, -1);
                                break;
                            case("label"):
                                rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblCell")[index].innerText.split("\n")[0];
                                break;
                            case("status"):
                                rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblCell")[index].querySelectorAll("span:nth-child(1)")[0].innerText;
                                break;
                            case("image"):
                                rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblCell")[index].querySelectorAll("span.sapFAvatarInitialsHolder")[0].innerText;
                                break;
                            case("aria-label"):
                                rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblCell")[index].querySelectorAll("span")[0].getAttribute("aria-label");
                                break;
                            case("date"):
                                let dateStringSplitted = tableRows[i].querySelectorAll("td.sapMListTblCell")[index].innerText.split("/"); // e.g. 21/09/2021
                                rowValueByIndex = `${dateStringSplitted[2]}/${dateStringSplitted[0].padStart(2, "0")}/${dateStringSplitted[1].padStart(2, "0")}`;
                                break;
                            case("description"):
                                let fullDescriptionText = tableRows[i].querySelectorAll("td.sapMListTblCell")[index].innerText;
                                rowValueByIndex = fullDescriptionText.substring(0, fullDescriptionText.lastIndexOf("("));
                                break;
                            case("monetary"):
                                fullMonetaryText = tableRows[i].querySelectorAll("td.sapMListTblCell")[index].innerText;
                                monetaryTransformed = fullMonetaryText.replace(/[^\d.-]/g,'');
                                rowValueByIndex = parseFloat(monetaryTransformed);
                                break;
                            case("monetary-no-sap-check"):
                                fullMonetaryText = tableRows[i].querySelectorAll("td.sapMListTblCell")[index].innerText;
                                monetaryTransformed = fullMonetaryText.replace(/[^\d.-]/g,'');
                                rowValueByIndex = parseFloat(monetaryTransformed) 
                                break;
                            case("currencyType"):
                                rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblCell")[index].innerText.split(" ").pop();
                                break;
                            default:
                        }    

                        if(retrieveGroup) {
                            let siblingSelector = tableRows[i];
                            for(let gap = 0; gap < groupGap; gap++ ) {
                                siblingSelector = siblingSelector.previousSibling;
                            }
                            if(siblingSelector.getAttribute("role") == "row"){
                                groupHeaders.shift();
                            }
                        }
                        retrieveGroup ? values.push({value: rowValueByIndex, groupHeader: groupHeaders[0]}) : values.push(rowValueByIndex);
                    }
                } else if(headerType == "aside") {
                    tableRows = $(`${tableIDTransformed} > tbody > tr.sapMListTblSubRow`);
                    
                    for(let i = 0; i < tableRows.length; i++) {
                        let rowValueByIndex = retrieveGroup ? {} : "";
                        let fullMonetaryText = "";
                        let monetaryTransformed = "";
                        switch(valueType) {
                            case("text"):
                                rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal span")[0].innerText;
                                break;
                            case("hyperlink"):
                            rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal span.sapMObjStatusText")[0].innerText;
                                break;
                            case("code"):
                                rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal > span")[0].innerText.split("(").pop().slice(0,-1);
                                break;
                            case("newLine"):
                                rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal span")[0].innerText.split("\n").pop().slice(-1);
                                break;
                            case("label"):
                                rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal > span")[0].innerText.split("\n")[0];
                                break;
                            case("status"):
                                rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal span")[0].querySelectorAll("span:nth-child(1)")[0].innerText;
                                break;
                            case("image"):
                                rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("span.sapFAvatarInitialsHolder")[0].innerText;
                                break;
                            case("aria-label"):
                                rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("span")[0].getAttribute("aria-label");
                                break;
                            case("date"):
                                let dateStringSplitted = tableRows[i].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal span")[0].innerText.split("/");  // e.g. 21/09/2021
                                rowValueByIndex = `${dateStringSplitted[2]}/${dateStringSplitted[0].padStart(2, "0")}/${dateStringSplitted[1].padStart(2, "0")}`;
                                break;
                            case("description"):
                                let fullDescriptionText = tableRows[i].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal span")[0].innerText;
                                rowValueByIndex = fullDescriptionText.substring(0, fullDescriptionText.lastIndexOf("("));
                                break;
                            case("monetary"):
                                fullMonetaryText = tableRows[i].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal span")[0].innerText;
                                monetaryTransformed = fullMonetaryText.replace(/[^\d.-]/g,'');
                                rowValueByIndex = parseFloat(monetaryTransformed);
                                break;
                            case("monetary-no-sap-check"):
                                fullMonetaryText = tableRows[i].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal span")[0].innerText;
                                monetaryTransformed = fullMonetaryText.replace(/[^\d.-]/g,'');
                                rowValueByIndex = parseFloat(monetaryTransformed) 
                                break;
                            case("currencyType"):
                                rowValueByIndex = tableRows[i].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal span")[0].innerText.split(" ").pop();
                                break;
                            default:
                        }       
                        if(retrieveGroup) {
                            let siblingSelector = tableRows[i].previousSibling;
                            for(let gap = 0; gap < groupGap; gap++ ) {
                                siblingSelector = siblingSelector.previousSibling;
                            }
                            if(siblingSelector.getAttribute("role") == "row"){
                                groupHeaders.shift();
                            }
                        }
                        retrieveGroup ? values.push({value: rowValueByIndex, groupHeader: groupHeaders[0]}) : values.push(rowValueByIndex);
                    }
                }
                return values;
            }, {tableIDTransformed, index, headerType, valueType, retrieveGroup, groupGap });
        await this.page.waitForTimeout(defaultTimeout);
    
        return values;
    }
    
    async retrieveValueAtRowIDByIndexAndHeaderType(rowID, index, headerType, valueType){
        let values = null;
        rowID = this.transformIDtoJQueryFormat(rowID);

        values = await this.page.evaluate(
            function({rowID, index, headerType, valueType}){
                let rowValue = null;
    
                if(headerType == "header") {               
                    let rowValueByIndex = "";
                        if(valueType == "text") {
                            rowValueByIndex = $(rowID)[0].querySelectorAll("td.sapMListTblCell")[index].innerText;
                        }else if(valueType == "code") {
                            rowValueByIndex = $(rowID)[0].querySelectorAll("td.sapMListTblCell")[index].innerText.split("(").pop().slice(0,-1);
                        }else if(valueType == "newLine") {
                            rowValueByIndex = $(rowID)[0].querySelectorAll("td.sapMListTblCell")[index].innerText.split("\n").pop().slice(0, -1);
                        }else if(valueType == "status") {
                            rowValueByIndex = $(rowID)[0].querySelectorAll("td.sapMListTblCell")[index].querySelectorAll("span:nth-child(1)")[0].innerText;
                        }else if(valueType == "image") {
                            rowValueByIndex = $(rowID)[0].querySelectorAll("td.sapMListTblCell")[index].querySelectorAll("span.sapFAvatarInitialsHolder")[0].innerText;
                        }else if(valueType == "date") {
                            // dateComponent = items[y].split("/");
                            // let yearDateComponent = dateComponent[2].length < 3 ? "20" + dateComponent[2] : dateComponent[2];
                            // let monthDateComponent = dateComponent[1];
                            // let dayDateComponent = dateComponent[0];
                            // items[y] = new Date(yearDateComponent, monthDateComponent - 1, dayDateComponent);
                            let dateStringSplitted = $(rowID)[0].querySelectorAll("td.sapMListTblCell")[index].innerText.split("/"); // e.g. 21/09/2021
                            rowValueByIndex = `${dateStringSplitted[2]}/${dateStringSplitted[0].padStart(2, "0")}/${dateStringSplitted[1].padStart(2, "0")}`;
                        } else if (valueType == "description") {
                            let fullText = $(rowID)[0].querySelectorAll("td.sapMListTblCell")[index].innerText;
                            rowValueByIndex = fullText.substring(0, fullText.lastIndexOf("("));
                        }else if (valueType == "monetary") {
                            let fullText = $(rowID)[0].querySelectorAll("td.sapMListTblCell")[index].innerText;
                            let monetaryTransformed = fullText.replace(/[^\d.-]/g,'');
                            rowValueByIndex = parseFloat(monetaryTransformed);
                        }
                        rowValue = rowValueByIndex;
                } else if(headerType == "aside") {                    
                    let rowValueByIndex = "";
                        if(valueType == "text") {
                            rowValueByIndex = $(rowID)[0].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal > span")[0].innerText;
                        }else if(valueType == "code") {
                            rowValueByIndex = $(rowID)[0].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal > span")[0].innerText.split("(").pop().slice(0,-1);
                        }else if(valueType == "newLine") {
                            rowValueByIndex = $(rowID)[0].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal > span")[0].innerText.split("\n").pop().slice(-1);
                        }else if(valueType == "status") {
                            rowValueByIndex = $(rowID)[0].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal > div")[0].querySelectorAll("span:nth-child(1)")[0].innerText;
                        }else if(valueType == "image") {
                            rowValueByIndex = $(rowID)[0].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("span.sapFAvatarInitialsHolder")[0].innerText;
                        }else if(valueType == "date") {
                            let dateStringSplitted = $(rowID)[0].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal > span")[0].innerText.split("/");  // e.g. 21/09/2021
                            rowValueByIndex = `${dateStringSplitted[2]}/${dateStringSplitted[0].padStart(2, "0")}/${dateStringSplitted[1].padStart(2, "0")}`;
                        }else if (valueType == "description"){
                            let fullText = $(rowID)[0].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal > span")[0].innerText;
                            rowValueByIndex = fullText.substring(0, fullText.lastIndexOf("("));
                        }else if (valueType == "monetary") {
                            let fullText = $(rowID)[0].querySelectorAll("td.sapMListTblSubRowCell div.sapMListTblSubCnt div.sapMListTblSubCntRow")[index].querySelectorAll("div.sapMListTblSubCntVal > span")[0].innerText;
                            let monetaryTransformed = fullText.replace(/[^\d.-]/g,'');
                            rowValueByIndex = parseFloat(monetaryTransformed);
                        }
                        rowValue = rowValueByIndex;
                }
                return rowValue;
            }, {rowID, index, headerType, valueType });
        await this.page.waitForTimeout(defaultTimeout);
    
        return values;
    }

    async clearInputFromSelectableTextbar(inputID, testCaseID, testCaseStep, timeout=defaultTimeout) {
        let inputIDTransformed = this.transformIDtoJQueryFormat(inputID);
        await this.page.waitForTimeout(timeout);
    
        let deletableDivIds = await this.page.$$eval(`${inputIDTransformed} div[title="Deletable"]`, deletableDivs => {
            let divIds = [];
            deletableDivs.forEach(function(deletableDiv){
                divIds.push(deletableDiv.children[1].id);
            })
            return divIds;
        });

        for(let i = 0 ; i < deletableDivIds.length; i ++) {
            deletableDivIds[i] = this.transformIDtoJQueryFormat(deletableDivIds[i]);
            await this.page.click(deletableDivIds[i]);
        }

        await this.page.waitForTimeout(timeout);
    }

    async dragElementXToElementY(elementXID, elementYID, testCaseID, testCaseStep) {
                const elementXIDTransformed = this.transformIDtoJQueryFormat(elementXID);
                const elementYIDTransformed = this.transformIDtoJQueryFormat(elementYID);

                const elementX = await this.page.$(elementXIDTransformed);
                const elementY = await this.page.$(elementYIDTransformed);
                const elementXBoundingBox = await elementX.boundingBox();
                const elementYBoundingBox = await elementY.boundingBox();
        
                await this.page.waitForTimeout(defaultTimeout);
                await this.page.mouse.move(elementXBoundingBox.x + elementXBoundingBox.width / 2, elementXBoundingBox.y + elementXBoundingBox.height / 2);
                await this.page.mouse.down();
                await this.page.waitForTimeout(defaultTimeout);
                await this.page.mouse.move(elementYBoundingBox.x + elementYBoundingBox.width / 2, elementYBoundingBox.y + elementYBoundingBox.height / 2);
                await this.page.mouse.up();
                await this.page.waitForTimeout(defaultTimeout);
    }

    async retrieveWidthAndHeightOfID(elementID, testCaseID, testCaseStep, timeout=defaultTimeout) {
        let elementIDTransformed = this.transformIDtoJQueryFormat(elementID);
        await this.page.waitForTimeout(timeout);
    
        let oWidthHeight = await this.page.evaluate(function({elementIDTransformed}){
            let width = $(elementIDTransformed).width();
            let height = $(elementIDTransformed).height();

            return {width, height};
        }, {elementIDTransformed});
        await this.page.waitForTimeout(timeout);
        
        return oWidthHeight;
    }

    delay(time) {
        return new Promise(function(resolve) { 
            setTimeout(resolve, time)
        });
    }
    
    transformIDtoJQueryFormat(id) {
        let newID = "";
        try {
            newID = `#${id.replace(/\./g,"\\.")}`;
            newID = `${newID.replace(/\$/g,"\.")}`;
        }
        catch(error) {
            expect(false, `${id + ""} is not a string`).toBe(true);
        }
        
        return newID;
    }
    
    
     dateDiffInDays(previousDate, currentDate) {
        let  _MS_PER_DAY = 1000 * 60 * 60 * 24;
        // Discard the time and time-zone information.
        const utc1 = Date.UTC(previousDate.getFullYear(), previousDate.getMonth(), previousDate.getDate());
        const utc2 = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }
    
     hasSubArray(master, sub) {
        return sub.every((i => v => i = master.indexOf(v, i) + 1)(0));
    }

    toMonetaryFormat(value) {
        let valueUnit = value.toString().substr(-1);
        
        let monetaryTransformed = parseFloat(value?.toString().replace(/[^\d.-]/g,''));
        
        switch (valueUnit) {
            case("K"):
                monetaryTransformed *= 1000;
                break;
            case("M"):
                monetaryTransformed *= 1000000;
                break;
            case("G"):
                monetaryTransformed *= 1000000000;
                break;       
            case("m"):
                monetaryTransformed /= 1000;
                break;       
            case("μ"):
                monetaryTransformed /= 1000000;
                break;       
            case("n"):
                monetaryTransformed /= 1000000000;
                break;       
        }
        
        return monetaryTransformed;
    }

    checkIfValueIsWithinValueUnit(valueUnit, value) {
        //Round down both number
        var valueUnitNumericWithoutUnit = parseFloat(valueUnit.toString().replace(/[^\d-]/g,'')); //e.g. 5.9901M -> 59901
        valueUnit = Math.floor(this.toMonetaryFormat(valueUnit));
        value = Math.floor(this.toMonetaryFormat(value));
        var baseline = valueUnit / valueUnitNumericWithoutUnit;
        
        var valueDivideByBaselineFloor = Math.floor(value / baseline);
        return valueDivideByBaselineFloor == valueUnitNumericWithoutUnit || valueDivideByBaselineFloor == valueUnitNumericWithoutUnit + 1 || valueDivideByBaselineFloor == valueUnitNumericWithoutUnit - 1;
    } 


  }



module.exports = {
    Robot: Robot
};