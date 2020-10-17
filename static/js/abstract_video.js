

function get_self_stream() {
	return new Promise(function(resolve, reject) {
		let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
		getUserMedia(
			{video: true, audio: true},
			function(stream) {
				resolve(stream);
			},
			function(err) {
				console.log("No available self stream.");
				reject(err);
			}
		);
	});
}

function add_video(peerid) {
	
}
