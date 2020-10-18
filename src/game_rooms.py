rooms = {}

def num_users(room):
    return len(rooms.get(room, {"users":[]})["users"])

def add_user(room, user):
    if not (room in rooms):
        add_room(room)
    if user in rooms[room]["users"]:
        return False
    rooms[room]["users"][user] = {
        "username": user,
        "x": 100,
        "y": 100,
        "peer_id": -1,
        "tcolor": "#ffffff",
        "bcolor": "#ffffff",
    }
    rooms[room]["peers"].append(user)
    return True

def set_color(room, user, bcolor, tcolor):
    rooms[room]["users"][user]["bcolor"] = bcolor
    rooms[room]["users"][user]["tcolor"] = tcolor
    return True

def add_room(room):
    if room in rooms:
        return False
    rooms[room] = {
        "users": {},
        "peers": [],
        "circles": []
    }
    return True

def update_peer_id(room, user, peer_id):
    rooms[room]["users"][user]["peer_id"] = peer_id
    return True

def remove_user(room, user):
    if not (room in rooms):
        return False
    if user in rooms[room]["users"]:
        del rooms[room]["users"][user]
        rooms[room]["peers"].remove(user)
        return True
    return False

def move_user(room, user, x, y):
    rooms[room]["users"][user]["x"] = x
    rooms[room]["users"][user]["y"] = y
    return True

def get_room_info(room):
    return {
      "room": rooms[room]
    }

def add_circle(room, x, y, radius):
    rooms[room]["circles"].append({
        "x": x,
        "y": y,
        "radius": radius
    })
