// ==UserScript==
// @name         Proxer HTML5 Player
// @namespace    https://github.com/Dragowynd/ProxerHTML5
// @version      1.0.1
// @description  Replaces Proxer.Me Flash Players with Video.js HTML5 Player
// @updateURL    https://raw.githubusercontent.com/Dragowynd/ProxerHTML5/master/proxerhtml5.user.js
// @downloadURL  https://raw.githubusercontent.com/Dragowynd/ProxerHTML5/master/proxerhtml5.user.js
// @author       Dragowynd
// @match        http://proxer.me/watch/*
// @include      https://proxer.me/watch/*
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_log
// ==/UserScript==


(function () {
	loadStylesheet("http://vjs.zencdn.net/4.12/video-js.css");
	loadScript("http://vjs.zencdn.net/4.12/video.js", function () {
		loadScript("http://cdn.sc.gl/videojs-hotkeys/latest/videojs.hotkeys.min.js", function () {});
	});

	setGlobals();
	appendEventListener();
})();

function setGlobals() {
	var g = function () {
		window.streamsrc = "";
		window.scrindex = 0;
		window.htmlplayerevent = new CustomEvent('htmlplayer', {
				'detail' : streamsrc
			});
		window.scrloadevent = new CustomEvent('scrload', {
				'detail' : scrindex
			});
		window.activestream = 0;
		window.toDOM = function(str) {
			var div = document.createElement("div");
			div.innerHTML = str;
			return div.firstElementChild;
		};
	};
	addJS_Node(getStreamAjax); //Overrides the original getStreamAjax
	addJS_Node(null, null, g);
}

function appendEventListener() {
	document.body.addEventListener("htmlplayer", function (e) {
		var flplayer = "";
		GM_xmlhttpRequest({
			method : "GET",
			url : streamsrc,
			onload : function (response) {
				flplayer = response.responseText;
				flplayer = flplayer.replace(/html.*?(?=>)/gi, "div");
				flplayer = flplayer.replace(/head.*?(?=>)/gi, "div");
				flplayer = flplayer.replace(/body.*?(?=>)/gi, "div");
				flplayer = flplayer.replace(/\n/gi, " ");
				flplayer = flplayer.replace(/<!--.*?-->/gi, " ");
				var sr = /<script.*?>.*?<\/script>/gi;
				var match;
				var scriptswosrc = [];
				var scriptswsrc = [];
				while (match = sr.exec(flplayer)) {
					var s = toDOM(match.toString());
					if (s.src) {
						scriptswsrc.push(s);
					} else {
						scriptswosrc.push(s);
					}
				}
				flplayer = flplayer.replace(sr, "");
				if (!document.getElementById("dummycontainer")) {
					var tempdiv = document.createElement("div");
					tempdiv.style.display = "none";
					tempdiv.id = "dummycontainer";
					document.body.appendChild(tempdiv);
				}
				document.getElementById("dummycontainer").innerHTML = "";
				document.getElementById("dummycontainer").appendChild(toDOM(flplayer.toString()));
				var loadScrwosrc = function () {
					scriptswosrc.forEach(function (entry) {
						addJS_Node(entry.innerHTML);
					});
					var src = getStreamSource();
					createPlayer(src, "video/mp4");
					videojs("htmlstream", {}, function () {}).ready(function () {
						this.hotkeys({
							volumeStep : 0.1,
							seekStep : 5,
							enableMute : true,
							enableFullscreen : true
						});
					});

				};
				var loadNext = function () {
					if (scrindex >= scriptswsrc.length) {
						loadScrwosrc();
						return;
					}
					loadScript(scriptswsrc[scrindex++].src, function () {
						document.body.dispatchEvent(scrloadevent);
					});
				};
				document.body.addEventListener('scrload', function (e) {
					loadNext();
				}, false);
				loadNext();

			},
		});
	}, false);
}

