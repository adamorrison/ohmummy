  var stepsOn = 0;

  function reset() {
    stepsOn=0;
  }

  function move(direction, amount) {
      for(i=0;i<amount;i++) {
        switch(direction) {
            case "right":
              player.handleInput("right");
            break;
            case "left":
              player.handleInput("left");
            break;
            case "down":
              player.handleInput("down");
            break;
            case "up":
              player.handleInput("up");
            break;
            default:
            // nothing
        }
    }
  }

  // enemy possible moves test
  QUnit.test("enemy-CalculatePossibleMoves", function( assert ) {
    var testEnemy2 = new Enemy();
    testEnemy2.box.pos.x = 20*(sRows-3);
    testEnemy2.box.pos.y = 20*(sCols-3);
    testEnemy2.chooseGreaterDistance=false;

    expectedMoves = ["left", "up"];
    assert.deepEqual(testEnemy2.calculatePossibleMoves(), expectedMoves);
  });

    // enemy best axis test
  QUnit.test("enemy-calculateBestAxis", function( assert ) {
    var testEnemy3 = new Enemy();
    testEnemy3.box.pos.x = 0;
    testEnemy3.box.pos.y = 20*(sCols-3);
    testEnemy3.enemySpritePos=256;

    expectedMoves = ["up"];
    preMoves = testEnemy3.calculatePossibleMoves();
    assert.deepEqual(testEnemy3.calculateBestAxis(preMoves), expectedMoves);
  });

  // enemy best remaining direction test
  QUnit.test("enemy-calculateBestRemainingDirection", function( assert ) {
    var testEnemy4 = new Enemy();
    testEnemy4.box.pos.x = 60;
    testEnemy4.box.pos.y = 20*(sCols-3);
    testEnemy4.enemySpritePos=256;

    expectedMoves = ["left", "up"];
    preMoves = testEnemy4.calculatePossibleMoves();
    assert.deepEqual(testEnemy4.calculateBestRemainingDirection(preMoves), expectedMoves);
  });

    

  // player-step collisions
  QUnit.test("player-step collisions", function( assert ) {
    reset();

    var expect = 18;
    var result = 0;

    allSteps.forEach(function(step) {
        step.steppedOn = false;
    });

    move("right", 18);

    allSteps.forEach(function(step) {
      if(step.steppedOn===true) {
        result++;
      }
    });

    assert.equal(result, expect);
  });


// player-gameboard collisions
  QUnit.test("player-gameboard collisions-right", function( assert ) {
    //reset();

    move("right", 20);
    var result = checkInBounds(player.x,player.y);
    assert.equal(result, true);
    move("left", 20);
  });


// player-gameboard collisions
  QUnit.test("player-gameboard collisions-down", function( assert ) {
    //reset();

    move("down", 20);
    var result = checkInBounds(player.x,player.y);
    assert.equal(result, true);
    move("up", 20);
  });


  // player-tomb collisions
  QUnit.test("player-tomb collisions", function( assert ) {

    reset();

    // circle the top left tomb and check collision
    player.handleInput("right");
    var result = checkTombCollision(player.x,player.y+20);
    assert.equal(result, true);

    player.handleInput("right");
    var result = checkTombCollision(player.x,player.y+20);
    assert.equal(result, true);

    player.handleInput("right");
    player.handleInput("down");
    var result = checkTombCollision(player.x-20,player.y);
    assert.equal(result, true);

    player.handleInput("down");
    var result = checkTombCollision(player.x-20,player.y);
    assert.equal(result, true);

    player.handleInput("down");
    player.handleInput("left");
    var result = checkTombCollision(player.x,player.y-20);
    assert.equal(result, true);

    player.handleInput("left");
    var result = checkTombCollision(player.x,player.y-20);
    assert.equal(result, true);

    player.handleInput("left");
    player.handleInput("up");
    var result = checkTombCollision(player.x+20,player.y);
    assert.equal(result, true);

    player.handleInput("up");
    var result = checkTombCollision(player.x+20,player.y);
    assert.equal(result, true);

    player.x=360;
    player.y=360;

    // circle the bottom  right tomb and check collision
    player.handleInput("left");
    var result = checkTombCollision(player.x,player.y-20);
    assert.equal(result, true);

    player.handleInput("left");
    var result = checkTombCollision(player.x,player.y-20);
    assert.equal(result, true);

    player.handleInput("left");
    player.handleInput("up");
    var result = checkTombCollision(player.x+20,player.y);
    assert.equal(result, true);

    player.handleInput("up");
    var result = checkTombCollision(player.x+20,player.y);
    assert.equal(result, true);

    player.handleInput("up");
    player.handleInput("right");
    var result = checkTombCollision(player.x,player.y+20);
    assert.equal(result, true);

    player.handleInput("right");
    var result = checkTombCollision(player.x,player.y+20);
    assert.equal(result, true);

    player.handleInput("right");
    player.handleInput("down");
    var result = checkTombCollision(player.x-20,player.y);
    assert.equal(result, true);

    player.handleInput("down");
    var result = checkTombCollision(player.x-20,player.y);
    assert.equal(result, true);
  });


  // player-item collisions
  QUnit.test("player-item collisions", function( assert ) {

    reset();
    var expectPlayerItems = 3;
    var expectGlobalItems = 3;
    var numOfTombItems=0;
    var actual = 0;

    allTombs.forEach(function(tomb) {
        tomb.surrounded = true;
        if(tomb.contents.length>0) {
            numOfTombItems++;
        }
    });
    //assert 3 tombs have items
    assert.equal(numOfTombItems, 3);
    
    var sRows = 19;
    var sCols = 19;
    for (row = 0; row < sRows; row++) {
        for (col = 0; col < sCols; col++) {
          if(player.checkItemCollision(row*20,col*20,20)) {
              actual++;
          }
        }
    }

    numOfTombItems=0;
    allTombs.forEach(function(tomb) {
        tomb.surrounded = true;
        if(tomb.contents.length>0) {
            numOfTombItems++;
        }
    });
    // assert none of the tombs have items after player collected all of them
    assert.equal(numOfTombItems, 0);
    
    // check during the course of the horizontal sweep that all items have been grabbed by the player
    assert.equal(actual, expectPlayerItems);
  });