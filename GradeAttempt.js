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


browser.storage.sync.get(defaults).then(function(options){
    var script = document.createElement("script");
    if(options.gradingAddStudentIDs){
        script.innerHTML = `
            jQuery(document).ready(()=>{
                fetch(\`/webapps/gradebook/do/instructor/getJSONData?course_id=\${course_id}\`).then((resp)=>{
                    return resp.json();
                }).then((data)=>{
                    let urlParams = new URLSearchParams(window.location.search);
                    let userID=urlParams.get("courseMembershipId");
                    if(data.cachedBook){
                        data=data.cachedBook;
                    }
                    data.rows.forEach((row,irow)=>{
                        if(userID.includes(row[0].uid)){
                            row.forEach((v,i)=>{
                                if(v.c=="SI"){
                                    let idSpan=document.createElement("span");
                                    idSpan.style.paddingLeft="1em";
                                    idSpan.append(\`\${v.v}\`);
                                    document.querySelectorAll(".students-pager h3")[0].appendChild(idSpan);
                                }
                            });
                        }
                    });
                }).catch(err=>{console.log(err)});
            });
        `;
    }
    document.body.appendChild(script);
});