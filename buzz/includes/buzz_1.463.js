function stripHTML(oldString) {
   var newString = "";
   var inTag = false;
   for(var i = 0; i < oldString.length; i++) {
        if(oldString.charAt(i) == '<') inTag = true;
        if(oldString.charAt(i) == '>') {
              inTag = false;
              i++;
        }
        if(!inTag) newString += oldString.charAt(i);
   }
   return newString;
}

function stripSlashes(str) {
	return str.replace(/\\/g, '');
}

function popupViewer(index) {
	var host = "";
	if (index==1) {
		window.open("http://image.minyanville.com/flash/ourtown/index.html","Book","width=800,height=600,resizable=yes,toolbar=no,scrollbars=no");
	} else if(index==2) {
		window.open("http://image.minyanville.com/flash/ourtown/scenicPopup.html","Viewer","width=640,height=400,resizable=yes,toolbar=no,scrollbars=no");
	}
}

function setBuzzWidth() {	
	switch (window_size) {
		case "s":
			buzzWidth=350;break;
		case "m":
			buzzWidth=500;break;
		case "l":
			buzzWidth=760; }
			
try {
  window.resizeTo(buzzWidth, 708);
} 
catch(e) {
}
			
}

function launchPage (url,name,fade) {
	if (fade==1) { // called from "view features" need to close that menu
		Effect.Fade('viewPopup');
		Event.stopObserving('content','click',toggleViewPopup);
	}
	var pars = 'width='+screen.availWidth+',height='+(screen.availHeight-60)+' ,toolbar=1, location=1, menubar=1, directories=1, scrollbars=1,resizable=1'
	window.open(url,name,pars);
	//return false;
}


//BOOKMARKS MODULE
function launchBookmark (id, anchorname, context) { // opens bookmark and search popups
	var url = "bookmark.php?id=" + id + "&s=" + text_size + "&context=" + context + "&chars=" + characters; 
	var bookmark = new PopupWindow();
	bookmark.setSize(buzzWidth,400);
	bookmark.setUrl(url);
	bookmark.showPopup(anchorname);
    if (context=="bookmark") {toggleBookmark();}
	return false;
}

function launchBookmarkFromURL (url) {
	var bookmark = new PopupWindow();
	if (typeof(buzzWidth) == "undefined")
		var buzzWidth=350;
	bookmark.setSize(buzzWidth,400);
	bookmark.setUrl(url);
	bookmark.showPopupNoAnchor();
	return false;
}

function deleteBookmark(id) { // fired from bookmark popup
	var url = 'bookmark_delete.php';
	var pars = 'sid=' + sid + '&bbid=' + id;
	var myAjax4 = new Ajax.Request(url, {method: 'post', parameters: pars, onComplete:refreshBookmarks});
}

function addBookmark(id) { // fired from article - maybe add to search popup?
	var url = 'bookmark_add.php';
	var pars = 'sid=' + sid + '&bbid=' + id;
	var myAjax4 = new Ajax.Request(url, {method: 'post', parameters: pars, onComplete:finishAddBookmark});
}

function finishAddBookmark () {
	alert("Bookmark added."); // or something else to tell user the operation was successful
	refreshBookmarks();
}


// PRINTING MODULE
function printPostID (id) {
	var url = "print.php?id=" + id + "&s=" + text_size + "&chars=" + characters; 
	var printJob = new PopupWindow();
	printJob.setSize(450,600);
	printJob.setUrl(url);
	printJob.setWindowProperties("resizable=1,toolbar=0, location=0, menubar=0, directories=0, scrollbars=1");
	printJob.showPopupNoAnchor();
	return false;
}

function printAllPosts () {
	var url = "print.php?s=" + text_size + "&chars=" + characters; 
	var printJob = new PopupWindow();
	printJob.setUrl(url);
	printJob.setWindowProperties("resizable=1,toolbar=0, location=0, menubar=0, directories=0, scrollbars=1");
	printJob.showPopupNoAnchor();
	return false;
}
	
/*
   ====================
   ALERTS MODULE 
   ====================
*/
function checkforbuzzinit()
{
	var url = 'getlatesttimestamp.php';
        var pars = null;
        var myAjax4 = new Ajax.Request(url, {method: 'post', parameters: pars, onComplete:checklatesttimeinit})
}
function checklatesttimeinit(req)
{
	currentLatest = parseInt(req.responseText);
	latestTimeStamp = currentLatest;
}

function checkForNewBuzz() {
	//alert("checking for latest buzz");
	var url = 'getlatesttimestamp.php';
	var pars = null;
	var myAjax4 = new Ajax.Request(url, {method: 'post', parameters: pars, onComplete:checkLatestTimeStamp});
}

var currentLatest = 0;
function checkLatestTimeStamp (req) {
	//alert(req.responseText);
	currentLatest = parseInt(req.responseText);
	if ((currentLatest > 0) && (currentLatest > latestTimeStamp)) {
		//alert("retrieving latest buzz");
		var url = 'get_latest.php';
		var pars = 'sid=' + sid;
		var myAjax4 = new Ajax.Request(url, {method: 'post', parameters: pars, onComplete:processLatestBuzz});
	}
}

