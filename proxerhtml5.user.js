// ==UserScript==
// @name         Proxer HTML5 Player
// @namespace    https://github.com/Dragowynd/ProxerHTML5
// @version      2.0.3
// @description  Improves the Proxer.ME HTML5 Player
// @updateURL    https://raw.githubusercontent.com/Dragowynd/ProxerHTML5/master/proxerhtml5.user.js
// @downloadURL  https://raw.githubusercontent.com/Dragowynd/ProxerHTML5/master/proxerhtml5.user.js
// @author       Dragowynd
// @match        http://stream.proxer.me/*
// @include      https://stream.proxer.me/*
// @grant        unsafeWindow
// ==/UserScript==


document.body.onload = function () {
	loadStylesheet("http://vjs.zencdn.net/5.0.2/video-js.css");
	loadScript("http://vjs.zencdn.net/5.0.2/video.js", function () {
		loadScript("http://cdn.sc.gl/videojs-hotkeys/latest/videojs.hotkeys.min.js", function () {

			var srctag = document.querySelector("#player_code .flowplayer video").firstElementChild;
			var src = srctag.getAttribute("src");
			var type = srctag.getAttribute("type");

			document.getElementById("player_code").setAttribute("style", "display: none;");

			var video = document.createElement("video");
			video.id = "htmlstream";
			video.setAttribute("class", "video-js vjs-default-skin vjs-big-play-centered");
			video.setAttribute("controls", "");
			video.setAttribute("preload", "auto");
			video.setAttribute("data-setups", "{}");
			video.setAttribute("width", "728px");
			video.setAttribute("height", "504px");

			var source = document.createElement("source");
			source.setAttribute("src", src);
			source.setAttribute("type", type);
			video.appendChild(source);

			document.body.appendChild(video);

			videojs("htmlstream", {}, function () {}).ready(function () {
				this.hotkeys({
					volumeStep : 0.1,
					seekStep : 5,
					enableMute : true,
					enableFullscreen : true
				});
			});
		});
	});
};

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
