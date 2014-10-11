if(!$.cookie("AccToken"))
{ 
    window.location = '/index.html';
}
 //console.log($.cookie('LoggeduserId')) ;
function getLoggedInUserInfo()
{
    var url = $.cookie("idURL"); 
	
    client.ajax(url,
                 function(data){ 
                     $("#loggedInUser").html(data.display_name) ; 
                 },
                  function (error){
                      console.log(error);
                  },
                  'GET',
                   '',
                   true
                );
 
}

function getResourceLists(q,arr,compType) { 
      setAjaxMessage('loading ...');
      //addAPICount();
      client.query(q,
        function (data) { 
             $.each(data.records, function(i, obj)
            {   
                retObj = new Object();
                retObj.Id = obj.Id; 
                retObj.Name = obj.Name;
                arr.push(retObj) ;  
            });  
            prepareListOptions(arr,compType); 
			setAjaxMessage('');
        },
        function (error) {
            displayErrorModal("Error", JSON.stringify(error)); 
        }); 
}
var arrApex = new Array();
var arrVF = new Array();
var arrTrigger = new Array(); 
var curSelRes = new Object();

function getExistingFiles()
{ 
    getResourceLists('SELECT Id,Name FROM ApexClass Order By Name',arrApex,'ApexClass'); 
    getResourceLists('SELECT Id,Name FROM ApexPage Order By Name',arrVF,'ApexPage'); 
    getResourceLists('SELECT Id,Name FROM ApexTrigger Order By Name',arrTrigger,'ApexTrigger'); 
    
}
function prepareListOptions(arr,compType)
{ 
    var par = $("#lstPlaceholder") ; 
    var lbl = '' ;
     
    if(compType == 'ApexClass')
    {
        lbl = 'Apex Classes'; 
    }else if(compType == 'ApexPage')
    {
        lbl = 'Visualforce Pages'; 
    } 
    else if(compType == 'ApexTrigger')
    {
        lbl = 'Trigger'; 
    }
    
    if(arr.length > 0)
    {
        $('<li></li>').attr("class","dropdownSection").addClass("removeDuringSearch").html($("<a></a>").attr("href", "javascript:void(0)").text(lbl)).appendTo(par); 
    }
    $.each(arr, function (index, obj) {
        $('<li></li>').html($("<a></a>").attr("id",obj.Id).addClass("removeDuringSearch").attr("href", "javascript:void(0)").attr("compType", compType ).text(obj.Name)).appendTo(par); 
    }); 
     
    
}

getExistingFiles();
getLoggedInUserInfo(); 
 
$("#lstPlaceholder").on("click","a",function(e){ 
    setAjaxMessage('Getting Content ...'); 
    var TargetEle = $(e.target);
    curSelRes.Id = e.target.id;
	curSelRes.resType = TargetEle.attr('compType');
    getBody(); 
}); 

function showCode(isDisplay)
{
	if(curSelRes.resType == 'ApexClass' && !curSelRes.isNew)
		$("#symTableLink").css("display","");
	else
		$("#symTableLink").css("display","none");
		
	if(isDisplay)
	{
		$("#txtAreaBody").css("display","none");
		$("#codeBody").css("display",""); 		
	}
	else{
		$("#txtAreaBody").css("display","");
		$("#codeBody").css("display","none"); 
	}
	$("#logIdList").css("display","none"); 
}
function showSymbolTable()
{ 
	if($("#txtAreaBody").css('display') == 'none')
	{
		$("#txtAreaBody").css('display','');
		$("#codeBody").css("display","none"); 
	}
	else
	{
		$("#txtAreaBody").css('display','none');
		$("#codeBody").css("display",""); 
	}  
}