function processLatestBuzz (req) {
  try {
   if (req.responseText.length > 0) {
    //  update latestTimeStamp
    latestTimeStamp = currentLatest;
	// req is passed from checkForNewBuzz. Contains new postID, author, and type (post or article), and title. Parsed as JSON.
	//alert(req.responseText);
	post = eval('('+req.responseText+')');
	post.title = stripSlashes(post.title);
	var actionTaken = null;
	var postLink = null;
	//alert("processing latest buzz. latestID: " + latestID + " and post.ID: " + post.ID);
	if (latestID == null) {
		// this is a first run, so set the latest post variable and exit
		if (nav.page != 1 && nav.lastPage != 1) {
			latestID = post.ID;
			return;
		}
	}
	if (post.ID != latestID || (nav.noPrev == true && nav.lastPage == 1)) {
		if (post.author=="null") post.author=null;
		if (post.title=="null") post.author=null;
		if (post.ID=="null") post.ID=null;
		latestID = post.ID;
		// send info to the Flash movie and order it to flash new post alert
		var postText = "By " + post.author; 
		var postLink = null;		
		if (post.type=="ARTICLE")
			{postLink = 'javascript:launchPage("/articles/index.php?a=' + post.articleID + '","articleLink",0);'} // if an article then the whole function call is built into the postID otherwise it's just a number
		else
			{postLink = "javascript:jumpToPost(" + post.ID + ",'snapto');";}
		if (alerts == 1) {
		//alert("go for the alert");
			var alertPopup = new PopupWindow();
			alertPopup.setSize(200,120);
			var alertText ='<html><head><style type="text/css">body{text-align:center;color:white;background-color:red;font:11px/16px Arial,Helvetica,sans-serif;font-weight:bold;margin:0 0 0 0;cursor:pointer;width:200px;height:90px;}';
			alertText += 'img {width:200px; height:23px; margin-bottom:15px;}</style><script type="text/javascript">setTimeout(\'self.close()\',15000);';
			if (post.type=="POST")
				alertText += 'function letsGo() {opener.focus();opener.jumpToPost(' + post.ID + ',\'snapto\');self.close();}';
			else if (post.type=="ARTICLE")
				alertText += 'function letsGo() {opener.launchPage("/articles/index.php?a=' + post.articleID + '","articleLink",0);self.close();}';
			alertText += '</script></head>';
			alertText += '<body onclick="javascript:letsGo();">';
			alertText += '<img src="images/alert_header.gif" /><br />NEW ' + post.type + ' BY<br />' + post.author + ' <br />"' + post.title + '"</body></html>';
			alertPopup.populate(alertText);
			alertPopup.autoHide();
			alertPopup.showBuzzAlert(); 
			
			//alertWindow.focus();
		
		} 	
		
		try {
	    	document.movie22.SetVariable("postText",postText); 
			document.movie22.SetVariable("postLink",postLink);
		} catch (e) {
		}

		// check for autojump and alert window prefs, do the necessary
		if (auto_jump == 1 || nav.page == 0) { 
			jump.gotoPos = null;
			jump.oldHeight = null;
			toggleBuzzTab();
			jumpToPost(post.ID);
			actionTaken=1; 
		} else if (nav.page == nav.lastPage && actionTaken!=1) {
			jump.gotoPos = $("articles").scrollTop;
			jump.oldHeight = $("articles").scrollHeight;
			toggleBuzzTab();
			jumpToPost(post.ID);
			actionTaken = 1;
		}
		if (actionTaken != 1) {loadNavigation(nav.page); refreshPostMenu();}
			//	alert("after refresh");
    }
   }
  } catch (e) {
  }
}

/*
   ====================
   TAB BAR MODULE 
   ====================
*/

// Since there are only two tabs, went with manual rather than generalized solution.
function toggleBuzzTab() {
	var x=$("tabBuzz");
	if (x.className=="buzzOver") {
		$("tabSearch").className="searchOff";
		x.className="buzzOn";
		Element.hide("search");
		Element.hide("prefs");
		//if ($("search").style.display != "none") new Effect.Fade("search", {duration: .15});
		//if ($("prefs").style.display != "none") new Effect.Fade("prefs", {duration: .15});
		new Effect.BlindDown("content", {duration: .2});
		dropDownPos();
	}
	if (x.className=="buzzOff") {
		Element.hide("search");
		Element.hide("prefs");
		//if ($("search").style.display != "none") new Effect.Fade("search", {duration: .15});
		//if ($("prefs").style.display != "none") new Effect.Fade("prefs", {duration: .15});
		$("tabSearch").className="searchOff";
		x.className="buzzOn";
		new Effect.BlindDown("content", {duration: .2});
		dropDownPos();
	}
}

function toggleSearchTab() {
	if ($("tabSearch").className=="searchOver") {
		$("tabSearch").className="searchOn";
		$("tabBuzz").className="buzzOff";
		Element.hide("content");
		Element.hide("prefs");
		//if ($("content").style.display != "none") new Effect.Fade("content", {duration: .15});
		//if ($("prefs").style.display != "none") new Effect.Fade("prefs", {duration: .15});
		new Effect.BlindDown("search", {duration: .2});
		dropDownPos();
		//Element.show("search"); 
	}
}

