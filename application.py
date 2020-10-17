"""
application.py
==============

"""

from flask import Flask, render_template, request, jsonify
from flask import flash, redirect, session, url_for
from flask_socketio import SocketIO, join_room, leave_room
from flask_socketio import emit, rooms
from json import dumps


app = Flask(__name__, template_folder="./templates", static_folder="./static")
app.secret_key = b"hackgt_secret_key"
socketio = SocketIO(app, logger=True)

users = []

@app.route("/")
def index():
    return render_template(
        "pages/index.html",
        context={}
    )

@app.route("/2")
def index2():
    return render_template(
        "pages/index2.html",
        context={}
    )

@app.route("/3")
def index3():
    return render_template(
        "pages/index3.html",
        context={}
    )

@app.route("/test", methods=["POST"])
def test_request():
    return redirect(url_for("index"))

@socketio.on("connected_web")
def handle_connection(data):
    print(data)
    join_room("online")
    session["peer_id"] = data["id"]
    users.append(data["id"])
    emit("update", {"peers":users}, room="online")

    
if __name__ == '__main__':
    socketio.run(app, debug=True)
