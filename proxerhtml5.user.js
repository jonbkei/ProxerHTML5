// ==UserScript==
// @name         Proxer HTML5 Player
// @namespace    https://github.com/Dragowynd/ProxerHTML5
// @version      3.0.6
// @description  Improves the Proxer.ME HTML5 Player
// @updateURL    https://raw.githubusercontent.com/Dragowynd/ProxerHTML5/master/proxerhtml5.user.js
// @downloadURL  https://raw.githubusercontent.com/Dragowynd/ProxerHTML5/master/proxerhtml5.user.js
// @author       Dragowynd
// @match        http://stream.proxer.me/*
// @include      https://stream.proxer.me/*
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==


document.body.onload = killOriginalPlayer();

function killOriginalPlayer() {

	var srctag = document.querySelector("#player_code .flowplayer video").firstElementChild;
	var src = srctag.getAttribute("src");
	var type = srctag.getAttribute("type");

	var oldplayer = document.getElementById("player_code");
	oldplayer.parentNode.removeChild(oldplayer);

	doAllTheMagic(src, type);
}

function loadScript(url, callback) {
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	script.onreadystatechange = callback;
	script.onload = callback;
	head.appendChild(script);
}

function loadStylesheet(url) {
	var head = document.getElementsByTagName('head')[0];
	var style = document.createElement('link');
	style.href = url;
	style.rel = "stylesheet";
	head.appendChild(style);
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function doAllTheMagic(src, type) {
	window.oncontextmenu = function () {
		return true;
	}

	var head = document.getElementsByTagName('head')[0];
	var css = ".video-js { width: 100% !important; height: 100% !important; }";
	var csstag = document.createElement("style");
	csstag.innerHTML = css;
	head.appendChild(csstag);

	loadStylesheet("http://vjs.zencdn.net/5.2.4/video-js.css");
	loadScript("http://vjs.zencdn.net/5.2.4/video.js", function () {

		var video = document.createElement("video");
		video.setAttribute("id", "htmlstream");
		video.setAttribute("class", "video-js");
		video.setAttribute("data-setup", "{}");
		video.setAttribute("controls", "");
		video.setAttribute("preload", "auto");
		video.setAttribute("width", "100%");
		video.setAttribute("height", "100%");

		var source = document.createElement("source");
		source.setAttribute("src", src);
		source.setAttribute("type", type);
		video.appendChild(source);

		document.body.appendChild(video);
        
        videojs("htmlstream").ready(function() {
            var volume = readCookie("videojsvolume");
            var videojsvideo = document.getElementById("htmlstream_html5_api");
            videojsvideo.volume = volume !== "" ? volume : videojsvideo.volume;
            videojsvideo.muted = false;
            videojsvideo.addEventListener("volumechange", function() { document.cookie="videojsvolume="+ videojsvideo.volume;});
        });
        

	});
}
