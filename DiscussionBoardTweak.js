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
    if(options.dbAddDownloadAll){
        var script = document.createElement("script");
        script.innerHTML = `
        jQuery(document).ready(function downloadPostZip(){
            var jsZipScript = document.createElement("script");
            jsZipScript.src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js";
            jsZipScript.type="text/javascript";
            jsZipScript.onload = function() {
                try{
                    var forumName = jQuery(".path a[title^='Forum:'").attr('title').substring(7);
                }
                catch (e){
                    var forumName = "DiscussionBoard";
                }
                
                var dbExZip = new JSZip();
                jQuery(".dbThread").each(function(i,v){
                    dbExZip.file(jQuery(".profileCardAvatarThumb",v).text().trim()+i+".txt",jQuery(".dbThreadBody",v).text().trim())
                });
                dbExZip.generateAsync({type:"base64"}).then(function (base64) {
                    jQuery("#actionbar .u_floatThis-left").append('<li class="mainButton" style="position: relative;"><a id="JSZipDownload" download="'+forumName+'" href="data:application/zip;base64,'+base64+'">Download Zip</a></li>');
                });
            }
            document.head.appendChild(jsZipScript);
        });

        `;
        document.body.appendChild(script);
    }

});
