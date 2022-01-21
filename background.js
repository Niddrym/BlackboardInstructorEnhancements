let defaults={
    gcMaxTweak:true,
    gcFilterTweak:true,
    gcScrollBarTweak:true,
    dbAddDownloadAll:true,
    dlAssignmentsShowAll:true,
    userShowAll:true,
    needsGradingShowAll:true,
    poolQuestionsShowAll:true,
    gradeQuestionsShowAll:true,
    fixPaste:true,
    addDisableUsers:true,
    hideRemoveUsers:true,
    gcEnableDisableUsers:true,
    gcEnableScrollOnTable:true,
    gradingAddStudentIDs:true,
    gradeDetailsShowJumpTo:true,
    gcHoverAddedDate:true,
    gcCopyUsernames:true,
    gcDeleteUsers:true,
    copyItemSearchCourses:true,
    gcCopyUsernamesDel:'; ',
    gcHScrollSensitivity:100,
    gcVScrollSensitivity:100
};

let makeSyncReq = function(url){
    let request = new XMLHttpRequest();
    //use fetch instead if ever supported
    request.open('GET', url, false); 
    request.send(null);
    return request.responseText;
}

let makeaSyncReq = function(url){
    return fetch(url).then((resp)=>{
        return resp.text();
    });
}


let callback = function(details) {
    if(details.url.indexOf("&showAll=true")==-1&&details.method.toUpperCase()=="GET"){
        return {redirectUrl:details.url+"&showAll=true"}
    }
};
let callbackPasteJS = function(details){
    if(details.url.indexOf("&fixing=true")==-1){
        let body = makeSyncReq(details.url+(details.url.indexOf("?")==-1?"?":"&")+"fixing=true");
        body+=`
        tinyMceWrapper.Editor.prototype.initializeConfigOld=tinyMceWrapper.Editor.prototype.initializeConfig;
        tinyMceWrapper.Editor.prototype.initializeConfig=function(config){
            fullConfig=tinyMceWrapper.Editor.prototype.initializeConfigOld(config);
            fullConfig.powerpaste_allow_local_images = true;
            return fullConfig;

        };
        `;
        return {redirectUrl:"data:application/javascript;base64,"+btoa(body)};
    }
}

let callbackGCMaxJS = function(details){
    if(details.url.indexOf("&fixing=true")==-1){
        let body = makeSyncReq(details.url+(details.url.indexOf("?")==-1?"?":"&")+"fixing=true");
        body+=`
        Gradebook.GridModel.prototype.oldInitGridModel=Gradebook.GridModel.prototype.initialize;
        Gradebook.GridModel.prototype.initialize=function(gradebookService){
            this.oldInitGridModel(gradebookService);
            this.minimumRows=localStorage.getItem('gradebook.rows')||this.minimumRows;
        };
        Gradebook.GridModel.prototype.setMinimumRows=function(minRows){
            minRows=minRows<5?5:minRows;
            this.minimumRows=minRows;
            localStorage.setItem('gradebook.rows', minRows);
        };
        `;
        return {redirectUrl:"data:application/javascript;base64,"+btoa(body)};
    }
}

let callbackaGCMaxJS = function(details){
    if(details.url.indexOf("&fixing=true")==-1){
        let body = makeaSyncReq(details.url+(details.url.indexOf("?")==-1?"?":"&")+"fixing=true").then((text)=>{
            text+=`
            Gradebook.GridModel.prototype.oldInitGridModel=Gradebook.GridModel.prototype.initialize;
            Gradebook.GridModel.prototype.initialize=function(gradebookService){
                this.oldInitGridModel(gradebookService);
                this.minimumRows=localStorage.getItem('gradebook.rows')||this.minimumRows;
            };
            Gradebook.GridModel.prototype.setMinimumRows=function(minRows){
                minRows=minRows<5?5:minRows;
                this.minimumRows=minRows;
                localStorage.setItem('gradebook.rows', minRows);
            };
            `;
            return {redirectUrl:"data:application/javascript;base64,"+btoa(text)};
        });
        return body;
    }
}


let filter = { urls:[] };
let filterPasteJS = { urls:[] };
let filterGCMaxJS = { urls:[] };
let opt_extraInfoSpec = ["blocking"];

function intercepts(){
    browser.storage.sync.get(defaults).then(function(options){
        filter.urls=[];
        if(options.dlAssignmentsShowAll){
            filter.urls.push("*://*/webapps/gradebook/do/instructor/downloadAssignment*");
        }
        if(options.userShowAll){
            filter.urls.push("*://*/webapps/blackboard/execute/userManager*");
        }
        if(options.needsGradingShowAll){
            filter.urls.push("*://*/webapps/gradebook/do/instructor/viewNeedsGrading*");
        }
        if(options.poolQuestionsShowAll){
            filter.urls.push("*://*/webapps/assessment/do/authoring/modifyAssessment*method=modifyAssessment*");
            filter.urls.push("*://*/webapps/assessment/do/authoring/viewAssessmentManager?assessmentType=Pool*");
        }
        if(options.gradeQuestionsShowAll){
            filter.urls.push("*://*/webapps/assessment/do/grade/viewQuestions*");
        }
        if(options.dlAssignmentsShowAll||options.userShowAll||options.needsGradingShowAll){
            browser.webRequest.onBeforeRequest.addListener(callback, filter, opt_extraInfoSpec);
        }
        if(options.fixPaste){
            filterPasteJS.urls.push("*://*/webapps/vtbe-tinymce/javascript/vtbeTinyMce.js*");
            browser.webRequest.onBeforeRequest.addListener(callbackPasteJS, filterPasteJS, opt_extraInfoSpec);
        }
        if(options.gcMaxTweak){
            filterGCMaxJS.urls.push("*://*/webapps/gradebook/js/view_spreadsheet2.js*");
            browser.webRequest.onBeforeRequest.addListener(callbackGCMaxJS, filterGCMaxJS, opt_extraInfoSpec);
        }
    });
}
browser.runtime.onMessage.addListener(function(message){
    if(message.reload){
        if(browser.webRequest.onBeforeRequest.hasListener(callback)){
            browser.webRequest.onBeforeRequest.removeListener(callback);
        }
        if(browser.webRequest.onBeforeRequest.hasListener(callbackPasteJS)){
            browser.webRequest.onBeforeRequest.removeListener(callbackPasteJS);
        }
        if(browser.webRequest.onBeforeRequest.hasListener(callbackGCMaxJS)){
            browser.webRequest.onBeforeRequest.removeListener(callbackGCMaxJS);
        }
        intercepts();
    }
});
intercepts();