function getStreamSource() {
	switch (streams[activestream].name) {
	case "Proxer-Stream":
		var values = $('#flvplayer_wrapper object param[name="flashvars"]').attr("value");
		var ff = /(?:file=).*?(?=&)/gi;
		var source = unescape(values.match(ff)).replace("file=", "");
		return source;
	}
	return null;
}

function createPlayer(src, type) {
	var video = document.createElement("video");
	video.id = "htmlstream";
	video.setAttribute("class", "video-js vjs-default-skin vjs-big-play-centered");
	video.setAttribute("controls", "");
	video.setAttribute("preload", "auto");
	video.setAttribute("width", "800");
	video.setAttribute("height", "450");
	video.setAttribute("data-setups", "{}");

	var source = document.createElement("source");
	source.setAttribute("src", src);
	source.setAttribute("type", type);
	video.appendChild(source);

	$('.wStream').append(video);

}

function getStreamAjax(i) {
	$('.changeMirror').removeClass('active');
	$('#mirror_' + streams[i].id).addClass('active');
	$.ajax({
		url : getCurrentLink() + '&format=json&type=streamCount&mid=' + streams[i].id
	});
	if (streams[i].parts == 1) {
		var oldcode = (streams[i].code).split('#');
	} else {
		var oldcode = new Array(streams[i].code);
	}
	$('.wStream').html('');
	for (var j = 0; j < oldcode.length; j++) {
		if (oldcode.length > 1) {
			$('.wStream').append('<h3>Part ' + (j + 1) + '</h3>');
		}
		var newcode;
		if (streams[i].replace != '') {
			newcode = (streams[i].replace).replace("#", $.trim(oldcode[j]));
		} else {
			newcode = oldcode[j];
		}
		if (streams[i].ssl == 0 && window.location.protocol == 'https:' && streams[i].htype != 'link') {
			delete_message(1);
			create_message(1, 5000, 'Der sichere Modus ist aktiviert. Der Stream wird daher extern eingebunden. <a href="javascript:;" onclick="window.location.href = (\'' + getCurrentLink().replace('https://', 'http://') + '\')">Klicke hier um den sicheren Modus zu beenden.</a>');
			streams[i].htype = 'link';
		}
		$.ajax({
			url : '/components/com_proxer/misc/streamOutput.php?type=' + streams[i].htype + '&code=' + escape(newcode),
			async : false,
			success : function (data) {
				var allowedstreams = ["Proxer-Stream"];
				if (allowedstreams.indexOf(streams[i].name) >= 0) {
					activestream = i;
					streamsrc = toDOM(data.toString()).getAttribute("src");
					document.body.dispatchEvent(htmlplayerevent);
				} else {
					$('.wStream').append(data);
				}
			}
		});
	}
	$.scrollTo($('#top'), 300);
	if (streams[i].tid != null) {
		$('.wGroupText').css('display', 'inline');
		$('.wGroup').html('<a href="/translatorgroups?id=' + streams[i].tid + '#top" target="_blank">' + (streams[i].tname) + '</a>');
	} else {
		$('.wGroupText').css('display', 'none');
		$('.wGroup').html('');
	}
	$('.wLinkerText').css('display', 'inline');
	$('.wLinker').html('<a href="/user/' + streams[i].uploader + '#top" target="_blank">' + streams[i].username + '</a>');
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

function addJS_Node(text, s_URL, funcToRun, runOnLoad) {
	var D = document;
	var scriptNode = D.createElement('script');
	if (runOnLoad) {
		scriptNode.addEventListener("load", runOnLoad, false);
	}
	scriptNode.type = "text/javascript";
	if (text)
		scriptNode.textContent = text;
	if (s_URL)
		scriptNode.src = s_URL;
	if (funcToRun)
		scriptNode.textContent = '(' + funcToRun.toString() + ')()';

	var targ = D.getElementsByTagName('head')[0] || D.body || D.documentElement;
	targ.appendChild(scriptNode);
}