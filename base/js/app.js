/*
 * CREDITS: 
 * https://github.com/walesmd/uda-frogger (Udacity for base code/engine)
 * http://opengameart.org/content/flare-hud (Mumu for the hud elements), 
 * http://jessefreeman.com/articles/free-game-art-tile-crusader/ (Jesse Freeman for the character/wall tiles sprites) & 
 * http://7soul1.deviantart.com/art/420-Pixel-Art-Icons-for-RPG-129892453 (7Soul1 for the item icons)
*/



/* 
    Enemy class
*/
var Enemy = function() {
    this.sprite = 'base/images/tilecrusader-art/characters-32x32.png';
    this.x = 0;
    this.y = 0;
    this.box = new SAT.Box(new SAT.Vector(60,360), 20, 20).toPolygon();
    this.chooseGreaterDistance=true;
    this.distanceCover=20;
    this.enemyMoveFrequency=350;
    this.enemyLastMoves = Date.now();
    this.enemySpritePos = 192;
    this.renderOffset=14;
};

Enemy.prototype.update = function() {

    possibleMoves = [];
    // 1. calculate possible moves that don't collide
    possibleMoves = this.calculatePossibleMoves();
    // 2. remove options on a given axis based on greater distance away if applicable
    possibleMoves = this.calculateBestAxis(possibleMoves);
    // 3. remove any still existing options that moves the enemy away
    possibleMoves = this.calculateBestRemainingDirection(possibleMoves);

    // make a choice with the options remaining
    choice = possibleMoves[Math.ceil(Math.random()*possibleMoves.length-1)];
    switch(choice) {
        case "right":
            this.box.pos.x += this.distanceCover;
        break;
        case "left":
            this.box.pos.x -= this.distanceCover;
        break;
        case "down":
            this.box.pos.y += this.distanceCover;
        break;
        case "up":
            this.box.pos.y -= this.distanceCover;
        break;
        default:
        // do nothing when no obvious choices left, effectively waiting for the player to move
    }
};

// Calculate all possible moves avoiding collisions
Enemy.prototype.calculatePossibleMoves = function() {
    possibleMoves = [];
    directions=4; //up, down, left, right
    for(i=0;i<directions;i++) {
        switch(i) {
            case 0:
            if(checkInBounds(this.box.pos.x+this.distanceCover, this.box.pos.y)) {
                if(checkTombCollision(this.box.pos.x+this.distanceCover, this.box.pos.y) || (checkEnemyCollision(player.x-this.distanceCover, player.y))) {
                }
                else{
                    possibleMoves.push("right");
                }
            }
            break;
            case 1:
            if(checkInBounds(this.box.pos.x-this.distanceCover, this.box.pos.y)) {
                if(checkTombCollision(this.box.pos.x-this.distanceCover, this.box.pos.y) || (checkEnemyCollision(player.x+this.distanceCover, player.y))) {
                }
                else{
                    possibleMoves.push("left");
                }
            }
            break;
            case 2:
            if(checkInBounds(this.box.pos.x, this.box.pos.y+this.distanceCover)) {
                if(checkTombCollision(this.box.pos.x, this.box.pos.y+this.distanceCover) || (checkEnemyCollision(player.x, player.y-this.distanceCover))) {
                }
                else{
                    possibleMoves.push("down");
                }
            }
            break;
            case 3:
            if(checkInBounds(this.box.pos.x, this.box.pos.y-this.distanceCover)) {
                if(checkTombCollision(this.box.pos.x, this.box.pos.y-this.distanceCover) || (checkEnemyCollision(player.x, player.y+this.distanceCover))) {
                }
                else{
                    possibleMoves.push("up");
                }
            }
            break;
            default:
        }
    }
    return possibleMoves;
}

// Remove options on the axis that the enemy is closest to the player on
Enemy.prototype.calculateBestAxis = function(possibleMoves) {
    absX = Math.abs(player.x - this.box.pos.x);
    absY = Math.abs(player.y - this.box.pos.y);

    // if there are two possible moves and they're both in the same axis, ignore this step
    if((possibleMoves.length===2 && (possibleMoves.indexOf("up")!=-1 && possibleMoves.indexOf("down")!=-1)) || 
        (possibleMoves.length===2 && (possibleMoves.indexOf("left")!=-1 && possibleMoves.indexOf("right")!=-1))) {}
    else {
        if(this.chooseGreaterDistance) { // more efficient
            if(absX > absY) {
                var up = possibleMoves.indexOf("up");
                if(up != -1) {
                    possibleMoves.splice(up, 1);
                }
                var down = possibleMoves.indexOf("down");
                if(down != -1) {
                    possibleMoves.splice(down, 1);
                }
            }
            else if(absX < absY) {
                var left = possibleMoves.indexOf("left");
                if(left != -1) {
                    possibleMoves.splice(left, 1);
                }
                var right = possibleMoves.indexOf("right");
                if(right != -1) {
                    possibleMoves.splice(right, 1);
                }
            }
        }
        else {
            // less efficient option to add some randomness to movements
        }
    }
    
    return possibleMoves;
}