function tabBuzzRollover () {
	var x = $('tabBuzz'); 
	if (x.className == "buzzOn") {return;}
	if (x.className == "buzzOff") {x.className = "buzzOver"; return;}
	if (x.className == "buzzOver"){x.className = "buzzOff";}
}

function tabSearchRollover (e) {
	var x = $('tabSearch'); 
	var y = e.type; // so that user eager to search doesn't mess up the rollover by having the mouse on the tab as the page loads
	if (x.className == "searchOn") {return;}
	if (x.className == "searchOff" && y == "mouseout") return;
	if (x.className == "searchOff") {x.className = "searchOver"; return;}
	if (x.className == "searchOver"){x.className = "searchOff";}
}


/*
   ====================
   DROPDOWN MENU MODULE 
   ====================
*/
// These functions help to place the menu where it belongs when the window size changes

function findPosX(obj) {
	var curleft = 0;
	if (obj.offsetParent) {
		while (obj.offsetParent) {
			curleft += obj.offsetLeft
			obj = obj.offsetParent;
		}
	}
	else if (obj.x)
		curleft += obj.x;
	return curleft;
}

function findPosY(obj) {
	var curtop = 0;
	if (obj.offsetParent) {
		while (obj.offsetParent) {
			curtop += obj.offsetTop
			obj = obj.offsetParent;
		}
	}
	else if (obj.y)
		curtop += obj.y;
	return curtop;
}

function getWindowHeight() {
	var windowHeight=0;
	if (typeof(window.innerHeight)=='number') {
		windowHeight=window.innerHeight;
	} else {
		if (document.documentElement && document.documentElement.clientHeight) {
			windowHeight=document.documentElement.clientHeight;
		} else {
			if (document.body&&document.body.clientHeight) {
				windowHeight=document.body.clientHeight;
			}
		}
	}
	return windowHeight;
}

function dropDownPos() {
	
	// then size the main content divs so they're the proper height
	var a = getWindowHeight();
	if (a > 370) {
		var b = a - 241 + "px"; // content layer
		var c = a - 308 + "px"; // articles div 
		var d = a - 256 + "px"; // search layer
		var e = a - 368 + "px"; // searchResults div
		var f = a - 341 + "px"; // sublayer class (prefs tabs) 
		var g = a - 241 + 107 + "px";
		$("prefs").style.height = b;
		$("content").style.height = b;
		$("search").style.height = d;
		$("articles").style.height = c;
		$("searchResults").style.height = e;
		$("prefsSubEdit").style.height = f;
		$("prefsSubFilter").style.height = f;
		$("innerOuterBorder").style.height = g;
	}
	
	// first make sure the buttons and dropdown menus stay where they are supposed to be in the middle
	var id=$("postMenu");
	var id2=$("bookMenu");
	var id3=$("viewPopup");
	var rel=$("jumpToPost");
	var y=$("viewFeatures");
	var wid=$("bookmark");
	var x_top = findPosY(y) - 53;
	var x_left = findPosX(y) - 1;
	id3.style.top = x_top + "px";
	id3.style.left = x_left + "px";
	var xid=findPosX(rel)+"";
	var yid=findPosY(rel)+ 16;
	var w=findPosX(wid) - xid + 157;
	w = w+"";
	yid = yid+"";
	id.style.left=xid + "px";
	id.style.top=yid + "px";
	id.style.width=w + "px";
	id2.style.left=xid + "px";
	id2.style.top=yid + "px";
	id2.style.width=w + "px";

	return;
}

function toggleJump() {
	if ($("postMenu").style.display == "none") {
		toggleBuzzTab();
		Element.hide("bookMenu");
		$("bookmark").className="";
		$("jumpToPost").className="dropdownHover";
		dropDownPos();
		new Effect.Appear("postMenu", {duration: .1});
		Event.observe('content','click',toggleJump);
	} else {
		new Effect.Fade("postMenu", {duration: .1});
		$("jumpToPost").className="";
		Event.stopObserving('content','click',toggleJump);
	}
}

function toggleBookmark() {
	var x = $('bookMenu').style.display;
	switch (x) {
		case "none":
			toggleBuzzTab();
			Element.hide("postMenu");
			$("jumpToPost").className="";
			$("bookmark").className="dropdownHover";
			dropDownPos();
			new Effect.Appear("bookMenu", {duration: .1});
			Event.observe('content','click',toggleBookmark);
			break;
		default:
			$("bookmark").className="";
			new Effect.Fade("bookMenu", {duration: .1});
			Event.stopObserving('content','click',toggleBookmark);
	}
}

function toggleViewPopup() {
	var x = $('viewPopup');
	var y = $('viewFeatures');
	var x_top = findPosY(y) - 162;
	var x_left = findPosX(y) - 1;
	x.style.top = x_top + "px";
	x.style.left = x_left + "px";
	if (x.style.display=="none") {
		new Effect.Appear(x, {duration:.15});
		Event.observe('content','click',toggleViewPopup);
		Event.observe('search','click',toggleViewPopup);
		Event.observe('prefs','click',toggleViewPopup);
		} else {
		Event.stopObserving('content','click',toggleViewPopup);
		Event.stopObserving('search','click',toggleViewPopup);
		Event.stopObserving('prefs','click',toggleViewPopup);
		new Effect.Fade(x, {duration:.15}); 
		}
}

