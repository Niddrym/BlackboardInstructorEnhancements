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


//document.querySelectorAll("#nonAccessibleTableDiv tr :checked")[0].parentElement.parentElement.querySelectorAll("a[title*='@'")[0].textContent

browser.storage.sync.get(defaults).then(function(options){
    
    let script = document.createElement("script");
    let style = document.createElement("style");
    script.innerHTML="";
    style.innerHTML="";

    if(options.addDisableUsers){
        script.innerHTML +=`
        function toggleSelectedUsers(toggle){
            let promises=[];
            document.querySelectorAll("#userManagerForm [name='ckbox']:checked").forEach((v) => {
                promises.push(fetch(\`/webapps/blackboard/execute/courseMembership?context=modify&user_id=\${v.value}&course_id=\${course_id}\`)
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
                }));
            });
            Promise.all(promises).then(()=>{
                console.log("done");
            }).then(function(){ location.reload();});
        }
        jQuery(document).ready(function(){
            document.querySelector("#listContainer_nav_batch_top").innerHTML+=\`<li><a href='javascript:toggleSelectedUsers("false")'>Disable Selected Users</a></li>\`;
            document.querySelector("#listContainer_nav_batch_bot").innerHTML+=\`<li><a href='javascript:toggleSelectedUsers("false")'>Disable Selected Users</a></li>\`;
            document.querySelector("#listContainer_nav_batch_top").innerHTML+=\`<li><a href='javascript:toggleSelectedUsers("true")'>Enable Selected Users</a></li>\`;
            document.querySelector("#listContainer_nav_batch_bot").innerHTML+=\`<li><a href='javascript:toggleSelectedUsers("true")'>Enable Selected Users</a></li>\`;
        });
        `;
    }

    if(options.hideRemoveUsers){
        style.innerHTML+=`
        [href*='javascript:validateRemove()'] {
            display:none !important;
        }
        `;
    }
    document.head.appendChild(style);
    document.body.appendChild(script);
});