function getBody( ) {
setEditorLangMode(curSelRes.resType);
curSelRes.isNew = false ;
client.ajax('/'+client.apiVersion+'/tooling/sobjects/'+curSelRes.resType+'/'+curSelRes.Id,
                    function(data){ 
						if(data.Body)
							setCodeBody(data.Body);  
						else
							setCodeBody(data.Markup); 
					
						if(data.SymbolTable)
							curSelRes.SymbolTable = data.SymbolTable;
						else
							curSelRes.SymbolTable = [{'Message' : 'No Symbole Table Entry Found, Try to use ApexClassMember/ApexTriggerMember API'}];
						
						curSelRes.Name = data.Name ;	
						 $("#txtAreaBody").val(JSON.stringify (curSelRes.SymbolTable,null,'\t')); 
						 
                        //console.log(data);
						showCode(true);
						setAjaxMessage('');
                    },
                    function (error) { 
						console.log(error.responseText);
                        displayErrorModal("Error", error.responseText[0].message); 
                    },
                    'GET',
                    '',
                    true
               );
 
} 

function setAjaxMessage(msg)
{ 
    $("#ajaxStatusMsg").text(msg);
    
    //Clear message after 5 sec
    setTimeout(function() {
          $("#ajaxStatusMsg").text('');
    }, 5000);
    
}

function addAPICount()
{
    if(!$apiEle)
    {
        $apiEle = $("#apiCount");
    }
    
    $apiEle.text(parseInt($apiEle.text()) + 1) ; 
}
var $apiEle = $("#apiCount"); 

 

$( "#txtSearch" ).keyup(function(e) {
    var TargetEle = $(e.target);
    
    var srArrApex = new Array();
    var srArrVF = new Array();
    var srArrTrigger = new Array(); 
    
    if( $.trim(TargetEle.val()) != '')
    { 
        
        tmpArrApex = jQuery.grep(arrApex, function(n) {  
          return ( n.Name.indexOf(TargetEle.val()) >= 0 );
        });
        
        tmpArrVF = jQuery.grep(arrVF, function( n) {
          return ( n.Name.indexOf(TargetEle.val()) >= 0 );
        });
        tmpArrTrigger = jQuery.grep(arrTrigger, function( n) {
          return ( n.Name.indexOf(TargetEle.val()) >= 0 );
        });  

        $(".removeDuringSearch").remove();
        prepareListOptions(tmpArrApex,'ApexClass');
        prepareListOptions(tmpArrVF,'ApexPage');
        prepareListOptions(tmpArrTrigger,'ApexTrigger');
    }
    else{
        $(".removeDuringSearch").remove();
        prepareListOptions(arrApex,'ApexClass');
        prepareListOptions(arrVF,'ApexPage');
        prepareListOptions(arrTrigger,'ApexTrigger');
    }     
    
});

function displayErrorModal(title,msg)
{
    $("#errorModelText").html(msg);
    $("#errorModelTitle").html(title);
    $("#errorModelContainer").modal();
}

function showSetting()
{
    $("#settingModelContainer").modal();
}
 

$(document).keydown(function(event) {
	//Save
    if (event.which == 83 && (event.ctrlKey||event.metaKey)|| (event.which == 19)) {
        event.preventDefault();
        saveToServer();
        return false;
    }
	//Delete
	else if (event.which == 68 && (event.ctrlKey||event.metaKey)|| (event.which == 19)) {
        event.preventDefault();
        DeleteFromServer();
        return false;
    }
	//Logs
	else if (event.which == 76 && (event.ctrlKey||event.metaKey)|| (event.which == 19)) {
        event.preventDefault();
        getLatestLogIds();
        return false;
    }
	
    return true;
});

function saveToServer(){
    
    if(curSelRes.isNew){
        createResource();        
    }
    else if(curSelRes.resType == 'AnonymouseApex'){
        executeAnonymouseApex();
    }else {
        updateResource(curSelRes.Id);
    }
}

function updateResource(resId)
{
    setAjaxMessage('Trying to Update..');    
    createMetadataContainer(resId);    
}

function createMetadataContainer(resId)
{
    var metadataInfo = new Object();
    metadataInfo.Name = Date.now()+resId;
    
    metadataInfoJSON = JSON.stringify(metadataInfo);
    
    client.ajax('/'+client.apiVersion+'/tooling/sobjects/MetadataContainer',
                    function(data){ 
                        setAjaxMessage('MetadataContainer Created');
                        metadataInfo.id = data.id; 
                        createResourceMember(metadataInfo, resId,editor.getValue());
                    },
                    function (error) { 
						error = $.parseJSON(error.responseText); 
                        displayErrorModal(error[0].errorCode, error[0].message); 
                        //displayErrorModal("Error", JSON.stringify(error)); 
                    },
                    'POST',
                    metadataInfoJSON,
                    true
               );
}