function refreshBookmarks() {
	var url = '_bookmarks.php';
	var pars = 'sid=' + sid;
	var target = 'bookMenu';
	var myAjax = new Ajax.Updater(target, url, {method: 'post', parameters: pars});
	return false;
}

function refreshPostMenu() {
	var url = '_jump_to_post.php';
	var pars = 'sid=' + sid;
	var myAjax = new Ajax.Request(url, {method: 'post', parameters: pars, onComplete:finishRefreshingPostMenu});
	return false;
}

function finishRefreshingPostMenu(req) {
	if (req.responseText.length > 0) {
		$("postMenu").innerHTML = req.responseText;
	} else {
		var el = $("articles").innerHTML;
		if (el.indexOf("There are no posts to display") != -1)
			$("postMenu").innerHTML = "There are no posts.";
			else refreshPostMenu();
	}
}

/* =========================
	PREFERENCES MODULE
   ========================= */

function togglePrefs() {
	if ($("prefs").style.display=="none") {
		//if ($("content").style.display != "none") new Effect.Fade("content",{duration:.15});
		//if ($("search").style.display != "none") new Effect.Fade("search", {duration: .15});
		Element.hide("content");
		Element.hide("search");
		new Effect.BlindDown("prefs",{duration:.2});
		$("tabBuzz").className="buzzBlue";
		$("tabSearch").className="searchBlue";
		$("editPrefs").className="prefButtonOver";
	} else {
	 	Element.hide("prefs");
	 	//new Effect.Fade("prefs",{duration:.15}); 
		new Effect.BlindDown("content",{duration:.2});
		$("tabBuzz").className="buzzOn";
		$("tabSearch").className="searchOff";
	}
}
	
function prefsRollover () {
	var x = $('editPrefs'); 
	if ($('prefs').style.display == "block") {return;}
	if (x.className == "prefButtonOn") {x.className = "prefButtonOver"; return;}
	if (x.className == "prefButtonOver"){x.className = "prefButtonOn";}
}

function switchToEdit() {
	Element.hide("prefsSubFilter");
	Element.show("prefsSubEdit");
	$("prefEdit").className="prefSelected";
	$("prefFilter").className="filterDeselected";
}

function switchToFilter() {
	Element.hide("prefsSubEdit");
	Element.show("prefsSubFilter");
	$("prefEdit").className="prefDeselected";
	$("prefFilter").className="filterSelected";
}

function getRadioButtonValue (radio) {   
	for (var i = 0; i < radio.length; i++) {
		if (radio[i].checked) { break }
	}
	return radio[i].value
}

function setSelectedRadioButton(radioArray, radioValue) {
	var found = 0;
    for (i = 0; radioArray[i]; i++) {
        if (radioArray[i].value == radioValue) {
            radioArray[i].checked = true;
            found = 1;
        }
    }
    if (found == 0) {
        alert("Error: Could not locate " + 
                thisValue + " in " + thisSelect + ".");
    }
}

function conformToPrefs() {
	//setBuzzWidth();
	//window.resizeTo(buzzWidth, 708);
	//alert(text_size);
	
	switch (text_size) {
		case "s":
			document.body.className = "sizeSmall"; break;
		case "m":
			document.body.className = "sizeMedium"; break;
		case "l":
			document.body.className = "sizeLarge"; 
	}
	if (prefs.reload ==1)
		if (topPage) jumpToTimeStamp(topPage); //most reliable way of returning subscriber to post they were looking at before the prefs
		else jumpToLatestPost();
	
}

function readPrefsForm() {
	var changed = 0;
	var reload = 0;
	var characters1 = getRadioButtonValue(document.formPrefs.characters);
	var alerts1 = getRadioButtonValue(document.formPrefs.alerts);
	var window_size1 = getRadioButtonValue(document.formPrefs.window_size);
	var text_size1 = getRadioButtonValue(document.formPrefs.text_size);
	var auto_jump1 = getRadioButtonValue(document.formPrefs.auto_jump);
	var posts_per_page1 = getRadioButtonValue(document.formPrefs.posts_per_page);
	numTeachers = document.formPrefs.numTeachers.value;
	
	if (characters != characters1) {characters = characters1; changed = 1; reload = 1;}
	if (alerts != alerts1) {changed = 1; alerts = alerts1;}
	if (window_size != window_size1) {changed = 1; window_size = window_size1;}
	if (text_size != text_size1) {changed = 1; text_size = text_size1;}
	if (auto_jump != auto_jump1) {changed = 1; auto_jump = auto_jump1;}
	if (posts_per_page != posts_per_page1) {changed = 1; reload = 1; posts_per_page = posts_per_page1;}
	
	return [changed, reload];	
	
}