// Remove any options still available that take the enemy away from the player
Enemy.prototype.calculateBestRemainingDirection = function(possibleMoves) {
    
    // if moving direction X takes the enemy away from the player, remove it from the possible moves list
    if(!(Math.abs((this.box.pos.x+this.distanceCover) - player.x) < Math.abs(this.box.pos.x - player.x))) {
        var right = possibleMoves.indexOf("right");
        if(right != -1) {
            possibleMoves.splice(right, 1);
        }
    }
    
    if(!(Math.abs((this.box.pos.x-this.distanceCover) - player.x) < Math.abs(this.box.pos.x - player.x))) {
        var left = possibleMoves.indexOf("left");
        if(left != -1) {
            possibleMoves.splice(left, 1);
        }
    }
    
    if(!(Math.abs((this.box.pos.y+this.distanceCover) - player.y) < Math.abs(this.box.pos.y - player.y))) {
        var down = possibleMoves.indexOf("down");
        if(down != -1) {
            possibleMoves.splice(down, 1);
        }
    }
    
    if(!(Math.abs((this.box.pos.y-this.distanceCover) - player.y) < Math.abs(this.box.pos.y - player.y))) {
        var up = possibleMoves.indexOf("up");
        if(up != -1) {
            possibleMoves.splice(up, 1);
        }
    }
    return possibleMoves;
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.enemySpritePos, 0, 32, 32, this.box.pos.x+this.renderOffset, this.box.pos.y, 32, 32);
};








/*
    Player class
*/
var Player = function() {
    this.sprite = 'base/images/tilecrusader-art/characters-32x32.png';
    this.x = 0;//74
    this.y = 0;
    this.items = [];
    this.lives = 9;
    this.usedScroll=false;

    this.spriteSizeX=32;
    this.spriteSizeY=32;
    this.renderOffset=14;

    this.movementJump=20;
};

// Update the player's position, required method for game
Player.prototype.update = function() {

    // if the player has grabbed the key and the treasure
    if((player.items.indexOf(items[0])>=0) && (player.items.indexOf(items[1])>=0) && !allNecItemsCollected) {
        allNecItemsCollected=true;
        allTombs.forEach(function(tomb) {
            if(tomb.stairs) {
                tomb.frameIndex = 0,
                tomb.tickCount = 0,
                tomb.ticksPerFrame = 20,
                tomb.numberOfFrames = 4;
                tomb.sprite = 'base/images/tilecrusader-art/stairsanim.png';
                tomb.collisionOff=true;
            }
        });
    }

    // if the player has the key/treasure and the exit is open
    if(allNecItemsCollected && !complete) {
        var x = this.x;
        var y = this.y;
        allTombs.forEach(function(tomb) {
            if(tomb.stairs) {
                // if the player steps onto the stairs
                if(SAT.pointInPolygon(new SAT.Vector(x,y), tomb.box)) {
                    var now = Date.now();
                    endTime = (now-startTime)/1000.0;
                    complete=true;
                }
            }
        });
    }
};

// Draw the enemy on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), 0, 0, this.spriteSizeX, this.spriteSizeY, 
        this.x+this.renderOffset, this.y, this.spriteSizeX, this.spriteSizeY);
};

