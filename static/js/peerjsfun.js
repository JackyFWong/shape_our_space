var socket;
var peer_info = {};
var peers = [];
var peer_ids = [];
var self_peer;
var self_peer_id;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var self_stream;
var video_allowed = false;
var streams = [];

function add_video(peerid) {
	console.log("Making call ", peerid);
	console.log(self_peer);
	let call = self_peer.call(
		peerid, self_stream
	);
	call.on('stream', function(remoteStream) {
		if (streams.includes(remoteStream)) return;
		streams.push(remoteStream);
		console.log("Receiving peer stream");
		// Show stream in some video/canvas element.
		let newvideo = document.createElement("video");
		newvideo.autoplay = true;
		console.log(remoteStream);
		newvideo.srcObject = remoteStream;
		$("#calls").append(newvideo);
		console.log("Made peer element");
	});
}

function answer_call(call) {
	if (!video_allowed) {
		setTimeout(function() {answer_call(call)}, 200);
		return;
	}
	call.answer(self_stream);
	console.log("answered call");
}


// When document has loaded
$(document).ready( function() {
	socket = io();
	getUserMedia(
		{video: true, audio: true},
		function(stream) {
			self_stream = stream;
			video_allowed = true;
		},
		function(err) {
			console.log("ERR no stream");
		}
	);
	
	socket.on('connect', function() {
		self_peer = new Peer();
		self_peer.on('open', function(id) {
			self_peer_id = id;
			console.log('My peer ID is: ' + id);
			socket.emit("connected_web", {"id": id});
		});
		self_peer.on('call', function(call) {
			console.log("Receiving call");
			answer_call(call);
		}, function(err) {
			console.log('Failed to get local stream' ,err);
		});
	});

	function update_from_server(arg) {
		if (!video_allowed) {
			console.log("Not ready for server update");
			setTimeout(function() {update_from_server(arg)}, 200);
			return;
		}
		console.log("Getting update from server", arg);
		console.log(self_peer_id);
		for (let i = 0; i < arg.peers.length; i++) {
			if (!peer_ids.includes(arg.peers[i]) && arg.peers[i] != self_peer_id) {
				peer_ids.push(arg.peers[i]);
				console.log("Adding peer");
				add_video(arg.peers[i]);
			}
		}
	}
	
	socket.on('update', update_from_server);
});
