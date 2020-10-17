var movement_speed = 5;
var stage;
var map;
var self_obj;

function drawRoom(stage, x, y, radius) {
  var room = new createjs.Shape();
  room.graphics.beginStroke("Black").beginFill("White").drawCircle(0, 0, radius)
  room.x = x;
  room.y = y;
  
  stage.addChild(room);
}

function move_to(obj, x, y) {
	let vlength = Math.sqrt(Math.pow(obj.x-x,2)+Math.pow(obj.y-y,2));
	let vlengthx = x-obj.x;
	let vlengthy = y-obj.y;
	if (Math.abs(obj.x - x) > 1 || Math.abs(obj.y - y) > 1) {
		obj.x += movement_speed * vlengthx / vlength;  // * (x - obj.x);
		obj.y += movement_speed * vlengthy / vlength;  // * (y - obj.y);
	}
}

function tick() {
	//console.log(self.targetx, " ", self.targety);
	move_to(self, self.targetx, self.targety);
	stage.update();
}

function init_canvas() {
  stage = new createjs.Stage("demoCanvas");

	createjs.Ticker.addEventListener("tick", tick);
	createjs.Ticker.setFPS(30);
    
  map = new createjs.Shape();
  map.graphics.beginStroke("Black").beginFill("#DDDDDD").rect(0, 0, 1400, 900)
  stage.addChild(map);
  
  self = new createjs.Shape();
  self.graphics.beginFill("DeepSkyBlue").drawPolyStar(0, 0, 30, 3, 0, 270).beginFill("rgba(0, 0, 0, 0.1)").drawCircle(0, 0, 150).beginFill("Black").drawCircle(0, 0, 2);
  self.x = 100;
  self.y = 100;
  stage.addChild(self);
  
  drawRoom(stage, 1000, 225, 200);
  drawRoom(stage, 1000, 650, 200);  
  
  stage.setChildIndex(self, stage.getNumChildren()-1);
  
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