// Draw the enemy on the screen, required method for game
Player.prototype.handleInput = function(allowedKeys) {

    if(!complete) {

        if(allowedKeys == 'left') {
            if(checkInBounds(this.x-this.movementJump, this.y)) {
                if(checkTombCollision(this.x-this.movementJump, this.y) || (checkEnemyCollision(this.x-this.movementJump, this.y))) {
                }
                else{
                    this.x = this.x - this.movementJump;
                }
            }
        }
        else if(allowedKeys == 'right') {
            if(checkInBounds(this.x+this.movementJump, this.y)) {
                if(checkTombCollision(this.x+this.movementJump, this.y)|| (checkEnemyCollision(this.x+this.movementJump, this.y))) {
                }
                else{
                    this.x = this.x + this.movementJump;
                }
            }
        }
        else if(allowedKeys == 'up') {
            if(checkInBounds(this.x, this.y-this.movementJump)) {
                if(checkTombCollision(this.x, this.y-this.movementJump)|| (checkEnemyCollision(this.x, this.y-this.movementJump))) {
                }
                else{
                    this.y = this.y - this.movementJump;
                }
            }
        }
        else if(allowedKeys == 'down') {
            if(checkInBounds(this.x, this.y+this.movementJump)) {
                if(checkTombCollision(this.x, this.y+this.movementJump)|| (checkEnemyCollision(this.x, this.y+this.movementJump))) {
                }
                else{
                    this.y = this.y + this.movementJump;
                }
            }
        }

        this.checkItemCollision(this.x, this.y, this.movementJump);
        this.checkSteps();
    }
};

// Check for which steps the player has covered
Player.prototype.checkSteps = function() {
    // detect player movement over individual steps
    allSteps.forEach(function(step) {
        if(SAT.pointInPolygon(new SAT.Vector(player.x,player.y), step.box)) {
            step.steppedOn = true;
        }
    });
}

// Check for collision between the player and the items
Player.prototype.checkItemCollision = function(posx, posy, movementJump) {
    var isCollision = false;

    allTombs.forEach(function(tomb) {
        if(tomb.surrounded && tomb.contents.length>0) {
            var item = new Item();
            item = tomb.contents[0];
            if(SAT.pointInPolygon(new SAT.Vector(posx,posy-movementJump), item.box)) {
                isCollision = true;
                var i = tomb.contents.indexOf(item);
                if(i != -1) {
                    player.items.push(item);
                    tomb.contents.splice(i, 1);
                }
            }
        }
        
    });
    return isCollision;
}

// Check the player is not going out of bounds
function checkInBounds(posx, posy) {
    return SAT.pointInPolygon(new SAT.Vector(posx,posy), gameBoard.toPolygon());
}

// Check for collision between the player and the tombs
function checkTombCollision(posx, posy) {
    var isCollision = false;
    allTombs.forEach(function(tomb) {
        if(SAT.pointInPolygon(new SAT.Vector(posx,posy), tomb.box) && !tomb.collisionOff) {
            isCollision = true;
        }
    });
    return isCollision;
}

function checkEnemyCollision(posx, posy) {
    var isCollision = false;

    allEnemies.forEach(function(enemy) {
        if(SAT.pointInPolygon(new SAT.Vector(posx,posy), enemy.box)) {
            isCollision = true;
            if((player.items.indexOf(items[2])>=0) && !player.usedScroll) {
                player.usedScroll=true;
                
                var i = allEnemies.indexOf(enemy);
                allEnemies.splice(i, 1);

                var j = player.items.indexOf(items[2]);
                player.items.splice(j, 1);
            }
            else {
                player.lives--;
                // 104 spritesheet offset, 13 icon size, 10 offset from player
                ctx.drawImage(Resources.get('base/images/tilecrusader-art/extras-32x-32-4.png'), 104, 0, 13, 13, player.x+10,player.y+10, 13, 13);
            }
        }
    });
    return isCollision;
}



/*
 Tomb class: the player must encircle these to open them
*/
var Tomb = function() {
    this.sprite = 'base/images/tilecrusader-art/tombanimtrans.png';

    this.box = new SAT.Box(new SAT.Vector(10,10), 20, 40);
    this.surroundingSteps = [];
    this.surrounded = false;

    this.frameIndex = 0,
    this.tickCount = 0,
    this.ticksPerFrame = 20,
    this.numberOfFrames = 7;

    this.contents = [];
    this.item = new Item();

    // all tombs surrounded by 12 steps
    this.maxSurrounded=12;
    this.stairs=false;
    this.collisionOff=false;

    this.tombSizeX=40;
    this.tombSizeY=40;
    this.itemSizeX=34;
    this.itemSizeY=34;
    this.itemDisplayOffset=5;

    this.tombAnimSpriteSheetLength=280;
    this.tombStairsSpriteSheetLength=160;
    this.tombSpriteSingleLength=40;
};

