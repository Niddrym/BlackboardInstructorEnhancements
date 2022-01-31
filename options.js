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

function save_options() {
    let selections={}
    let checkBoxes=document.querySelectorAll('input[type=checkbox]');
    checkBoxes.forEach(function(v,i){
        selections[v.id]=v.checked;
    });
    let ranges=document.querySelectorAll('input[type=range]');
    ranges.forEach(function(v,i){
        selections[v.id]=v.value;
    });
    let textboxes=document.querySelectorAll('input[type=text]');
    textboxes.forEach(function(v,i){
        if(v.id=="gcCopyUsernamesDel"){
            tempval=v.value.replaceAll("\\","\\\\");
            selections[v.id]=tempval;
        }
        else{
            selections[v.id]=v.value;
        }
    });
    browser.storage.sync.set(selections).then(function(){
        let status=document.getElementById("status");
        status.innerHTML = '<span style="background-color:green;color:white">Options saved.</span>';
            setTimeout(function() {
            status.innerHTML = '';
        }, 750);
        browser.runtime.sendMessage({reload:true});
    });
}

function restore_options() {
    document.getElementById("save").addEventListener('click',save_options);
    document.getElementById("gcVScrollSensitivity").addEventListener('input',syncVScroll);
    document.getElementById("gcVScrollSensitivityMan").addEventListener('input',syncVScroll);
    document.getElementById("gcHScrollSensitivity").addEventListener('input',syncHScroll);
    document.getElementById("gcHScrollSensitivityMan").addEventListener('input',syncHScroll);
    browser.storage.sync.get(defaults).then(function(options){
        console.log(options);
        for (const [key, value] of Object.entries(options)){
            let el = document.getElementById(key);
            if(el.type=="checkbox"){
                el.checked=value;
            }
            else if (key=="gcCopyUsernamesDel"){
                el.value=value.replaceAll("\\\\","\\");
            }
            else{
                el.value=value;
            }
            el.dispatchEvent(new Event("input"));
        };
    });
    
}

function syncVScroll(e){
    if (e.target.id=="gcVScrollSensitivity"){
        document.getElementById("gcVScrollSensitivityMan").value=e.target.value;
    } 
    if (e.target.id=="gcVScrollSensitivityMan"){
        document.getElementById("gcVScrollSensitivity").value=e.target.value;
    }   
}

function syncHScroll(e){
    if (e.target.id=="gcHScrollSensitivity"){
        document.getElementById("gcHScrollSensitivityMan").value=e.target.value;
    } 
    if (e.target.id=="gcHScrollSensitivityMan"){
        document.getElementById("gcHScrollSensitivity").value=e.target.value;
    }   
}



document.addEventListener('DOMContentLoaded', restore_options);