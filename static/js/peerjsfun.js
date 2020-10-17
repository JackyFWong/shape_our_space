var socket;
var server_data = {
	"room": {
		"users": {},
		"peers": []
	}
};


var updateLock = false;
var updateCallbacks = [];
function update_from_server(arg) {
	updateCallbacks.push(arg);
	if (updateLock) {
		return;
	}
	updateLock = true;
	while (updateCallbacks.length) {
		arg = updateCallbacks.shift();
		console.log("Getting update from server", arg);
		console.log(self_peer_id);
		// Make sure every new person has a video
		for (let i = 0; i < arg.room.peers.length; i++) {
			console.log(arg.room.peers[i], self_peer_id);
			let new_peer_id = arg.room.users[arg.room.peers[i]].peer_id;
			if (!is_my_peer_id(new_peer_id)) {
				ensure_video(new_peer_id, "calls");
			}
		}
		// Remove unneeded videos
		let difference = server_data.room.peers.filter(x => !arg.room.peers.includes(x));
		for (let i = 0; i < difference.length; i++){
			console.log(i, difference[i]);
			remove_video(server_data.room.users[difference[i]].peer_id);
		}
		server_data = arg;
		console.log("Ending update");
	}
	updateLock = false;
}

function send_position(x, y) {
	socket.emit(
		"move_user",
		{
			"x": x,
			"y": y
		}
	)
}


// When document has loaded
$(document).ready( function() {
	socket = io();
	socket.on("connect", () => {
		console.log("Socket connected");
		get_self_stream().then((stream) => {
			new_self_peer().then((peer) => {
				console.log("Created peer for self");
				console.log("peer ", peer);
				console.log("Updating server info.");
				socket.on('update', update_from_server);
				socket.emit(
					"connected_web",
					{
						"id": self_peer_id,
						"room": room_code,
						"username": username
					}
				);
				socket.emit('get_current', {"?":"?"});
				return peer;
			});
		});
	});
});
