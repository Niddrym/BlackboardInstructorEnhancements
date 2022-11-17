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
    addCourseSwitch:true,
    gcCopyUsernamesDel:'; ',
    gcHScrollSensitivity:100,
    gcVScrollSensitivity:100
};

browser.storage.sync.get(defaults).then(function(options){
    
    let script = document.createElement("script");
    let style = document.createElement("style");
    script.innerHTML="";
    style.innerHTML="";
/*
    if (options.gcMaxTweak){
        script.innerHTML += `
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
        `    
    }
*/
    if(options.gcFilterTweak){
        script.innerHTML+=`
        setTimeout(function(){
            if(!$('panelviewDiv').visible()){
                actionPanel.togglePanel('panelviewDiv','viewDiv');
            }
        },1000);
        `;
    }

    if(options.gcScrollBarTweak){
        script.innerHTML +=`        
        Gradebook.GridViewPort.prototype.oldCreateHScrollBar=Gradebook.GridViewPort.prototype.createHScrollBar;
        Gradebook.GridViewPort.prototype.createHScrollBar=function(){
            this.oldCreateHScrollBar();
            try{
                this.scrollerDivH.style.position="fixed";
                this.scrollerDivH.style.top=(window.innerHeight-50)+"px";
                this.scrollerDivH.classList.add("extensionScroller");
            }
            catch(err){
                
            }
        };`
        style.innerHTML+=`
        #table1_viewport + div::-webkit-scrollbar,div.extensionScroller::-webkit-scrollbar{
            height:50px;
        }
        `;
    }

    if(options.gcEnableDisableUsers||options.gcDeleteUsers){
        script.innerHTML+=`
        

        let studentIds=new Promise(async (resolve,reject)=>{
            let tempStudents={};
            let nextURL={nextPage:\`/learn/api/public/v1/courses/\${course_id}/users\`};
            do{
                await fetch(nextURL.nextPage).then(resp => resp.json()).then((data)=>{
                    nextURL=data.paging;
                    data.results.forEach(row => { 
                        tempStudents[row.id]=row;
                    });
                }); 
            }while(typeof nextURL != "undefined");
            resolve(tempStudents);
        });`
    }

    if(options.gcEnableDisableUsers){
        script.innerHTML+=`
        

        function toggleSelectedUsers(toggle){
            let promises=[];
            gbModel.getCheckedStudentIds().forEach((v) => {
                
                promises.push(studentIds.then((studentBBIds) => { 
                    return fetch(\`/webapps/blackboard/execute/courseMembership?context=modify&user_id=\${studentBBIds["_"+v+"_1"].userId}&course_id=\${course_id}\`)
                    .then(response => response.text())
                    .then(data => {
                        let el = document.createElement('html');
                        el.innerHTML=data;
                        let formData = new URLSearchParams();
                        formData.append("user_id",el.querySelector("[name='user_id']").value);
                        formData.append("course_id",el.querySelector("[name='course_id']").value);
                        formData.append("blackboard.platform.security.NonceUtil.nonce",el.querySelector("[name='blackboard.platform.security.NonceUtil.nonce']").value);
                        formData.append("courseMembershipRole",el.querySelector("[name='courseMembershipRole']:checked").value);
                        formData.append("availableIndex",toggle);
                        formData.append("bottom_Submit","Submit");

                        return fetch('/webapps/blackboard/execute/courseMembership?context=save',{
                            method:"POST",
                            credentials:"include",
                            headers:{"Content-Type":"application/x-www-form-urlencoded"},
                            body:formData
                        }).then(
                            response => response.text()
                        ).then(data => {/*console.log(data)*/});
                    });
                }));
            });
            Promise.all(promises).then(()=>{
                console.log("done");
            }).then(function(){ location.reload();});
        }
        jQuery(document).ready(function(){
            document.querySelectorAll("#containerdiv ul.nav").forEach((v) => {
                let listItems = v.querySelectorAll(".primary");
                jQuery(listItems[listItems.length-1]).after(\`
                    <li class="primary" style="" role="button"><a href="javascript:toggleSelectedUsers('false')" >Disable Selected Users</a></li>
                    <li class="primary" style="" role="button"><a href="javascript:toggleSelectedUsers('true')" >Enable Selected Users</a></li>\`
                ); 
            });
        });   

        `;
    }
    if(options.gcDeleteUsers){
        script.innerHTML+=`


        function deleteSelectedUsers(){
          
            studentIds.then((studentBBIds) => { 
                return fetch(\`/webapps/blackboard/execute/userManager?course_id=\${course_id}\`)
                .then(response => response.text())
                .then(data => {
                    let el = document.createElement('html');
                    el.innerHTML=data;
                    let formData = new URLSearchParams();
                    formData.append("actionString","Remove");
                    formData.append("navType","cp_list_modify_users");
                    formData.append("enroll","");
                    formData.append("unlockUserIdStr","")
                    formData.append("defSortCol",el.querySelector("[name='defSortCol']").value);
                    formData.append("selectAllFromList",el.querySelector("[name='selectAllFromList']").value);
                    formData.append("numResults",el.querySelector("[name='numResults']").value);
                    formData.append("blackboard.platform.security.NonceUtil.nonce",el.querySelector("[name='blackboard.platform.security.NonceUtil.nonce']").value);
                    gbModel.getCheckedStudentIds().forEach((v) => {
                        formData.append("ckbox",studentBBIds["_"+v+"_1"].userId);
                    });
                    return fetch(\`/webapps/blackboard/execute/userManager?course_id=\${course_id}\`,{
                        method:"POST",
                        credentials:"include",
                        headers:{"Content-Type":"application/x-www-form-urlencoded"},
                        body:formData
                    }).then(
                        response => response.text()
                    ).then(data => {/*console.log(data)*/});
                });
            }).then(()=>{
                console.log("done");
            }).then(function(){ location.reload();});
        }
        jQuery(document).ready(function(){
            document.querySelectorAll("#containerdiv ul.nav").forEach((v) => {
                let listItems = v.querySelectorAll(".primary");
                jQuery(listItems[listItems.length-1]).after(\`
                    <li class="primary" style="" role="button"><a href="javascript:deleteSelectedUsers()" >Remove Selected Users</a></li>\`
                ); 
            });
        });   

        `;
    }
    if(options.gcHoverAddedDate){
        script.innerHTML+=`
        let studentsAddedDate=fetch(\`/learn/api/public/v1/courses/\${course_id}/users\`).then(response => response.json()).then(data => { 
            let tempStuData = {};
            data.results.forEach((v,i)=>{
                tempStuData[v.id]=v;
                v.createdParsed=Date.parse(v.created);
                v.lastAccessedParsed=Date.parse(v.lastAccessed);
            });
            window.studentData=tempStuData;
            return tempStuData;
        });

        function isParent(refNode, otherNode) {
            var parent = otherNode.parentNode;
            do {
                if (refNode == parent) {
                    return true;
                } else {
                    parent = parent.parentNode;
                }
            } while (parent);
            return false;
        }
        
        jQuery(document.body).append(\`<div id="extTTPopUp" style="display:none;background-color:#222222;color:#EEEEEE;border:1px solid #555555;padding: 2px">
            Name: <span id="extTTStudentName"></span><br>
            Date Added: <span id="extTTAddDate"></span><br>
            Last Access: <span id="extTTLastAccess"></span> 
        </div>\`);
        jQuery(document.body).append(\`<div id="extTTGPopUp" style="display:none;background-color:#222222;color:#EEEEEE;border:1px solid #555555;padding: 2px">
            <span id="extTTGPopUp"></span>
            <br id="extTTGDueDateNL"><span id="extTTGDueDate"></span>
            <br id="extTTGPointsNL"><span id="extTTGPointsLabel">Points: </span><span id="extTTGPoints"></span>
            <br id="extTTGCategoryNL"><span id="extTTGCategoryLabel">Category: </span><span id="extTTGCategory"></span>
        </div>\`);


        jQuery(document).on("mouseenter","#table1 th",function(e){
            jQuery("#extTTGPopUp").css("display","none");
            if(typeof window.studentData != "undefined" && typeof window.studentData["_"+e.currentTarget.controller.gridCell.metaData.uid+"_1"] != "undefined"){
                jQuery("#extTTPopUp").css("display","block");
                jQuery("#extTTPopUp").css("position","absolute");
                let position=jQuery(e.currentTarget).offset();
                jQuery("#extTTPopUp").css("top",position.top+jQuery(e.currentTarget).outerHeight());
                jQuery("#extTTPopUp").css("left",position.left);
                jQuery("#extTTPopUp").css("z-index",10000);
                jQuery("#extTTPopUp #extTTStudentName").text(e.currentTarget.controller.gridCell.metaData.dn);
                jQuery("#extTTPopUp #extTTAddDate").text(window.studentData["_"+e.currentTarget.controller.gridCell.metaData.uid+"_1"].created.substr(0,10));
                jQuery("#extTTPopUp #extTTLastAccess").text(window.studentData["_"+e.currentTarget.controller.gridCell.metaData.uid+"_1"].lastAccessed.substr(0,10));
            }
        });

        jQuery(document).on("mouseout","#table1 th",function(e){
            if(!isParent(e.currentTarget,e.relatedTarget)&&e.currentTarget==e.target){
                jQuery("#extTTPopUp").css("display","none");
            }            
        });

        jQuery(document).on("mouseenter","#table1 td",function(e){
            jQuery("#extTTPopUp").css("display","none");
            jQuery("#extTTGPopUp").css("display","block");
            jQuery("#extTTGPopUp").css("position","absolute");
            let position=jQuery(e.currentTarget).offset();
            jQuery("#extTTGPopUp").css("top",position.top+jQuery(e.currentTarget).outerHeight());
            jQuery("#extTTGPopUp").css("left",position.left);
            jQuery("#extTTGPopUp").css("z-index",10000);
            jQuery("#extTTGPopUp #extTTGPopUp").text(e.currentTarget.controller.gridCell.colDef.name);
            if(typeof e.currentTarget.controller.gridCell.colDef.ldue != "undefined" && e.currentTarget.controller.gridCell.colDef.ldue !=0){
                jQuery("#extTTGPopUp #extTTGDueDate").text(e.currentTarget.controller.gridCell.colDef.ldue);
                jQuery("#extTTGPopUp #extTTGDueDate").css("display","inline");
                jQuery("#extTTGPopUp #extTTGDueDateNL").css("display","block");
                jQuery("#extTTGPopUp #extTTGDueDateLabel").css("display","inline");
            }
            else{
                jQuery("#extTTGPopUp #extTTGDueDate").css("display","none");
                jQuery("#extTTGPopUp #extTTGDueDateNL").css("display","none");
                jQuery("#extTTGPopUp #extTTGDueDateLabel").css("display","none");
            }

            if(typeof e.currentTarget.controller.gridCell.colDef.points != "undefined" && e.currentTarget.controller.gridCell.colDef.points != 0){
                jQuery("#extTTGPopUp #extTTGPoints").text(e.currentTarget.controller.gridCell.colDef.points);
                jQuery("#extTTGPopUp #extTTGPoints").css("display","inline");
                jQuery("#extTTGPopUp #extTTGPointsNL").css("display","block");
                jQuery("#extTTGPopUp #extTTGPointsLabel").css("display","inline");
            }
            else{
                jQuery("#extTTGPopUp #extTTGPoints").css("display","none");
                jQuery("#extTTGPopUp #extTTGPointsNL").css("display","none");
                jQuery("#extTTGPopUp #extTTGPointsLabel").css("display","none");
            }

            if(typeof e.currentTarget.controller.gridCell.colDef.catid != "undefined" && typeof gbModel.catNameMap[e.currentTarget.controller.gridCell.colDef.catid] != "undefined"){
                jQuery("#extTTGPopUp #extTTGCategory").text(gbModel.catNameMap[e.currentTarget.controller.gridCell.colDef.catid]);
                jQuery("#extTTGPopUp #extTTGCategory").css("display","inline");
                jQuery("#extTTGPopUp #extTTGCategoryNL").css("display","block");
                jQuery("#extTTGPopUp #extTTGCategoryLabel").css("display","inline");
            }
            else{
                jQuery("#extTTGPopUp #extTTGCategory").css("display","none");
                jQuery("#extTTGPopUp #extTTGCategoryNL").css("display","none");
                jQuery("#extTTGPopUp #extTTGCategoryLabel").css("display","none");
            }
        });

        jQuery(document).on("mouseout","#table1 td",function(e){
            if(!isParent(e.currentTarget,e.relatedTarget)&&e.currentTarget==e.target){
                jQuery("#extTTGPopUp").css("display","none");
            }            
        });
        
        `;
    }

    if(options.gcCopyUsernames){
        script.innerHTML+=
        `
        function copyUsernames(del){
            let output='';
            gbModel.getStudentsByUserIds(gbModel.getCheckedStudentIds()).forEach((v) => {
                output+=v.user+del;
            });
            navigator.clipboard.writeText(output);
        }

        jQuery(document).ready(function(){
            document.querySelectorAll("#containerdiv ul.nav").forEach((v) => {
                let listItems = v.querySelectorAll(".primary");
                jQuery(listItems[listItems.length-1]).after(\`
                    <li class="primary" style="" role="button"><a href="javascript:copyUsernames('${options.gcCopyUsernamesDel}')" >Copy Selected Usernames</a></li>
                \`); 
            });
        }); 
        `;
    }

    if(options.gcEnableScrollOnTable){
        script.innerHTML+=`
        window.extensionScrollFix=0;
        window.extensionVScrollFix=0;
        
        document.body.addEventListener("wheel",(e) => {
            
            if(document.querySelector("#table1_viewport").contains(e.target)){
                if((e.deltaX!=0)||(e.shiftKey && e.deltaY!=0)){
                    window.extensionScrollFix+=(e.deltaX!=0?e.deltaX:e.deltaY);
                    if((e.deltaMode==1&&window.extensionScrollFix>=${Math.ceil(options.gcHScrollSensitivity/100)})
                        ||(e.deltaMode==0&&window.extensionScrollFix>=${options.gcHScrollSensitivity})){
                        window.extensionScrollFix=0
                        theGradeCenter.grid.viewPort.scrollCols(1);
                    }
                    if((e.deltaMode==1&&window.extensionScrollFix<=-${Math.ceil(options.gcHScrollSensitivity/100)})
                        ||(e.deltaMode==0&&window.extensionScrollFix<=-${options.gcHScrollSensitivity})){
                        window.extensionScrollFix=0
                        theGradeCenter.grid.viewPort.scrollCols(-1);
                    }
                }
                if(theGradeCenter.grid.viewPort.model.getNumRows()!=theGradeCenter.grid.viewPort.getNumVisibleRows()){
                    e.preventDefault();
                    if(!e.shiftKey && e.deltaY!=0){
                        window.extensionVScrollFix+=e.deltaY;
                        if((e.deltaMode==1&&window.extensionVScrollFix>=${Math.ceil(options.gcHScrollSensitivity/100)})
                            ||(e.deltaMode==0&&window.extensionVScrollFix>=${options.gcVScrollSensitivity})){
                            window.extensionVScrollFix=0
                            theGradeCenter.grid.viewPort.scrollRows(1);
                        }
                        if((e.deltaMode==1&&window.extensionVScrollFix<=-${Math.ceil(options.gcHScrollSensitivity/100)})
                            ||(e.deltaMode==0&&window.extensionVScrollFix<=-${options.gcVScrollSensitivity})){
                            window.extensionVScrollFix=0
                            theGradeCenter.grid.viewPort.scrollRows(-1);
                        }
                    }
                }
            }
        },{passive:false});
        `
    }
    document.head.appendChild(style);
    document.body.appendChild(script);
});
