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
        context={
            "filled_room_code": request.args.get("room_code", "")
        }
    )

@app.route("/gather", methods=["POST", "GET"])
def gather():
    # TODO check if can enter room
    print(request.form)
    return render_template(
        "pages/gather.html",
        context={
            "username": request.form.get(
                "username",
                str(game_rooms.num_users(
                    request.form.get('room_code', "DEFAULT")
                )+1)
            ).replace(" ", "-"),
            "room_code": request.form.get("room_code", "DEFAULT"),
            "bcolor": request.form.get("bColor", "#ffffff"),
            "tcolor": request.form.get("tColor", "#ffffff"),
        }
    )

@app.route("/t")
def test_lobby():
    return render_template(
        "pages/test_lobby.html",
        context={}
    )

@app.route("/test", methods=["POST"])
def test_request():
    return redirect(url_for("index"))

@socketio.on("connected_web")
def handle_connection(data):
    print(data)
    ensure_player(session)
    session["peer_id"] = data["id"]
    session["room"] = data.get("room", "DEFAULT").lower()  # lower room code
    session["username"] = data.get(
        "username",
        str(game_rooms.num_users(session["room"])+1)
    )
    game_rooms.add_user(session["room"], session["username"])
    game_rooms.update_peer_id(session["room"], session["username"], session["peer_id"])
    game_rooms.set_color(session["room"], session["username"], data.get("bcolor"), data.get("tcolor"))
    emit("update", {"room":game_rooms.rooms[session["room"]]}, room=session["room"])  # ping to others
    join_room(session["room"])

@socketio.on("get_current")
def handle_connection_current(data):
    ensure_player(session)
    if session.get("room", "DEFAULT") in game_rooms.rooms:
        emit("update", {"room":game_rooms.rooms[session["room"]]}, room=session["room"])  # ping to others

@socketio.on("move_user")
def move_user(data):
    ensure_player(session)
    print("moving user")
    if not (session["room"] in game_rooms.rooms):
        print("ERROR: invalid room")
        return
    if not (session["username"] in game_rooms.rooms[session["room"]]["users"]):
        print("ERROR: invalid user")
        return
    game_rooms.move_user(session["room"], session["username"], data.get("x", 0), data.get("y", 0))
    emit("update", game_rooms.get_room_info(session["room"]), room=session["room"])

@socketio.on("make_circle")
def circle_maker(data):
    ensure_player(session)
    game_rooms.add_circle(session["room"], data["x"], data["y"], data["radius"])
    emit("update", game_rooms.get_room_info(session["room"]), room=session["room"])

@socketio.on("disconnect")
def handle_disconnection():
    ensure_player(session)
    if game_rooms.remove_user(session["room"], session["username"]):
      emit("update", {"room":game_rooms.rooms[session["room"]]}, room=session["room"])
    session["room"] = ""
    session["username"] = ""

def ensure_player(session):
    session["room"] = session.get("room", "DEFAULT")
    session["username"] = session.get('username', "")
    
    
if __name__ == '__main__':
    socketio.run(app, debug=True)