function submitPrefsForm() {
	
	trackviews("/Buzz_Preferences");
	prefs.changed = 0; 
	prefs.reload = 0;
	var x = readPrefsForm();
	prefs.changed = (x[0]==1) ? 1 : 0; // find out if anything changed
	prefs.reload  = (x[1]==1) ? 1 : 0; // find out if changes require reload
	var cidString = "";
	var shString = "";
	for (var i=0;i<teacherID.length;i++) {
		var id=eval("document.formPrefs.teacher"+i);
		var id2=getRadioButtonValue(id);
		if (teacherSH[i] != id2) {prefs.changed = 1; prefs.reload = 1;}
		teacherSH[i] = id2;
		if (i == teacherID.length -1) { 
			cidString += teacherID[i];
			shString  += teacherSH[i];
		} else {
			cidString += teacherID[i] + ":";
			shString  += teacherSH[i] + ":";
		}
	}
	var pars = 'sid=' + sid;
	pars += '&characters=' + characters;
	pars += '&alerts=' + alerts;
	pars += '&window_size=' + window_size;
	pars += '&text_size=' + text_size;
	pars += '&auto_jump=' + auto_jump;
	pars += '&posts_per_page=' + posts_per_page;
	pars += '&cidString=' + cidString;
	pars += '&shString=' + shString;
	if (prefs.changed == 1) 
		var myAjax = new Ajax.Request('scripts/pref_submit.php', {method: 'post', parameters: pars, onComplete:finishSubmit});
	else finishSubmit();
}

function finishSubmit(req) {
	if (prefs.changed == 1 && prefs.reload == 0) //fixHeight();
	togglePrefs();
	if (prefs.changed == 1) setTimeout('conformToPrefs()',1000);
}

function cancelSubmit() {
	//reset form values based on preferences variables
	setSelectedRadioButton(document.formPrefs.characters, characters);
	setSelectedRadioButton(document.formPrefs.alerts, alerts);
	setSelectedRadioButton(document.formPrefs.window_size, window_size);
	setSelectedRadioButton(document.formPrefs.text_size, text_size);
	setSelectedRadioButton(document.formPrefs.auto_jump, auto_jump);
	setSelectedRadioButton(document.formPrefs.posts_per_page, posts_per_page);
	for (var i=0; i<teacherID.length; i++) {
		id=eval("document.formPrefs.teacher" + i);
		setSelectedRadioButton(id, teacherSH[i]);
	}
	togglePrefs();
}



//SEARCH MODULE
function submitSearchForm() {
	var url = '_search.php'; 
	var mo = document.searchForm.mo.value;
	var day= document.searchForm.day.value;
	var year=document.searchForm.year.value;
	var pars = 'q=' + $F('q') + '&mo=' + mo + '&day=' + day + '&year=' + year + '&author=' + $F('author');
	var myAjax = new Ajax.Request(url, {method: 'post', parameters: pars, onLoading: showProgress('searchResults'), onComplete:finishSearchRequest});
	return false;
}

function finishSearchRequest (req) {
	if (req.responseText)
		$('searchResults').innerHTML = req.responseText;
	else 
		$('searchResults').innerHTML = "There was a problem with your request.";
}

//CONTENT MODULE 

function documentKeyDown(oEvent){ // controls keyboard navigation
	var oEvent = (typeof oEvent != "undefined")? oEvent : event;
	var oTarget = (typeof oEvent.target != "undefined")? oEvent.target : oEvent.srcElement;
	var intKeyCode = oEvent.keyCode;
	switch(intKeyCode){			
		//case 8: 
		case 37:
		case oEvent.altKey && 37:
			oEvent.cancelBubble = true;
			oEvent.returnValue = false;
			if(oEvent.preventDefault){
				oEvent.preventDefault();
			}
			if (nav.prevPage && nav.noPrev==false) {
				//alert("loading page " + nav.prevPage);
				loadPage(nav.prevPage);
			}
			return false;
		case 13:
			if ($("search").style.display != "none")
				{submitSearchForm(); break;}
		//case 32: allow spacebar to trigger a page down
		case 39:
			oEvent.cancelBubble = true;
			oEvent.returnValue = false;
			if(oEvent.preventDefault){
				oEvent.preventDefault();
			}
			if (nav.nextPage && nav.noNext==false) {
				//alert("loading page " + nav.nextPage);
				loadPage(nav.nextPage);
			}
			return false;
	}	
}

function cancelDefaultNavigationEvents(oEvent){ // no back button screwups
	var oEvent = (typeof oEvent != "undefined")? oEvent : event;
	var oTarget = (typeof oEvent.target != "undefined")? oEvent.target : oEvent.srcElement;
	var intKeyCode = oEvent.keyCode;
	switch(intKeyCode){			
		//case 8:
		case oEvent.altKey && 37:
		case oEvent.altKey && 39:
			oEvent.cancelBubble = true;
			oEvent.returnValue = false;
			if(oEvent.preventDefault){
				oEvent.preventDefault();
			}
			documentKeyDown(oEvent);
			break;
	}	
	
}

function callInProgress (xmlhttp) {
	switch (xmlhttp.readyState) {
		case 1: case 2: case 3:
			return true;
			break;
		// Case 4 and 0
		default:
			return false;
			break;
	}
}

