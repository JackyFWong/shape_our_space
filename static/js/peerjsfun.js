var socket;
var sockets_working = false;
var server_data = {
	"room": {
		"users": {},
		"peers": []
	}
};

var RADIUS = 250;

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

		// Make sure every new person has a video, and update them
    newOthers = {}

    let myx = arg.room.users[username].x;
    let myy = arg.room.users[username].y;
    
		for (let i = 0; i < arg.room.peers.length; i++) {
    	let name = arg.room.peers[i];
    	console.log("ive reached ", name);

      let new_peer_id = arg.room.users[name].peer_id;

      if (new_peer_id != self_peer_id) {
        console.log("CHECKING!!!");
        if (Math.hypot(myx - arg.room.users[name].x, myy - arg.room.users[name].y) <= RADIUS) {
          ensure_video(new_peer_id, "calls", name);
        }
        else {
          remove_video(new_peer_id);
          console.log("bye felicia");
        }
        
        newOthers[name] = arg.room.users[name];
      }
    }
    others = newOthers;
    
		// Remove unneeded videos
		let difference = server_data.room.peers.filter(x => !arg.room.peers.includes(x));
		for (let i = 0; i < difference.length; i++) {
			console.log(i, difference[i]);
			remove_video(server_data.room.users[difference[i]].peer_id);
		}
		server_data = arg;
		console.log("Ending update");
	}
	updateLock = false;
}

function send_position(x, y) {
	if (!sockets_working) return;
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
			new_self_peer(username + "1" + room_code).then((peer) => {
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
				sockets_working = true;
				return peer;
			});
		});
	});
});