function createResourceMember(metadataInfo, resId,newBody)
{
    console.log(metadataInfo.id);
	
    var createResourceMemberObj = new Object();
    createResourceMemberObj.MetadataContainerId = metadataInfo.id;
    createResourceMemberObj.ContentEntityId = resId;
    createResourceMemberObj.Body = newBody;
    
    apexClassMemberBodyJSON = JSON.stringify(createResourceMemberObj);
    
    client.ajax('/'+client.apiVersion+'/tooling/sobjects/'+curSelRes.resType+'Member',
                    function(data){
                        setAjaxMessage(curSelRes.resType+'Member Created');
                        metadataInfo.ApexClassMemberId = data.id;
                        applyCodeChanges(metadataInfo, resId,newBody);
                    },
                    function (error) {
                        deleteMetadataContainer(metadataInfo.id);
						error = $.parseJSON(error.responseText); 
                        displayErrorModal(error[0].errorCode, error[0].message); 
                        //displayErrorModal("Error", JSON.stringify(error)); 
                    },
                    'POST',
                    apexClassMemberBodyJSON,
                    true 
               );
}

function applyCodeChanges(metadataInfo, resId,newBody)
{
    console.log(metadataInfo.id);
    var containerAsyncRequestObj = new Object();
    containerAsyncRequestObj.MetadataContainerId = metadataInfo.id;
    containerAsyncRequestObj.isCheckOnly = false;
    
    containerAsyncRequestObjJSON = JSON.stringify(containerAsyncRequestObj);
    
    
     client.ajax('/'+client.apiVersion+'/tooling/sobjects/ContainerAsyncRequest',
                    function(data){
					 console.log(data); 
						setTimeout(checkStatus(data.id,metadataInfo),2000);						
                    },
                    function (error) {
                        deleteMetadataContainer(metadataInfo.id);
						error = $.parseJSON(error.responseText); 
                        displayErrorModal(error[0].errorCode, error[0].message);  
                        //displayErrorModal("Error", JSON.stringify(error)); 
                    },
                    'POST',
                    containerAsyncRequestObjJSON,
                    true 
               );
}

function checkStatus(asynchId,metadataInfo)
{
	client.ajax('/'+client.apiVersion+'/tooling/sobjects/ContainerAsyncRequest/'+asynchId,
                    function(data){
						if(data.State == "Completed")
						{
							setAjaxMessage('Code Saved');
							alert('Code Saved');
						}else if(data.State == "Queued")
						{
							setAjaxMessage('Saving Code...');
							setTimeout(checkStatus(asynchId,metadataInfo),3000);
						}else{
							deleteMetadataContainer(metadataInfo.id);
							displayErrorModal("Compiler Error", data.CompilerErrors); 
						} 					
                    },
                    function (error) { 
                        deleteMetadataContainer(metadataInfo.id);
						error = $.parseJSON(error.responseText); 
                        displayErrorModal(error[0].errorCode, error[0].message); 
                        //displayErrorModal("Error", JSON.stringify(error)); 
                    },
                    'GET',
                    '',
                    true
               );
}

function deleteMetadataContainer(metaId)
{	
    client.ajax('/'+client.apiVersion+'/tooling/sobjects/MetadataContainer/'+metaId,
                    function(data){
                        setAjaxMessage('MetaContainer Deleted');
                    },
                    function (error) {
                        
                    },
                    'DELETE',
                    null,
                    true
               );
}
 