function showFailureMessage() {
	//alert('uh oh, it looks like the network is down. Try again shortly');
	//window.refresh;
	toggleBuzzTab();
}

// Register global responders that will occur on all AJAX requests
Ajax.Responders.register({
	onCreate: function(request) {
		request['timeoutId'] = window.setTimeout(
			function() {
				// If we have hit the timeout and the AJAX request is active, abort it and let the user know
				if (callInProgress(request.transport)) {
					request.transport.abort();
					showFailureMessage();
					// Run the onFailure method if we set one up when creating the AJAX object
					if (request.options['onFailure']) {
						request.options['onFailure'](request.transport, request.json);
						}
					}
				}, 10000 // Ten seconds
			);
		},
		onComplete: function(request) {
		// Clear the timeout, the request completed ok
		window.clearTimeout(request['timeoutId']);
	}
});

function showProgress (id) { // puts spinner in specified div
	var x = $(id);
	x.innerHTML = '<div class="progress">Loading... <img src="images/spinner.gif" /></div>';
	// this would be a good place to include a timeout function
}

function showFailure (id) {
	var x = $(id);
	x.innerHTML = '<div class="progress">There has been an error accessing the server. Please check your Internet connection and try again.</div>';
}

function loadPage(page) {
	trackviews("/Buzz_Navigation");
	
	var url = '_content.php'; 
	var pars = 'sid=' + sid + '&page=' + page + "&chars=" + characters + "&posts=" + posts_per_page; 
	var myAjax2 = new Ajax.Request(url, {method: 'post', parameters: pars, onLoading:showProgress('articles'), onComplete:finishLoadingPage});
	
}

function finishLoadingPage(req) {
  try {
   if (req.responseText.length>0) {
//	if (req.responseText.length>0) {
	$('articles').innerHTML = req.responseText;
	
//CG 6/28/06 attempt to fix security
//turned out to be too aggressive, I think because of multiple connections
//	if (req.responseText.indexOf("HTTP-EQUIV='Refresh'")) {
//		window.location.replace('http://www.minyanville.com/buzz/buzz.php');
//	}
	
	if (req.responseText.indexOf("There are no posts to display") == -1) {
		currentPage = $("pageNo").innerHTML;
		topPage = $("topPage").innerHTML;
		$('articles').scrollTop = 0;
		makeLinksIntoPopups();
		//fixHeight();
		//alert("made it this far");
		loadNavigation(currentPage);
	} else {
		window.refresh();
	}
   } else
    latestTimeStamp = 0;
  } catch (e) {
    latestTimeStamp = 0;
  }
}

function loadNavigation(page) {
	//alert("attempting to load navigation");
	var url = '_navigation.php';
	var pars = 'sid=' + sid + '&page=' + stripHTML(page) + "&posts=" + posts_per_page;
	var target = 'navigation';
	//alert (pars);
	var myAjax3 = new Ajax.Request(url, {method: 'post', parameters: pars, onComplete:finishLoadingNavigation});
	return;
}

function trackviews(page){	 
	_uacct="UA-30222-1";
	urchinTracker(page);	
	_uacct="UA-30222-9";
	urchinTracker(page);	
}

function finishLoadingNavigation(req) {

	if(latestID==null)
	{
		checkforbuzzinit();
	}
	nav = eval('(' + req.responseText + ')');
	var navigation = null;
	navigation = '<a href="javascript:void(0);" onclick="jumpToLatestPost(); return false;" id="latestPost">latest post</a>';
	navigation += '<a href="javascript:void(0);" onclick="printAllPosts(); return false;" id="printAll" name="printAll"><img src="images/print_all.gif" /></a>';
	navigation += '<div id="navPages">';
	navigation += '<p><a href="javascript:void(0);" class="noUnderline" style="cursor:text ">pages</a></p>';
	if (nav.noPrev==true) {
		navigation += '<p><span class="noUnderline grayout">back &lt &nbsp;';
	} else {
		navigation += '<p><a href="javascript:void(0);" class="noUnderline" onclick="loadPage(' + nav.prevPage + '); return false;">back &lt;</a>&nbsp; ';
	}
	if (nav.startPage > 0) {
		for (i=nav.startPage; i<=nav.endPage; i++) {
			navigation += '&nbsp;<a href="javascript:void(0);" onclick="loadPage(' + i + '); return false;"';
			if (i == nav.page) {navigation+= ' class="currentPage"';} 
			navigation += '>' + i + '</a>';
		}
	}
	if (nav.noNext==true) {
		navigation += '<span class="noUnderline grayout">&nbsp; &gt; next';
	} else {
		navigation += '&nbsp; <a href="javascript:void(0);" class="noUnderline" onclick="loadPage(' + nav.nextPage + '); return false">&gt; next</a>';
	}
	navigation += '</p></div><div class="clear"></div>';
	$("navigation").innerHTML = navigation;
	return;
}

function jumpToLatestPost() {

	trackviews("/Buzz_LatestpostAndPageRefresh");
	var pars = 'sid=' + sid + '&latest=1&chars=' + characters + "&posts=" + posts_per_page;
	jumpToId = 'latest';
	//alert("jumping to latest post. pars: " + pars);
	jumpRequest(pars);
}