// Update the tomb
Tomb.prototype.update = function() {
    var count = 0;
    this.surroundingSteps.forEach(function(step) {
        if(step.steppedOn) {
            count++;
        }
    });

    if(count===this.maxSurrounded) {
        this.surrounded = true;
    }

    //apply tomb animation
    if(this.surrounded) {
        this.tickCount += 1;   
        if (this.tickCount > this.ticksPerFrame) {
            
            this.tickCount = 0;
            // If the current frame index is in range
            if (this.frameIndex < this.numberOfFrames - 1) {  
                // Go to the next frame
                this.frameIndex += 1;
            }  
        }
    }


};

// Draw the tomb on the screen
Tomb.prototype.render = function() {

    ctx.drawImage(
        Resources.get('base/images/tilecrusader-art/tombanim.png'), //black
        240,  //240
        0, 
        this.tombSizeX, 
        this.tombSizeY, 
        this.box.pos.x, 
        this.box.pos.y,  
        this.tombSizeX, 
        this.tombSizeY);
    
    // display gold item
    if(this.surrounded && this.contents.length>0 && this.contents[0].type === 'gold') {
        ctx.drawImage(
        Resources.get(this.contents[0].sprite), 
        238,  
        510, 
        this.itemSizeX, 
        this.itemSizeY, 
        this.box.pos.x+this.itemDisplayOffset, 
        this.box.pos.y,  
        this.itemSizeX, 
        this.itemSizeY);        
    }
    // display scroll item
    else if(this.surrounded && this.contents.length>0 && this.contents[0].type === 'scroll') {
        ctx.drawImage(
        Resources.get(this.contents[0].sprite), 
        340,  
        578, 
        this.itemSizeX, 
        this.itemSizeY, 
        this.box.pos.x+this.itemDisplayOffset, 
        this.box.pos.y,  
        this.itemSizeX, 
        this.itemSizeY);
    }
    // display key item
    else if(this.surrounded && this.contents.length>0 && this.contents[0].type === 'key') {
        ctx.drawImage(
        Resources.get(this.contents[0].sprite), 
        306,  
        544, 
        this.itemSizeX, 
        this.itemSizeY, 
        this.box.pos.x+this.itemDisplayOffset, 
        this.box.pos.y,  
        this.itemSizeX, 
        this.itemSizeY);
    }
    // display empty tomb
    else if(this.surrounded && this.contents.length<=0) {
        ctx.drawImage(
        Resources.get('base/images/tilecrusader-art/tombanim.png'), 
        240,  
        0, 
        this.tombSizeX, 
        this.tombSizeY, 
        this.box.pos.x, 
        this.box.pos.y,  
        this.tombSizeX, 
        this.tombSizeY);
    }
    


    /*  
        if all necessary items HAVE been found and this tomb contains the stairs, animate the stairs reveal
        else draw the tomb cover animation
    */
    if(allNecItemsCollected && this.stairs) {
        ctx.drawImage(
        Resources.get(this.sprite), 
        this.frameIndex * this.tombStairsSpriteSheetLength / this.numberOfFrames, 
        0, 
        this.tombStairsSpriteSheetLength/this.numberOfFrames, 
        this.tombSpriteSingleLength, 
        this.box.pos.x, 
        this.box.pos.y, 
        this.tombStairsSpriteSheetLength/this.numberOfFrames, 
        this.tombSpriteSingleLength);
    }
    else {
        ctx.drawImage(
        Resources.get(this.sprite), 
        this.frameIndex * this.tombAnimSpriteSheetLength / this.numberOfFrames, 
        0, 
        this.tombAnimSpriteSheetLength/this.numberOfFrames, 
        this.tombSpriteSingleLength, 
        this.box.pos.x, 
        this.box.pos.y, 
        this.tombAnimSpriteSheetLength/this.numberOfFrames, 
        this.tombSpriteSingleLength);
    }


    //tomb border
    ctx.beginPath();
    ctx.lineWidth="2";
    ctx.strokeStyle="black";
    ctx.rect(this.box.pos.x,this.box.pos.y, this.tombSpriteSingleLength, this.tombSpriteSingleLength); 
    ctx.stroke();
};





/* 
    Item class, i.e. scroll, key or gold
*/
var Item = function() {
    this.sprite = '';
    this.type = '';
    this.box = new SAT.Box(new SAT.Vector(10,10), 20, 40);
};



/* 
    Step class - holds boolean value indicating whether the player has covered this square yet
*/
var Step = function() {
    this.sprite = 'base/images/tilecrusader-art/floor-tiles-20x20.png';
    this.steppedOn = false;
    this.box = new SAT.Box(new SAT.Vector(10,10), 20, 40);
};



