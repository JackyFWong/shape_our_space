var socket;
var sockets_working = false;
var server_data = {
	"room": {
		"users": {},
		"peers": []
	}
};


function copy_url() {
	//let code = "https://shape-our-space.herokuapp.com/"+
	let params = {
		room_code: room_code,
	};

	var esc = encodeURIComponent;
	var query = Object.keys(params)
		.map(k => esc(k) + '=' + esc(params[k]))
		.join('&');
	console.log(window.location.hostname, query);
	console.log(window.location.hostname+"/?"+query);

	/*
	$("#hidden_text").show();
	$("#hidden_text").val(window.location.hostname + "/?" + query);
	let copyText = document.querySelector("#hidden_text");
	copyText.select();
	document.execCommand("copy");
	$("#hidden_text").hide();
	*/
	alert("Link: " + window.location.hostname + "/?" + query);
}


function height(arg, name) {
	// TODO return number of circles name is inside
  let x = arg.room.users[name].x;
	let y = arg.room.users[name].y;
  
  let height = 0;
  
	for(let i = 0; i < arg.room.circles.length; i++) {
    if (Math.hypot(x - arg.room.circles[i].x, y - arg.room.circles[i].y) <= 100) {
      height++;
    }
  }
  
  return height;
}

function should_send_video(arg, name) {
	let myx = arg.room.users[username].x;
	let myy = arg.room.users[username].y;
	let new_peer_id = arg.room.users[name].peer_id;
	if (new_peer_id == self_peer_id) return false;
	if (height(arg, name) > height(arg, username)) return false;
	if (Math.hypot(myx - arg.room.users[name].x, myy - arg.room.users[name].y) <= RADIUS)
		return true;
	return false;
}

function should_receive_video(arg, name) {
	let myx = arg.room.users[username].x;
	let myy = arg.room.users[username].y;
	let new_peer_id = arg.room.users[name].peer_id;
	if (new_peer_id == self_peer_id) return false;
	if (height(arg, name) < height(arg, username)) return false;
	if (Math.hypot(myx - arg.room.users[name].x, myy - arg.room.users[name].y) <= RADIUS)
		return true;
	return false;
}

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
		let num_peers = 0;
		
		for (let i = 0; i < arg.room.peers.length; i++) {
    	let name = arg.room.peers[i];
			let new_peer_id = arg.room.users[name].peer_id;
			if (should_send_video(arg, name)) {
				num_peers++;
				ensure_video(new_peer_id, "calls", name);
			} else {
				remove_video(new_peer_id);
			}
			if (!should_receive_video(arg, name)) {
				if (outgoing_peer_to_calls.hasOwnProperty(new_peer_id)) {
					console.log("Closing outgoing call to ", name);
					outgoing_peer_to_calls[new_peer_id].close();
					delete outgoing_peer_to_calls[new_peer_id];
				}
			}
			
			if(new_peer_id != self_peer_id) {
				newOthers[name] = arg.room.users[name];
			}
		}
		
		others = newOthers;
		
		// Remove old unneeded videos
		let difference = server_data.room.peers.filter(x => !arg.room.peers.includes(x));
		for (let i = 0; i < difference.length; i++) {
			console.log(i, difference[i]);
			remove_video(server_data.room.users[difference[i]].peer_id);
		}
		server_data = arg;
		if (num_peers == 0) {
			closeBar();
		} else {
			openBar();
		}
    
    // Circle room stuff
    roomCircles = arg.room.circles;
    
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
						"username": username,
						"bcolor": bcolor_init,
						"tcolor": tcolor_init
					}
				);
				socket.emit('get_current', {"?":"?"});
				sockets_working = true;
				return peer;
			});
		});
	});
});