function jumpToPost(id,snap) {
	
	trackviews("/Buzz_JumpToPost");
	// first take the user to the place they can see the post
	//if (alertWindow && alertWindow.open && !alertWindow.closed) {alertWindow.close();}
	var snap = (snap == null) ? "nosnap" : snap;
	if (snap == "snapto") toggleBuzzTab();
	$("jumpToPost").className="";
	if ($("postMenu").style.display != "none") {Effect.Fade("postMenu");}
		Event.stopObserving('content','click',toggleJump);
	//toggleBuzzTab();
	if ($("prefs").style.display != "none") 
	  togglePrefs();
	jumpToId = 'post' + id; // then send a request for the post
	var pars = 'sid=' + sid + '&bbid=' + id + "&chars=" + characters + "&posts=" + posts_per_page;
	jumpRequest(pars);
}

function jumpToTimeStamp(udate) {
	if ($("prefs").style.display != "none") 
	  togglePrefs();
	jumpToId = 'latest';
	var pars = 'sid=' + sid + '&udate=' + udate + "&chars=" + characters + "&posts=" + posts_per_page;
	jumpRequest(pars);
}

function reloadLastPage(id) {

}

function jumpRequest(pars) {
	var url = '_content.php';
	var myAjax4 = new Ajax.Request(url, {method: 'post', parameters: pars, onLoading:showProgress('articles'), onComplete:finishJump});
}

function finishJump(req) {
	//alert(req.responseText);
    try { // on the first try Firefox returns errors on status, so run again
      var status;
      status = req.status;
    } catch (e) {
      //  caught error - try again in .5 seconds
      setTimeout('jumpToLatestPost()', 500);
      return;
    }
    //if (req.responseText.indexOf("There are no posts to display") == -1) {
		if (jumpToId != "latest") $("content").style.visibility = "hidden";
		//alert(req.responseText);
		$('articles').innerHTML = req.responseText;
		//fixHeight();
		//alert("done fixing height");	
		currentPage = $('pageNo').innerHTML;
		if (typeof($('topPage')) == 'object')
			topPage = $('topPage').innerHTML;
		else
			topPage = null;
		
		if (typeof($('latestPostID')) == 'object')
			latestID = $('latestPostID').innerHTML;
		//alert(latestID);
		loadNavigation(currentPage);
		if (jumpToId != "latest") setTimeout("jumpScroll()",500);
	//} else {
	//	loadPage(currentPage);
	//}
	makeLinksIntoPopups();
	refreshPostMenu();
	return;
}

function fixHeight () {
	var h = null;
	var z = document.getElementsByClassName("articleBody"); 
	//alert(z.length);
	if (characters == 0) {
		switch (text_size) {
			case "s": h = 90; break;
			case "m": h = 120; break;
			case "l": h = 140; break;
		}
	}
	else if (characters == 1) {
		switch (text_size) {
			case "s": h= 180; break;
			case "m": h= 210; break;
			case "l": h= 240; break;
		}
	}
	h = h + "px";
	//alert('calculated h:' + h);
	for (i=0;i<z.length;i++) {
		z[i].style.height = h;
	}
	//alert('done adjusting height');
}	

function jumpScroll() {
		if (jump.gotoPos != null) {
			var x = $("articles").scrollHeight - jump.oldHeight;
			if (x > 0) {
				$("articles").scrollTop = jump.gotoPos + x;
			} else {
				$("articles").scrollTop = 0;
			}
		} else {
			var x = eval("$('" + jumpToId + "')");
			$("articles").scrollTop = x.offsetTop; 
		}
		Element.hide("content");
		$("content").style.visibility = "visible";
		new Effect.BlindDown("content",{duration:.2});
}	

function makeLinksIntoPopups() {		
	var popup2 = document.getElementsByClassName("articleBody");
    for (var j=0; j<popup2.length; j++) {    	
		var links = popup2[j].getElementsByTagName('a');
	    for (var i=0; i<links.length-2; i++) {
		  var name= "link" + i + j +"";	
      	  var url = links[i].getAttribute('href');      	 
	      if (url.indexOf("bookmark.php") == -1) {
	        args = "javascript:launchPage('" + url + "','" + name + "',0);void(0);";
	  	  } else {
	  	  	args = "javascript:launchBookmarkFromURL('" + url + "');void(0);";
	  	  }
        links[i].href = args;
	  	}
	}
}

function makeLinksIntoPopupsPr() {
	var popup2 = document.getElementsByClassName("articleBody");
    for (var j=0; j<popup2.length; j++) {
		var links = popup2[j].getElementsByTagName('a');
	    for (var i=0; i<links.length; i++) {
		  var name= "link" + i + "";
      	  var url = links[i].getAttribute('href');
	      if (url.indexOf("bookmark.php") == -1) {
	        args = "javascript:launchPage('" + url + "','" + name + "',0);void(0);";
	  	  } else {
	  	  	args = "javascript:launchBookmarkFromURL('" + url + "');void(0);";
	  	  }
        links[i].href = args;
	  	}
	}
}

