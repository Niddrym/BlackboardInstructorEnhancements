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
    gcHideBulkUsers:true,
    copyItemSearchCourses:true,
    addCourseSwitch:true,
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
    if(details.url.indexOf("fixing=true")==-1){
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
    if(details.url.indexOf("fixing=true")==-1){
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

let callbackAddSwitchToCourseMenu = function(details){
    if(details.url.indexOf("fixing=true")==-1){
        let body = makeSyncReq(details.url+(details.url.indexOf("?")==-1?"?":"&")+"fixing=true");
        body+=`
        let terms = Promise.resolve("start").then(async (data)=>{
            let sortedTerm=[];
            let nextURL={nextPage:\`/learn/api/public/v1/terms\`};
            do{
                await fetch(nextURL.nextPage).then(resp => resp.json()).then((data)=>{
                    nextURL=data.paging;
                    sortedTerm=sortedTerm.concat(data.results);
                }); 
            }while(typeof nextURL != "undefined");
            sortedTerm.sort((a,b)=>{
                if(b.availability.duration.type=="Continuous"){
                    return -1;
                }
                if(a.availability.duration.type=="Continuous"){
                    return 1;
                }
                return b.availability.duration.start.localeCompare(a.availability.duration.start);
            });
            return sortedTerm;
        });
        let courses = fetch('/webapps/blackboard/execute/editUser?context=self_modify').then(response => response.text()).then(async data => {
            let el = document.createElement('html');
            el.innerHTML=data;
            let userid=el.querySelector("#user_id").value;

            let sortedCourses = {};
            let nextURL={nextPage:\`/learn/api/public/v1/users/\${userid}/courses?expand=course\`};
            do{
                await fetch(nextURL.nextPage).then(resp => resp.json()).then((data)=>{
                    nextURL=data.paging;
                    data.results.forEach((v,i)=>{
                        if(typeof v.course.termId == "undefined"){
                            v.course.termId="unknown";
                        }
                        if(typeof sortedCourses[v.course.termId] == "undefined"){
                            sortedCourses[v.course.termId]=[];
                        }
                        sortedCourses[v.course.termId].push(v);
                    });
                }); 
            }while(typeof nextURL != "undefined");
            return sortedCourses;  
        });
        terms.then(ts =>{
            return courses.then((cs)=>{
                let html="<select id='courseSwitcher'>";
                for(let term of ts){
                    if(typeof cs[term.id]!= "undefined"){
                        html+=\`<optgroup label="\${term.name}">\`;
                        for(let v of cs[term.id]){
                            if(v.courseRoleId=="Instructor" || v.courseRoleId=="TeachingAssistant"){
                                html+=\`<option value="\${v.course.id}" \${v.course.id==window.course_id?"selected":""}>\${v.course.name} \${v.course.courseId}</option>\`;
                            }
                        }
                        html+="</optgroup>";
                    }
                }
                if(typeof cs["unknown"]!= "undefined"){
                    html+=\`<optgroup label="Unknown">\`;
                    for(let v of cs["unknown"]){
                        if(v.courseRoleId=="Instructor" || v.courseRoleId=="TeachingAssistant"){
                            html+=\`<option value="\${v.course.id}" \${v.course.id==window.course_id?"selected":""}>\${v.course.name} \${v.course.courseId}</option>\`;
                        }
                    }
                    html+="</optgroup>";
                }
                html+="</select>";
                jQuery("#breadcrumbs .path .clearfix").append(html);
                jQuery("#courseSwitcher").on("change",(e)=>{
                    if(window.location.href.includes("content_id")){
                        fetch(\`/learn/api/public/v1/courses/\${e.target.value}/contents?title=\${jQuery("#crumb_2").text().trim()}\`).then(res => res.json()).then(async (data)=>{
                            if(data.results.length>0){
                                let crumbNum=3;
                                let currentContentId=data.results[0].id;
                                while(jQuery("#crumb_"+crumbNum).text().trim()!=''&&i>0){
                                    await fetch(\`/learn/api/public/v1/courses/\${e.target.value}/contents/\${currentContentId}/children?title=\${jQuery("#crumb_"+crumbNum).text().trim()}\`).then(res => res.json()).then((data)=>{
                                        if(data.results.length>0){
                                            i++;
                                            currentContentId=data.results[0].id;
                                        }
                                        else{
                                            i=0;
                                        }
                                    });
                                }
                                const regex = /content_id=[0-9_]*/ig;
                                window.location.href=window.location.href.replaceAll(window.course_id,e.target.value).replaceAll(regex,\`content_id=\${currentContentId}\`);
                            }
                            else{
                                window.location.href=\`/webapps/blackboard/execute/courseMain?course_id=\${e.target.value}\`;
                            }
                        });
                    }
                    else{
                        window.location.href=window.location.href.replaceAll(window.course_id,e.target.value);
                    }
                });
            })
        });
        `;
        return {redirectUrl:"data:application/javascript;base64,"+btoa(body)};
    }
}


let filter = { urls:[] };
let filterPasteJS = { urls:[] };
let filterGCMaxJS = { urls:[] };
let filterCourseMenu = { urls:[] };
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
        if(options.addCourseSwitch){
            filterCourseMenu.urls.push("*://*/*/javascript/ngui/coursemenu.js*");
            browser.webRequest.onBeforeRequest.addListener(callbackAddSwitchToCourseMenu, filterCourseMenu, opt_extraInfoSpec);
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
        if(browser.webRequest.onBeforeRequest.hasListener(callbackAddSwitchToCourseMenu)){
            browser.webRequest.onBeforeRequest.removeListener(callbackAddSwitchToCourseMenu);
        }
        intercepts();
    }
});
intercepts();
