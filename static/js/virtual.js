var movement_speed = 25;
const MIN_DISTANCE = 25;
var stage;
var map;
var self_obj;
var others = {};
var roomCircles = [];
const RADIUS = 250;

function drawRoom(x, y, radius) {
  var room = new createjs.Shape();
  room.graphics.beginStroke("Black").beginFill("rgba(255, 255, 255, 0.4)").drawCircle(0, 0, radius);
  room.x = x;
  room.y = y;
  room.isRoom = true;
  
  stage.addChild(room);
  stage.setChildIndex(room, 1);
}

function move_to(obj, x, y) {
	let vlength = Math.sqrt(Math.pow(obj.x-x,2)+Math.pow(obj.y-y,2));
	if (vlength < MIN_DISTANCE) {
		obj.x = x;
		obj.y = y;
	}
	let vlengthx = x-obj.x;
	let vlengthy = y-obj.y;
	if (Math.abs(obj.x - x) > 1 || Math.abs(obj.y - y) > 1) {
		obj.x += movement_speed * vlengthx / vlength;  // * (x - obj.x);
		obj.y += movement_speed * vlengthy / vlength;  // * (y - obj.y);
	}
  
  if(obj == self) {
    return;
  }
  
  if (Math.hypot(self.targetx - x, self.targety - y) <= RADIUS) {
    if(obj.shadow.color != "Green") {
      obj.shadow = new createjs.Shadow("Green", 0, 0, 20);
    }
  }
  else {
    if(obj.shadow.color != "rgba(50,50,50,0)") {
      obj.shadow = new createjs.Shadow("rgba(50,50,50,0)", 0, 0, 10);
    }
  }
}

function tick() {
	move_to(self, self.targetx, self.targety);
 
  let otherPeople = stage.children.filter(e => e.name != null & e.name != username)
  for(let i = 0; i < otherPeople.length; i++) {
    let name = otherPeople[i].name;
    
    if (others[name]) {
      move_to(otherPeople[i], others[name].x, others[name].y);
    }
    else {
      stage.removeChild(otherPeople[i]);
    }
  }
 
  for(const [key, val] of Object.entries(others)) {
    let other = stage.getChildByName(key);

    if (!other) {
      other = new createjs.Shape().set({x: val.x, y: val.y, name: key});
      other.graphics.beginFill(val.tcolor).drawCircle(0, 0, 15).beginFill(val.bcolor).drawCircle(0, 0, 10);
      other.shadow = new createjs.Shadow("rgba(50,50,50,0)", 0, 0, 10);
      
      stage.addChild(other);
      console.log("Adding new token for " + key);
    }
  }  
 
  // draw circle stuff
  let drawnCircles = stage.children.filter(e => e.isRoom)
  if(drawnCircles.length < roomCircles.length) {
    for(let i = drawnCircles.length; i < roomCircles.length; i++) {
      drawRoom(roomCircles[i].x, roomCircles[i].y, roomCircles[i].radius);
    }
  }
  else if(drawnCircles.length > roomCircles.length) {
    console.log("ERROR ERROR");
  }
 
  // put yourself on top
  stage.setChildIndex(self, stage.children.length - 1);
  
	stage.update();
}

function init_canvas() {
  stage = new createjs.Stage("demoCanvas");

	createjs.Ticker.addEventListener("tick", tick);
	createjs.Ticker.setFPS(30);
    
  map = new createjs.Shape();
  map.graphics.beginStroke("Black").beginFill("#DDDDDD").rect(0, 0, 1400, 900);
  stage.addChild(map);
  
  self = new createjs.Shape().set({x: 100, y: 100, name: username});
  self.graphics.beginFill(tcolor_init).drawPolyStar(0, 0, 30, 3, 0, 270).beginFill(bcolor_init).drawPolyStar(0, 0, 20, 3, 0, 270).beginFill("rgba(0, 0, 0, 0.1)").drawCircle(0, 0, RADIUS - 15);
  stage.addChild(self);
  
  stage.update();

	self.targetx = self.x;
	self.targety = self.y;
  
  map.addEventListener("click", e => {
    if (e.nativeEvent.button == 0) {
      self.targetx = e.stageX;
      self.targety = e.stageY;
   
      stage.update();

      console.log("moving to ", e.stageX, " ", e.stageY);
      send_position(e.stageX, e.stageY);
    }
    else if (e.nativeEvent.button == 2) {
      socket.emit("make_circle", {
        x: e.stageX,
        y: e.stageY,
        radius: 100
      });
    }
  });
  
  window.oncontextmenu = function() { return false };
}

$(document).ready( function() {
	init_canvas();
})