function createResource() 
{
	setAjaxMessage('Trying to Create');
    var reqBody = new Object(); 
	
	if(curSelRes.resType == 'ApexPage')
	{
		curSelRes.Name = prompt('Please provide Label',''); 
		reqBody.MasterLabel = curSelRes.Name ;
		reqBody.Markup = editor.getValue();
		reqBody.Name = curSelRes.Name;
		if(reqBody.Markup.toLowerCase().indexOf('standardcontroller') > -1 )
		{
			reqBody.ControllerType = 1;
		}
		else if(reqBody.Markup.toLowerCase().indexOf('controller') > -1 )
		{
			reqBody.ControllerType = 3;
		}
		else
		{
			reqBody.ControllerType = 0;
		}
	}
	else if(curSelRes.resType == 'ApexTrigger')
	{
		reqBody.Body = editor.getValue();
		reqBody.TableEnumOrId = prompt('Please provide Name Of Object on Which Trigger is written ',''); 
	}
	else 
	{
		reqBody.Body = editor.getValue();
		reqBody.Name = curSelRes.Name ;
	}
     
    reqBody = JSON.stringify(reqBody);
    
    client.ajax('/'+client.apiVersion+'/tooling/sobjects/'+curSelRes.resType,
                    function(data){
						curSelRes.Id = data.id;
                        setAjaxMessage(curSelRes.resType+' - Created');
                        alert(curSelRes.resType+' - Created');
                    },
                    function (error) {
						error = $.parseJSON(error.responseText); 
                        displayErrorModal(error[0].errorCode, error[0].message); 
                        //displayErrorModal("Error", JSON.stringify(error)); 
                    },
                    'POST',
                    reqBody,
                    true
               );
}

function DeleteFromServer()
{
	if(confirm('Are you sure you want to delete this ?'))
	{
		client.ajax('/'+client.apiVersion+'/tooling/sobjects/'+curSelRes.resType+'/'+curSelRes.Id,
						function(data){
							setCodeBody('');
							setAjaxMessage(curSelRes.resType+' - Deleted');
							alert(curSelRes.resType+' -  Deleted');
						},
						function (error) {
							error = $.parseJSON(error.responseText); 
							displayErrorModal(error[0].errorCode, error[0].message); 
						},
						'DELETE',
						'',
						true
				   );
	}
}

function executeAnonymouseApex()
{ 
	setAjaxMessage('Trying to Execute Code');
	client.ajax('/'+client.apiVersion+'/tooling/executeAnonymous/?anonymousBody='+encodeURIComponent(editor.getValue()) ,
                    function(data){
						if(data.compiled)
						{
							setAjaxMessage('Code Executed Succesfully'); 
						}
						else{
							displayErrorModal('Compiler Error',data.compileProblem);
						} 
						console.log(data);						
                    },
                    function (error) {
					    error = $.parseJSON(error.responseText); 
                        displayErrorModal(error[0].errorCode, error[0].message); 
                    },
                    'GET',
                    '',
                    true
               );
}

function getLatestLogIds()
{ 
	setAjaxMessage('Loading Log Ids');
	var cList = $('ul.myCustomLogList');
	$("#logIdList").css('display','');
	$("#txtAreaBody").css("display","none");
	$("#codeBody").css("display","none"); 
		
	client.query('SELECT Id,LogUserId FROM ApexLog ORDER BY StartTime DESC LIMIT 1',
        function (data) {
			   $.each(data.records, function(i, obj)
				{   
					var li = $('<li/>') 
						.appendTo(cList);
					var aaa = $('<a/>')
						.addClass('ui-all')
						.text(obj.Id)
						.attr('href', 'javascript:getLogBody(\''+obj.Id+'\');')
						.appendTo(li);   
				});
				cList.appendTo($("#logIdList")); 
        },
        function (error) {
            error = $.parseJSON(error.responseText); 
            displayErrorModal(error[0].errorCode, error[0].message);
        }); 
}

function getLogBody(logId)
{
	setAjaxMessage('Fetching Log');
	client.ajax('/'+client.apiVersion+'/tooling/sobjects/ApexLog/'+logId+'/Body/',
                    function(data){ 
						 
                    },
                    function (error) {
						$("#txtAreaBody").css("display","");	
						$("#txtAreaBody").val(JSON.stringify (error.responseText,null,'\t'));  
                    },
                    'GET',
                    '',
                    true
               );
}