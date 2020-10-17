"""
application.py
==============

"""

from flask import Flask, render_template, request, jsonify
from flask import flash, redirect, session, url_for
from flask_socketio import SocketIO, join_room, leave_room
from flask_socketio import emit, rooms
from json import dumps

from src import game_rooms


app = Flask(__name__, template_folder="./templates", static_folder="./static")
app.secret_key = b"hackgt_secret_key"
socketio = SocketIO(app, logger=True)


@app.route("/")
def index():
    return render_template(
        "pages/index.html",
        context={}
    )

@app.route("/gather")
def gather():
    return render_template(
        "pages/gather.html",
        context={}
    )

@app.route("/test", methods=["POST"])
def test_request():
    return redirect(url_for("index"))

@socketio.on("connected_web")
def handle_connection(data):
    print(data)
    session["peer_id"] = data["id"]
    session["room"] = data.get("room", "DEFAULT")
    session["username"] = data.get(
        "username",
        str(game_rooms.num_users(session["room"])+1)
    )
    game_rooms.add_user(session["room"], session["username"])
    game_rooms.update_peer_id(session["room"], session["username"], session["peer_id"])
    emit("update", {"room":game_rooms.rooms[session["room"]]}, room=session["room"])  # ping to others
    join_room(session["room"])

@socketio.on("get_current")
def handle_connection(data):
    if session["room"] in game_rooms.rooms:
        emit("update", {"room":game_rooms.rooms[session["room"]]}, room=session["room"])  # ping to others

@socketio.on("disconnect")
def handle_disconnection():
    #all_rooms = rooms()
    game_rooms.remove_user(session["room"], session["username"])
    emit("update", {"room":game_rooms.rooms[session["room"]]}, room=session["room"])
    print('emitted update')
    """
    for room in all_rooms:
        leave_room(room)
    emit("update", {"room":game_rooms.rooms[room]}, room=room)
    """
    
    
if __name__ == '__main__':
    socketio.run(app, debug=True)
