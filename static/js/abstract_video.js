var self_stream;
var self_peer;
var self_peer_id = -1;
var peer_to_stream = {};
var streams = [];
var video_for = [];

/*function is_my_peer_id(peer_id) {
	return (self_peer_id == peer_id)
}*/

function get_self_stream() {
	return new Promise(function(resolve, reject) {
		let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
		getUserMedia(
			{video: true, audio: true},
			function(stream) {
				self_stream = stream;
				let newvideo = document.createElement("video");
				newvideo.autoplay = true;
				newvideo.srcObject = stream;
				newvideo.muted = true;
				$("#personal-video").append(newvideo);
				resolve(stream);
			},
			function(err) {
				console.log("No available self stream.");
				reject(err);
			}
		);
	});
}

function answer_call(call) {
	call.answer(self_stream);
	console.log("Answered call ", call);
}

function new_self_peer(peerid) {
	return new Promise(function(resolve, reject) {
		console.log("MAKING SELF PEER")
		self_peer = new Peer(peerid, {
			host: "hackgt-peerjs.herokuapp.com",
			port: 443,
			secure: true
		});
		self_peer.on('open', function(id) {
			self_peer_id = id;
			console.log('My peer ID is: ' + id);
			resolve(self_peer);
		}, function(err) {
			console.log("PeerJS error: ", err);
			reject(err);
		});
		self_peer.on('call', function(call) {
			console.log("Receiving call");
			answer_call(call);
		}, function(err) {
			console.log('Failed to get local stream' ,err);
		});
	});
}

function add_video(peer_id, div_id, video_user) {
	let call = self_peer.call(
		peer_id, self_stream
	);
	video_for.push(peer_id);
	call.on('stream', function(remoteStream) {
		if (streams.includes(remoteStream)) return;
		streams.push(remoteStream);
		peer_to_stream[peer_id] = remoteStream;
		console.log("Receiving new peer stream");
		
		let newvideo = document.createElement("video");
		newvideo.autoplay = true;
		console.log(remoteStream);
		newvideo.srcObject = remoteStream;

		let videoName = document.createElement("p");
		videoName.className = "name-bar";
		videoName.innerHTML = video_user;

		let videoWrapper = document.createElement("div");
		videoWrapper.id = "video-"+peer_id;
		videoWrapper.className = "video-item";
		videoWrapper.appendChild(newvideo);
		videoWrapper.appendChild(videoName);
		$("#"+div_id).append(videoWrapper)

		console.log("Made peer element");
	});
}

function remove_video(peer_id) {
  if (!video_for.includes(peer_id)) return;
  
	$("#video-"+peer_id).remove();
	//streams.remove(peer_to_stream[peer_id]);
	let index = streams.indexOf(peer_to_stream[peer_id]);
	if (index > -1) {
		streams.splice(index, 1);
	}
	index = video_for.indexOf(peer_id);
	if (index > -1) {
		video_for.splice(index, 1);
	}
	//video_for.remove(peer_id)
	delete peer_to_stream[peer_id];
}

function ensure_video(peer_id, div_id, video_user) {
	if (video_for.includes(peer_id)) return;
	if (peer_to_stream.hasOwnProperty(peer_id)) return;
	if ($("#video-"+peer_id).length != 0) return;

	console.log("adding video for ", peer_id);
	add_video(peer_id, div_id, video_user);
}
