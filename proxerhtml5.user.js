// ==UserScript==
// @name         Proxer HTML5 Player
// @namespace    https://github.com/Dragowynd/ProxerHTML5
// @version      3.0.2
// @description  Improves the Proxer.ME HTML5 Player
// @updateURL    https://raw.githubusercontent.com/Dragowynd/ProxerHTML5/master/proxerhtml5.user.js
// @downloadURL  https://raw.githubusercontent.com/Dragowynd/ProxerHTML5/master/proxerhtml5.user.js
// @author       Dragowynd
// @match        http://stream.proxer.me/*
// @include      https://stream.proxer.me/*
// @grant        unsafeWindow
// @run-at       document-end
// @require      http://vjs.zencdn.net/5/video.js
// ==/UserScript==


document.body.onload = function () {
	var css = ".video-js{font-size:10px;color:#fff}.vjs-default-skin .vjs-big-play-button{font-size:3em;line-height:2em;height:2em;width:4em;border:.06666em solid #fff;border-radius:.3em;left:50%;top:50%;margin-left:-2em;margin-top:-1em}.video-js .vjs-big-play-button,.video-js .vjs-control-bar,.video-js .vjs-menu-button .vjs-menu-content{background-color:#111;background-color:rgba(17,17,17,.7)}.video-js .vjs-slider{background-color:#2b2b2b;background-color:rgba(43,43,43,.5)}.video-js .vjs-play-progress,.video-js .vjs-slider-bar,.video-js .vjs-volume-level{background:#fff}.video-js .vjs-load-progress,.video-js .vjs-load-progress div{background:rgba(85,85,85,.9)}.video-js .vjs-playback-rate{display:none}";
	document.getElementsByTagName('head')[0].appendChild("<style>" + css + "</style>");
	
	var srctag = document.querySelector("#player_code .flowplayer video").firstElementChild;
	var src = srctag.getAttribute("src");
	var type = srctag.getAttribute("type");

	var oldplayer = document.getElementById("player_code");
	oldplayer.parentNode.removeChild(oldplayer);

	var video = document.createElement("video");
	video.setAttribute("id", "htmlstream");
	video.setAttribute("class", "video-js vjs-default-skin");
	video.setAttribute("controls", "");
	video.setAttribute("preload", "auto");
	video.setAttribute("width", "100%");
	video.setAttribute("height", "100%");

	var source = document.createElement("source");
	source.setAttribute("src", src);
	source.setAttribute("type", type);
	video.appendChild(source);

	document.body.appendChild(video);

};
