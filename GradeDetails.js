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
    gcCopyUsernamesDel:'; ',
    gcHScrollSensitivity:100,
    gcVScrollSensitivity:100
};

browser.storage.sync.get(defaults).then(function(options){
    
    let script = document.createElement("script");
    let style = document.createElement("style");
    script.innerHTML="";
    style.innerHTML="";

    if(options.gradeDetailsShowJumpTo){
        script.innerHTML+=`
        setTimeout(function(){
            if(!$('panelbutton1').visible()){
                actionPanel.togglePanel('panelbutton1','button1');
            }
        },500);
        `;
    }
    document.head.appendChild(style);
    document.body.appendChild(script);
});