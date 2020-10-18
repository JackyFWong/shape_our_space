var movement_speed = 25;
const MIN_DISTANCE = 25;
var stage;
var map;
var self_obj;
var others = {};

function drawRoom(stage, x, y, radius) {
  var room = new createjs.Shape();
  room.graphics.beginStroke("Black").beginFill("White").drawCircle(0, 0, radius);
  room.x = x;
  room.y = y;
  
  stage.addChild(room);
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
    if(obj.graphics._fill["style"] != "Red") {
      obj.graphics.clear().beginFill("Red").drawCircle(0, 0, 15);
    }
  }
  else {
    if(obj.graphics._fill["style"] != "Black") {
      obj.graphics.clear().beginFill("Black").drawCircle(0, 0, 15);
    }
  }
}

function tick() {
	move_to(self, self.targetx, self.targety);
 
  circles = stage.children.filter(e => e.name != null & e.name != username)
  for(let i = 0; i < circles.length; i++) {
    let name = circles[i].name;
    
    if (others[name]) {
      move_to(circles[i], others[name].x, others[name].y);
    }
    else {
      stage.removeChild(circles[i]);
    }
  }
 
  for(const [key, val] of Object.entries(others)) {
    let other = stage.getChildByName(key);

    if (!other) {
      other = new createjs.Shape().set({x: val.x, y: val.y, name: key});
      other.graphics.beginFill("Black").drawCircle(0, 0, 15);
      
      stage.addChild(other);
      console.log("Adding new token for " + key);
    }
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
  self.graphics.beginFill("DeepSkyBlue").drawPolyStar(0, 0, 30, 3, 0, 270).beginFill("rgba(0, 0, 0, 0.1)").drawCircle(0, 0, RADIUS - 15).beginFill("Black").drawCircle(0, 0, 2);
  stage.addChild(self);
  
  drawRoom(stage, 1000, 225, 200);
  drawRoom(stage, 1000, 650, 200);  
  
  stage.update();

	self.targetx = self.x;
	self.targety = self.y;
  
  map.addEventListener("click", e => {
    self.targetx = e.stageX;
    self.targety = e.stageY;
   
    stage.update();

    console.log("moving to ", e.stageX, " ", e.stageY);
    send_position(e.stageX, e.stageY);
  });
}

$(document).ready( function() {
	init_canvas();
})