/* GLOBAL VARIABLES */
var gameBoard;
var allEnemies = [];
var player;
var items = [];
var allTombs = [];
var allSteps = [];
var startTime, endTime;
var allNecItemsCollected = false;
var complete=false;
var endTime = 0;

var sRows = 21; // original 21x21 and 6x6, for every increase in tombs, increase corresponding rows by 3
var sCols = 21; // must be square 
var cRows=6; //6
var cCols=6; //6

var stepSize=20;
var tombGapSize=60;
var tombSize=40;

var numberOfItems=3;

// create the step objects
function createSteps() {
    for (row = 0; row < sRows; row++) {
        for (col = 0; col < sCols; col++) {
            var step = new Step();
            step.box = new SAT.Box(new SAT.Vector(col*stepSize,row*stepSize), stepSize, stepSize).toPolygon();
            //translate box relative to local coordiante system
            step.box.translate(-stepSize,-stepSize);
            allSteps.push(step);
        }
    }
}

// create the tomb objects and associate the surrounding steps with each corresponding tomb
function createTombs() {
    for (row = 0; row < cRows; row++) {
        for (col = 0; col < cCols; col++) {
            var tomb = new Tomb();
            tomb.box = new SAT.Box(new SAT.Vector(tombSize+(col*tombGapSize),tombSize+(row*tombGapSize)), tombSize, tombSize).toPolygon();
            tomb.box.translate(-20,-20);
            //add corresponding steps to tomb array of surrounding steps
            allSteps.forEach(function(step) {
                if(SAT.testPolygonPolygon(step.box, tomb.box)) {
                    tomb.surroundingSteps.push(step);
                }
            });
            allTombs.push(tomb);
        }
    }
}
var gold = new Item();
// create game collectables and add to array
function createItems() {
    var itemsSprite = 'base/images/tilecrusader-art/objects2.png';
    
    gold.sprite = itemsSprite;
    gold.type = 'gold';
    gold.box = new SAT.Box(new SAT.Vector(0,0), 0, 0).toPolygon();

    var key = new Item();
    key.sprite = itemsSprite;
    key.type = 'key';
    key.box = new SAT.Box(new SAT.Vector(0,0), 0, 0).toPolygon();

    var scroll = new Item();
    scroll.sprite = itemsSprite;
    scroll.type = 'scroll';
    scroll.box = new SAT.Box(new SAT.Vector(0,0), 0, 0).toPolygon();
    
    items.push(gold);
    items.push(key);
    items.push(scroll);
}

// array of 3 random positions across the board to drop items into
function randomiseItemPositions() {
    var arr = []
    while(arr.length < numberOfItems){
        var randomnumber=Math.ceil(Math.random()*(cRows*cCols));
        var found=false;
        for(var i=0;i<arr.length;i++){
            if(arr[i]==randomnumber){found=true;break}
        }
        if(!found) {
            arr[arr.length]=randomnumber;
        }
    }

    //  set the item box to the tomb box + set the tomb contents to the item
    for(count = 0; count < numberOfItems; count++) {
        items[count].box = allTombs[arr[count]].box;
        allTombs[arr[count]].contents.push(items[count]);
        allTombs[arr[count]].item = items[count];
    }
    allTombs[arr[0]].stairs=true;
}

// setup the remaining game objects
function createGameboardPlayerEnemies() {
    gameBoard = new SAT.Box(new SAT.Vector(0,0), 20*(sRows-2), 20*(sCols-2));//.toPolygon();
    allEnemies = [];
    var enemy1 = new Enemy();
    enemy1.enemyMoveFrequency=750;
    enemy1.enemySpritePos=224;
    enemy1.box.pos.x = 20*(sRows-2); //60
    enemy1.box.pos.y = 0; //360

    var enemy2 = new Enemy();
    enemy2.box.pos.x = 20*(sRows-3);
    enemy2.box.pos.y = 20*(sCols-3);
    enemy2.chooseGreaterDistance=false;

    var enemy3 = new Enemy();
    enemy3.box.pos.x = 0;
    enemy3.box.pos.y = 20*(sCols-2);
    enemy3.enemySpritePos=256;

    allEnemies.push(enemy1);
    allEnemies.push(enemy2);
    allEnemies.push(enemy3);
    player = new Player();
}

// setup the game
function setup() {
    startTime = Date.now();
    // create steps
    createSteps();
    // create tombs + attach surrounding steps
    createTombs();
    // create game items
    createItems();
    // randomise item positions
    randomiseItemPositions();
    // create game board, enemy and player
    createGameboardPlayerEnemies();
}

/* Setup the game */
setup();