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


browser.storage.sync.get(defaults).then(function(options){
    /*
    
    */

    var script = document.createElement("script");
    if(options.gradingAddStudentIDs){
        script.innerHTML = `
            jQuery(document).ready(()=>{
                let select2Script = document.createElement("script");
                let select2Css = document.createElement("link");

                select2Script.type="text/javascript";
                select2Script.src="https://cdnjs.cloudflare.com/ajax/libs/chosen/1.8.7/chosen.jquery.min.js";

                select2Css.href="https://cdnjs.cloudflare.com/ajax/libs/chosen/1.8.7/chosen.min.css";
                select2Css.rel="stylesheet";

                document.head.appendChild(select2Script);
                document.head.appendChild(select2Css);
                select2Script.onload = ()=>{
                    jQuery("#destCourse").chosen();
                }
            });
        `;
    }
    document.body.appendChild(script);
});