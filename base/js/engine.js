/*
 * CREDITS: 
 * https://github.com/jriecken/sat-js (jrieken for the 2d collision),
 * https://github.com/jakesgordon/javascript-state-machine/ (jakesgordon for the state machine),
 * https://jquery.com/
 * https://github.com/walesmd/uda-frogger (Udacity for base code/engine),
 * http://opengameart.org/content/flare-hud (Mumu for the hud elements), 
 * http://jessefreeman.com/articles/free-game-art-tile-crusader/ (Jesse Freeman for the character/wall tiles sprites) & 
 * http://7soul1.deviantart.com/art/420-Pixel-Art-Icons-for-RPG-129892453 (7Soul1 for the item icons)
*/

/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
*/

var Engine = (function(global) {

    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    // 22(squares)x20(pixels)=440
    canvas.width = gameBoard.w+80; //505 480x2 (+60 = +40 for the two sides of the walls and an extra 20 for buffer)
    canvas.height = gameBoard.h+60; //606
    doc.body.appendChild(canvas);
    var enemyLastMoves = Date.now();

    // text positions
    var top=2.75;middle=2.25;bottom=1.75;        

    var gameState = StateMachine.create({
    initial: 'menu',
    events: [
        { name: 'start',  from: 'menu',  to: 'game' },
        { name: 'exit', from: 'game', to: 'menu'    },
        { name: 'pause',  from: 'game',    to: 'paused' },
        { name: 'unpause', from: 'paused', to: 'game'  },
        { name: 'complete', from: 'game', to: 'end'  },
        { name: 'restart', from: 'end', to: 'menu'  }
    ]});

    function resize() {
    var height = window.innerHeight;
    var ratio = canvas.width/canvas.height;
    var width = height * ratio;
    canvas.style.width = width+'px';
    canvas.style.height = height+'px';
  }

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        render();
        update(dt, now);

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt, now) {

        if(gameState.current==='menu') {
            //update menu
        }
        else if(gameState.current==='game') {
            if(!complete) {
                updateEntities(dt,now);
            }
        }
        else if(gameState.current==='end') {
            // update end state
        }

        if((player.lives<=0 || complete)&&gameState.current==='game') {
            gameState.complete();
        }
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt, now) {
        
        // if it is time for an enemy to move, call enemy update and reset last move time
        allEnemies.forEach(function(enemy) {
          if(now - enemy.enemyLastMoves > enemy.enemyMoveFrequency) {
            enemy.update();
            enemy.enemyLastMoves = Date.now();
          }
        });

        // check if tombs have been uncovered
        var allTombsSurrounded = true;
        allTombs.forEach(function(tomb) {
            if(!tomb.surrounded) {
                allTombsSurrounded = false;
            }
            tomb.update();
        });

        player.update();
    }

    function updateEnemies() {
        enemyLastMoves = Date.now();
        allEnemies.forEach(function(enemy) {
            enemy.update();
        });
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {

        if(gameState.current==='menu') {
            renderMenu();
        }
        else if(gameState.current==='game') {
            if(!complete) {
                renderSteps();
                renderWalls();
                renderLivesAndItems();
                renderEntities();
            }
        }
        else if(gameState.current==='end') {
            renderLivesAndItems();
            renderEnd();
        }
    }

    function renderMenu() {

        ctx.drawImage(
        Resources.get('base/images/tilecrusader-art/menuImage.png'), 0, 0);

        // title text
        ctx.font = 'italic 40pt Calibri';
        ctx.lineWidth = 2;
        ctx.strokeStyle="black";
        ctx.textAlign="center"; 
        ctx.strokeText  ('OH MUMMY!', (gameBoard.w+40)/2, (gameBoard.h+40)/top);
          
        ctx.fillStyle = 'red';
        ctx.textAlign="center"; 
        ctx.fillText  ('OH MUMMY!', (gameBoard.w+40)/2, (gameBoard.h+40)/top);

        // press space
        ctx.font = 'italic 30pt Calibri';
        ctx.lineWidth = 2;
        ctx.strokeStyle="black";
        ctx.textAlign="center"; 
        ctx.strokeText  ('Press SPACE', (gameBoard.w+40)/2, (gameBoard.h+40)/bottom);
          
        ctx.fillStyle = 'red';
        ctx.textAlign="center"; 
        ctx.fillText  ('Press SPACE', (gameBoard.w+40)/2, (gameBoard.h+40)/bottom);
    }

    function renderEnd() {

        if(complete) {
          // you win text
          ctx.font = 'italic 40pt Calibri';
          ctx.lineWidth = 2;
          ctx.strokeStyle="black";
          ctx.textAlign="center"; 
          ctx.strokeText  ('YOU WIN!', (gameBoard.w+40)/2, (gameBoard.h+40)/top);
          
          ctx.fillStyle = 'red';
          ctx.textAlign="center"; 
          ctx.fillText  ('YOU WIN!', (gameBoard.w+40)/2, (gameBoard.h+40)/top);

          // time
          ctx.font = 'italic 30pt Calibri';
          ctx.lineWidth = 2;
          ctx.strokeStyle="black";
          ctx.textAlign="center"; 
          ctx.strokeText  (endTime+'s', (gameBoard.w+40)/2, (gameBoard.h+40)/middle);
          
          ctx.fillStyle = 'red';
          ctx.textAlign="center"; 
          ctx.fillText  (endTime+'s', (gameBoard.w+40)/2, (gameBoard.h+40)/middle);

          // press esc text
          ctx.strokeStyle="black";
          ctx.textAlign="center"; 
          ctx.strokeText  ('Press ESC', (gameBoard.w+40)/2, (gameBoard.h+40)/bottom);
          
          ctx.fillStyle = 'red';
          ctx.textAlign="center"; 
          ctx.fillText  ('Press ESC', (gameBoard.w+40)/2, (gameBoard.h+40)/bottom);
        }
        else {
          // game over text
          ctx.font = 'italic 40pt Calibri';
          ctx.lineWidth = 2;
          ctx.strokeStyle="black";
          ctx.textAlign="center"; 
          ctx.strokeText  ('GAME OVER', (gameBoard.w+40)/2, (gameBoard.h+40)/top);
          
          ctx.fillStyle = 'red';
          ctx.textAlign="center"; 
          ctx.fillText  ('GAME OVER', (gameBoard.w+40)/2, (gameBoard.h+40)/top);

          // press esc text
          ctx.font = 'italic 30pt Calibri';
          ctx.lineWidth = 2;
          ctx.strokeStyle="black";
          ctx.textAlign="center"; 
          ctx.strokeText  ('Press ESC', (gameBoard.w+40)/2, (gameBoard.h+40)/bottom);
          
          ctx.fillStyle = 'red';
          ctx.textAlign="center"; 
          ctx.fillText  ('Press ESC', (gameBoard.w+40)/2, (gameBoard.h+40)/bottom);
        }
    }

    function renderSteps() {
        // stepping stone render
        var background = 'base/images/tilecrusader-art/floor-tiles-20x20.png';

        allSteps.forEach(function(step) {
            if(step.steppedOn===true) {
                ctx.drawImage(Resources.get(background), 120, 80, 20, 20, step.box.pos.x, step.box.pos.y, 20, 20);
            }
            else {
                ctx.drawImage(Resources.get(background), 120, 60, 20, 20, step.box.pos.x, step.box.pos.y, 20, 20);
            }
        });
    }

    function renderWalls() {
        /* Loop through the number of rows and columns defined in apps.js 
         * and draw the correct image for that portion of the "grid"
         */
        var walls = 'base/images/tilecrusader-art/wall-tiles-40x40.png';

        for (row = 0; row < sRows; row++) {
            for (col = 0; col < sCols; col++) {

                // top
                if(col===0) {
                    ctx.drawImage(Resources.get(walls), 40, 20, 20, 20, row*20, col*20, 20, 20);
                }
                // left
                else if(row===0) {
                    ctx.drawImage(Resources.get(walls), 20, 40, 20, 20, row*20, col*20, 20, 20);
                }
                // right
                else if(row===sRows-1) {
                    ctx.drawImage(Resources.get(walls), 80, 40, 20, 20, row*20, col*20, 20, 20);
                }
                // bottom
                else if(col===sCols-1) {
                    ctx.drawImage(Resources.get(walls), 40, 20, 20, 20, row*20, col*20, 20, 20);
                }

                //top left
                if(row===0 && col===0) {
                    ctx.drawImage(Resources.get(walls), 20, 20, 20, 20, row*20, col*20, 20, 20);
                }
                //top right
                else if(row===sRows-1 && col===0) {
                    ctx.drawImage(Resources.get(walls), 80, 20, 20, 20, row*20, col*20, 20, 20);
                }
                //bottom left
                else if(row===0 && col===sCols-1) {
                    ctx.drawImage(Resources.get(walls), 20, 80, 20, 20, row*20, col*20, 20, 20);
                }
                //bottom right
                else if(row===sRows-1 && col===sCols-1) {
                    ctx.drawImage(Resources.get(walls), 80, 80, 20, 20, row*20, col*20, 20, 20);
                }
            }
        }
    }

    function renderLivesAndItems() {

      // player item holders
      ctx.drawImage(Resources.get('base/images/tilecrusader-art/button2.png'), 0, 0, 40, 40, 420, 0, 40, 40);
      ctx.drawImage(Resources.get('base/images/tilecrusader-art/button2.png'), 0, 0, 40, 40, 420, 40, 40, 40);
      ctx.drawImage(Resources.get('base/images/tilecrusader-art/button2.png'), 0, 0, 40, 40, 420, 80, 40, 40);
      
      var offset=2;
      player.items.forEach(function(item) {
        switch(item.type) {
          case 'gold':
            ctx.drawImage(Resources.get(item.sprite), 238,  510, 34, 34, 422, offset,  34, 34);
            break;
          case 'scroll':
            ctx.drawImage(Resources.get(item.sprite), 340,  578, 34, 34, 422, offset,  34, 34);
            break;
          case 'key':
            ctx.drawImage(Resources.get(item.sprite), 306,  544, 34, 34, 422, offset,  34, 34);
            break;
        }
        offset+=40;
      });

      // player life holders
      ctx.drawImage(Resources.get('base/images/tilecrusader-art/button2.png'), 0, 0, 40, 40, 420, 300, 40, 40);
      ctx.drawImage(Resources.get('base/images/tilecrusader-art/button2.png'), 0, 0, 40, 40, 420, 340, 40, 40);
      ctx.drawImage(Resources.get('base/images/tilecrusader-art/button2.png'), 0, 0, 40, 40, 420, 380, 40, 40);

      // start rendering 3 lives from 302 height +40 separation
      if(player.lives>6 && player.lives<=9) {
        ctx.drawImage(Resources.get('base/images/tilecrusader-art/characters-32x32.png'), 0, 0, 32, 32, 422, 302, 32, 32);
        ctx.drawImage(Resources.get('base/images/tilecrusader-art/characters-32x32.png'), 0, 0, 32, 32, 422, 342, 32, 32);
        ctx.drawImage(Resources.get('base/images/tilecrusader-art/characters-32x32.png'), 0, 0, 32, 32, 422, 382, 32, 32);
      }
      else if(player.lives>3 && player.lives<=6) {
        ctx.drawImage(Resources.get('base/images/tilecrusader-art/characters-32x32.png'), 0, 0, 32, 32, 422, 342, 32, 32);
        ctx.drawImage(Resources.get('base/images/tilecrusader-art/characters-32x32.png'), 0, 0, 32, 32, 422, 382, 32, 32);
      }
      else if(player.lives>0 && player.lives<=3) {
        ctx.drawImage(Resources.get('base/images/tilecrusader-art/characters-32x32.png'), 0, 0, 32, 32, 422, 382, 32, 32);
      }
      else if(player.lives<=0) {
        // render nothing here
      }
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        allTombs.forEach(function(tomb) {
            tomb.render();
        });

        allEnemies.forEach(function(enemy) {
            enemy.render();
        });   

        player.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }

    /* Go ahead and load all of the base/images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'base/images/tilecrusader-art/floor-tiles-20x20.png',
        'base/images/tilecrusader-art/characters-32x32.png',
        'base/images/tilecrusader-art/wall-tiles-40x40.png',
        'base/images/tilecrusader-art/tombanim.png',
        'base/images/tilecrusader-art/tombanimtrans.png',
        'base/images/tilecrusader-art/objects2.png',
        'base/images/tilecrusader-art/stairsanim.png',
        'base/images/tilecrusader-art/menuImage.png',
        'base/images/tilecrusader-art/button2.png',
        'base/images/tilecrusader-art/extras-32x-32-4.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;

    function handleGeneralInput(allowedKeys) {
        if(allowedKeys == 'space') {
            gameState.start();
        }
        else if(allowedKeys == 'esc') {
            if(gameState.current==='game') {
              gameState.exit();
              document.location.href="";
              location.reload(true);
            }
            else if(gameState.current==='end') {
              gameState.restart();
              document.location.href="";
              location.reload(true);
            }
        }
        /*else if(allowedKeys == 'p') {
            if(gameState.current==='game') {
                gameState.pause();
            }
            else {
                gameState.unpause();
            }
        }*/
    }

window.addEventListener('load', resize, false);
window.addEventListener('resize', resize, false);

/* This listens for key presses and sends the keys to your Player.handleInput() method. You don't need to modify this.*/
document.addEventListener('keydown', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'space',
        27: 'esc',
        80: 'p'
    };

    handleGeneralInput(allowedKeys[e.keyCode]);
    if(gameState.current==='game') {
      player.handleInput(allowedKeys[e.keyCode]);
    }
});

window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40, 27, 80].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

})(this);