function inputFillCheck (item, initValue) {
	if (item.value==""){
		item.className="inputFillOff";
		item.value=initValue;
	}
	else if (item.value==initValue){
		item.value="";
		item.className="inputFillOn";
	}
}
function popWin(){
	
	symbol = document.yahoo.symbol.value.replace(/^\s+$/g,"");

	if( symbol.length == 0 )
	{
		alert("Please enter a symbol.");
		document.yahoo.symbol.focus();
		return false;
	}
	trackviews("/TDsearch");
	var searchStr = 'http://research.tdameritrade.com/public/stocks/overview/overview.asp?symbol=' + symbol;
	window.open(searchStr,null,"height=600,width=790,status=yes,toolbar=no,menubar=no,location=no,resizable=yes, scrollbars=yes,top=0,left=0");
}

function yahooSubmit() {
	trackviews("/yahoosearch");
	var url = "http://finance.yahoo.com/q?s=" + $F("s") + "&x=40&y=20&partner=mv";
	launchPage(url,"yahooSymbolSearch",0);
}
var inc = 1;

function docKeyDown1(oEvent){ // controls keyboard navigation
var oEvent = (typeof oEvent != "undefined")? oEvent : event;
var oTarget = (typeof oEvent.target != "undefined")? oEvent.target : oEvent.srcElement;
var intKeyCode = oEvent.keyCode;
 
if(intKeyCode==17)
{
	inc=0;
	 
}
if (inc==0)
{
	if(intKeyCode==65 || intKeyCode==97 )
	{
			
		return(false);   //in case of IE & firefox1.5
				
	}
	
	
}
	
} 
function disableclick()
{
	document.onmousedown=new Function("return false");void(0);
}
function enableclick()
{
	document.onmousedown=new Function("return true");void(0);
}

//BODY ONLOAD = INIT() MODULE

function init() { 

	/***********************************************
	* Disable select-text script- � Dynamic Drive (www.dynamicdrive.com)
	* This notice MUST stay intact for legal use
	* Visit http://www.dynamicdrive.com/ for full source code
	***********************************************/

	//form tags to omit in NS6+:
	var omitformtags=["input", "textarea", "select"]

	omitformtags=omitformtags.join("|")

	 function disableselect(e){
		if (omitformtags.indexOf(e.target.tagName.toLowerCase())==-1)
		return false
	}

	function reEnable(){
		return true
	}

	if (typeof document.onselectstart!="undefined")
		document.onselectstart=new Function ("return false")
	else {
		document.onmousedown=new Function("return false");void(0);
	}
	
	///--prevent select+copy-----------
	document.onselectstart=new Function("return false");
	///Added by anu --Prevent right click--
	document.oncontextmenu=new Function("return false");
	if(document.layers){
		document.captureEvents(Event.MOUSEDOWN);
		document.onmousedown=clickNS4;
	}else if(document.all&&!document.getElementById){
		document.onmousedown=clickIE4;
		document.oncontextmenu=clickIE4;
	}else if(window.sidebar){//ns6
		void(0);
	} 
	

	readPrefsForm();
	conformToPrefs();
	setBuzzWidth();
	jumpToLatestPost();
	refreshBookmarks();
	
	var pe = new PeriodicalExecuter(checkForNewBuzz, 300);
		
	document.onkeydown=docKeyDown1;

	Event.observe(document, "keypress", cancelDefaultNavigationEvents, true);
	Event.observe(document, "keydown", documentKeyDown, true);
	Event.observe('tabSearch', 'click', toggleSearchTab);
	Event.observe('tabBuzz', 'click', toggleBuzzTab, true);
	Event.observe('tabSearch','mouseover',tabSearchRollover, true);
	Event.observe('tabSearch','mouseout',tabSearchRollover, true);
	Event.observe('tabBuzz','mouseover',tabBuzzRollover, true);
	Event.observe('tabBuzz','mouseout',tabBuzzRollover, true);
	Event.observe('searchButton', 'mouseover', function(e) {$('searchButton').style.backgroundColor="#ff6001";});
	Event.observe('searchButton', 'mouseout',  function(e) {$('searchButton').style.backgroundColor="#fff";});
	Event.observe('searchButton', 'click', submitSearchForm);
	Event.observe('jumpToPost','click',toggleJump);
	Event.observe('bookmark','click',toggleBookmark);
	Event.observe(window,'resize',dropDownPos);
	Event.observe('editPrefs','click',togglePrefs, true);
	Event.observe('editPrefs','mouseover',prefsRollover,true);
	Event.observe('editPrefs','mouseout',prefsRollover,true);
	Event.observe('s','mouseover',enableclick,true);
	Event.observe('s','mouseout',disableclick,true);
	Event.observe('q','mouseover',enableclick,true);
	Event.observe('q','mouseout',disableclick,true);
	Event.observe('viewFeatures','click',toggleViewPopup,true);
	Event.observe('yahooLookup','click',yahooSubmit,false);
	Event.observe('s','change',popWin,false);
	Event.observe('yahoo','submit', function(e) {return false;});
	
	 
}

function assignEvents () {
}
//  end with new-line
