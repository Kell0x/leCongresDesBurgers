window.addEventListener('DOMContentLoaded', function() {

   /*
    * Classes
    */

   function Direction(directionName) {
      if (!(this instanceof Direction)) {
         return new Direction(directionName);
      }

      this.sign = null;
      this.axis = null;

      this.get = function() {
         return this.axis === 'x'
            ? (this.sign === -1
               ? 'left'
               : 'right')
            : (this.sign === -1
               ? 'down'
               : 'up');
      };

      this.getDetails = function(directionName) {
         sign = this.sign;
         axis = this.axis;

         if (directionName !== undefined) {
            switch (directionName) {
               case 'left':
                  sign = -1;
                  axis = 'x';
                  break;
               case 'right':
                  sign = 1;
                  axis = 'x';
                  break;
               case 'down':
                  sign = -1;
                  axis = 'y';
                  break;
               case 'up':
                  sign = 1;
                  axis = 'y';
                  break;
            }
         }

         return {
            sign: sign,
            axis: axis
         };
      };

      this.set = function(directionName) {
         var details = this.getDetails(directionName);
         this.sign = details.sign;
         this.axis = details.axis;
      };

      this.set(directionName);
   }

   function Coordinates(x, y) {
      if (!(this instanceof Coordinates)) {
         return new Coordinates(x, y);
      }
      this.x = x;
      this.y = y;

      this.equals = function(other) {
         return this.x === other.x && this.y === other.y;
      };

      this.quantize = function() {
         return Coordinates(parseInt(this.x), parseInt(this.y));
      };
   }

   function Color(r, g, b, a) {
      if (!(this instanceof Color)) {
         return new Color(r, g, b, a);
      }
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a !== undefined ? a : 255;
   }

   function Player(coordinates, direction, speed, keymap, color, name) {
      if (!(this instanceof Player)) {
         return new Player(coordinates, direction, speed, keymap, color, name);
      }
      this.speed = speed;
      this.direction = direction;
      this.coordinates = coordinates;
      this.color = color;
      this.keymap = keymap;
      this.name = name;
      this.isDead = false;

      this.score = 0;

      this.intents = [];
      this.sequentialIntents = {};

      // This is the action queueing system that allows player input to be processed during discrete moments in gameplay, increasing game predictability
      this.intend = function(intent, sequenceName) {
         if (sequenceName !== undefined) {
            if (this.sequentialIntents[sequenceName] === undefined) {
               this.sequentialIntents[sequenceName] = [];
            }
            this.sequentialIntents[sequenceName].push(intent);
         }
         else {
            this.intents.push(intent);
         }
      };

      this.fireIntents = function() {
         // Anonymous intents get fired all-at-once (so the programmer doesn't have to generate randomly named intents for this purpose)
         var self = this;
         this.intents.forEach(function(intent) {
            intent.call(self);
         });
         this.intents.length = 0;

         // Named intents get fired one-per-name (intents that return true do not count toward this limit)
         for (var sequenceName in this.sequentialIntents) {
            var fallThroughIntent = true;
            while (fallThroughIntent) {
               var intent = this.sequentialIntents[sequenceName].splice(0, 1)[0];
               if (intent !== undefined) {
                  fallThroughIntent = intent.call(self);
               }
               else {
                  fallThroughIntent = false;
               }
            }
         }
      };
   }

   function Keymap(up, down, left, right) {
      if (!(this instanceof Keymap)) {
         return new Keymap(up, down, left, right);
      }
      this[up] = 'up';
      this[down] = 'down';
      this[left] = 'left';
      this[right] = 'right';
   }

   function Timer() {
      if (!(this instanceof Timer)) {
         return new Timer();
      }
      var time = (new Date()).getTime(),
         savedElapsedTime = 0,
         paused = true;
      this.run = function() {
         time = (new Date()).getTime() - savedElapsedTime;
         paused = false;
      };
      this.pause = function() {
         savedElapsedTime = this.elapsed();
         paused = true;
      };
      this.elapsed = function() {
         return paused ? savedElapsedTime : (new Date()).getTime() - time;
      };
   }

   var game = (function Game() {
      if (!(this instanceof Game)) {
         return new Game();
      }

      var local = {}

      local.canvasElement = document.getElementById('game');
      local.width = local.canvasElement.width = local.canvasElement.style.width = document.body.clientWidth;
      local.height = local.canvasElement.height = local.canvasElement.style.height = document.body.clientHeight;
      local.context = local.canvasElement.getContext('2d');
      local.frameActions = [];
      local.eventSubscriptions = {};

      /*
       * Constants
       */

      local.COLLISION_ON = Color(255, 255, 255, 255);
      local.COLLISION_OFF = Color(0, 0, 0, 0);

      /*
       * Members
       */

      local.players = [];
      local.timer = null;
      local.hud = null;

      /*
       * State variables
       */

      local.running = false;
      local.started = false;
      local.previousElapsedTime = 0;
      local.paintBuffer = local.context.createImageData(local.width, local.height);
      local.collisionBuffer = local.context.createImageData(local.width, local.height);

      /*
       * Configuration variables
       */

      local.gridCellSize = 10;
      local.frameDelay = parseInt(1000/60);

      /*
       * Methods
       */

      function frameLoop() {
         if (!local.running) {
            return;
         }
         local.frameActions.forEach(function(frameAction) {
            frameAction();
         });
         setTimeout(frameLoop, local.frameDelay);
      }

      function advanceGame() {
         var totalElapsedTime = local.timer.elapsed(),
            relativeElapsedTime = totalElapsedTime - local.previousElapsedTime;

         local.players.forEach(function(player) {
            var distance = player.speed * relativeElapsedTime / 1000;
            var previousCellCoordinates = Coordinates(null, null);
            for (var i = 0; i <= distance; ++i) {
               player.coordinates[player.direction.axis] += player.direction.sign * Math.min(distance - i, 1);
               var cellCoordinates = player.coordinates.quantize();

               if (!cellCoordinates.equals(previousCellCoordinates)) {
                  if (bufferCellIsSet(local.collisionBuffer, cellCoordinates)) {
                     player.isDead = true;

                     // Check for head-on collisions
                     local.players.forEach(function(otherPlayer) {
                        if (otherPlayer.coordinates.quantize().equals(cellCoordinates)) {
                           otherPlayer.isDead = true;
                        }
                     });

                     break;
                  }

                  drawToBuffer(local.paintBuffer, cellCoordinates, player.color);
                  drawToBuffer(local.collisionBuffer, cellCoordinates, local.COLLISION_ON);

                  // Only perform queued player actions (e.g. turning) on grid cell boundaries (game design decision)
                  if (cellCoordinates[player.direction.axis] % local.gridCellSize === 0) {
                     player.fireIntents();
                  }
               }

               previousCellCoordinates = cellCoordinates;
            }
         });

         var deadPlayers = local.players.filter(function(player) {
            return player.isDead;
         });

         if (deadPlayers.length > 0) {
            drawGame();
            stop();

            local.players.forEach(function(player) {
               player.score += deadPlayers.length - player.isDead;
            });

            fireEvent('crash', local.players);
         }

         local.previousElapsedTime = totalElapsedTime;
      }

      function drawGame() {
         pasteBufferToViewport(local.paintBuffer);
      }

      function start(players) {
         if (local.started) {
            return;
         }

         local.frameActions.length = 0;
         local.players.length = 0;
         local.eventSubscriptions.length = 0;
         clearBuffer(local.paintBuffer);
         clearBuffer(local.collisionBuffer);
         clearViewport();
         local.timer = Timer();

         local.players.push.apply(local.players, players);
         local.frameActions.push(advanceGame);
         local.frameActions.push(drawGame);
         drawGridToBuffer(Color(127, 127, 127, 31));
         local.players.forEach(function(player) {
            drawToBuffer(local.paintBuffer, player.coordinates, player.color);
         });

         drawGame();

         local.started = true;
      }

      function stop() {
         if (!local.started) {
            return;
         }

         local.running = false;
         local.timer.pause();

         local.started = false;
      }

      function run() {
         if (!local.started) {
            return;
         }

         local.running = true;
         local.timer.run();
         frameLoop();
      }

      function pause() {
         if (!local.started) {
            return;
         }

         local.running = false;
         local.timer.pause();
      }

      /*
       * Auxiliary functions
       */

      function drawToBuffer(buffer, coordinates, color) {
         var x = parseInt(coordinates.x);
         var y = parseInt(coordinates.y);
         if (x < 0 || x >= buffer.width || y < 0 || y >= buffer.height) {
            return false;
         }
         var i = ((buffer.height - y - 1) * buffer.width + x) * 4;
         buffer.data[i + 0] = color.r;
         buffer.data[i + 1] = color.g;
         buffer.data[i + 2] = color.b;
         buffer.data[i + 3] = color.a;
      }

      function bufferCellIsSet(buffer, coordinates) {
         var x = parseInt(coordinates.x);
         var y = parseInt(coordinates.y);
         if (x < 0 || x >= buffer.width || y < 0 || y >= buffer.height) {
            return true;
         }
         return !!buffer.data[((buffer.height - y - 1) * buffer.width + x) * 4];
      }

      function pasteBufferToViewport(buffer) {
         local.context.putImageData(buffer, 0, 0);
      }

      function clearBuffer(buffer) {
         var data = buffer.data;
         var length = buffer.width * buffer.height * 4;
         for (var i = 0; i < length; i += 4) {
            data[i + 0] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 0;
         }
      }

      function clearViewport() {
         local.context.clearRect(0, 0, local.width, local.height);
      }

      function drawGridToBuffer(color) {
         var coordinates = Coordinates(0, 0);
         for (coordinates.x = 0; coordinates.x < local.width; coordinates.x += local.gridCellSize) {
            for (coordinates.y = 0; coordinates.y < local.height; ++coordinates.y) {
               drawToBuffer(local.paintBuffer, coordinates, color);
            }
         }
         for (coordinates.y = 0; coordinates.y < local.height; coordinates.y += local.gridCellSize) {
            for (coordinates.x = 0; coordinates.x < local.width; ++coordinates.x) {
               drawToBuffer(local.paintBuffer, coordinates, color);
            }
         }
      }

      function sendKeyToGame(keyCode) {
         if (local.running) {
            local.players.forEach(function(player) {
               var directionName = player.keymap[keyCode];
               if (directionName !== undefined) {
                  player.intend(function() {
                     var currentDetails = this.direction.getDetails();
                     var targetDetails = this.direction.getDetails(directionName);
                     if (currentDetails.axis !== targetDetails.axis) {
                        this.direction.set(directionName);
                     }
                     else {
                        return true;
                     }
                  }, 'turns');
               }
            });
         }
      }

      function subscribeToEvent(eventName, callback) {
         if (local.eventSubscriptions[eventName] === undefined) {
            local.eventSubscriptions[eventName] = [];
         }
         local.eventSubscriptions[eventName].push(callback);
      }

      function fireEvent(eventName) {
         var eventList = local.eventSubscriptions[eventName];
         var callbackArguments = Array.prototype.slice.call(arguments, 1);
         var self = this;
         if (eventList !== undefined) {
            eventList.forEach(function(callback) {
               callback.apply(self, callbackArguments);
            });
         }
      }

      /*
       * Exports
       */

      this.start = start;
      this.stop = stop;
      this.run = run;
      this.pause = pause;
      this.sendKeyToGame = sendKeyToGame;
      this.subscribeToEvent = subscribeToEvent;

      this.getGridCellSize = function() { return local.gridCellSize; };
      this.getWidth = function() { return local.width; };
      this.getHeight = function() { return local.height; };

      this.setHud = function(hud) { local.hud = hud; };
   })();

   var hud = (function Hud(game) {
      if (!(this instanceof Hud)) {
         return new Hud(game);
      }

      var local = {};

      local.hudElement = document.getElementById('hud');

      /*
       * Members
       */

      local.game = game;

      /*
       * Methods
       */

      function showPane(paneName) {
         var paneElement = local.hudElement.querySelector('.pane.' + paneName);
         if (paneElement === null) {
            return;
         }

         Array.prototype.forEach.call(local.hudElement.querySelectorAll('.pane'), function(otherPaneElement) {
            otherPaneElement.classList.remove('active');
         });

         if (paneElement.querySelector('.option.selected') === null) {
            var optionElement = paneElement.querySelector('.option');
            if (optionElement !== null) {
               optionElement.classList.add('selected');
            }
         }

         paneElement.classList.add('active');
      }

      function sendKeyToActivePane(keyCode) {
         var activePaneElement = local.hudElement.querySelector('.pane.active');
         if (activePaneElement === null) {
            return;
         }

         if (activePaneElement.classList.contains('score')) {
            if (keyCode == 27) { // Escape
               local.game.pause();
               showPane('pause');
            }
            else { // Score pane forwards keys to game
               local.game.sendKeyToGame(keyCode);
            }
         }
         else {
            if (keyCode >= 37 && keyCode <= 40) { // Arrows
               var selectedOptionElement = activePaneElement.querySelector('.option.selected') || activePaneElement.querySelector('.option');
               var targetOptionElement = selectedOptionElement;

               switch (keyCode)
               {
                  case 38: // Up
                  case 37: // Left
                     targetOptionElement = selectedOptionElement.previousElementSibling || targetOptionElement;
                     break;
                  case 40: // Down
                  case 39: // Right
                     targetOptionElement = selectedOptionElement.nextElementSibling || targetOptionElement;
                     break;
               }

               Array.prototype.forEach.call(activePaneElement.querySelectorAll('.option'), function(optionElement) {
                  optionElement.classList.remove('selected');
               });
               targetOptionElement.classList.add('selected');
            }
            else if (keyCode === 27) { // Escape
               if (activePaneElement.classList.contains('pause')) {
                  showPane('score');
                  local.game.run();
               }
            }
            else if (keyCode === 13) { // Enter
               var selectedOptionElement = activePaneElement.querySelector('.option.selected');

               if (activePaneElement.classList.contains('menu')) {
                  if (selectedOptionElement === null) {
                     return;
                  }

                  if (selectedOptionElement.classList.contains('versus')) {
                     showPane('score');
                     local.game.start(getPlayerList());
                     local.game.run();
                  }
               }
               else if (activePaneElement.classList.contains('pause') || activePaneElement.classList.contains('crash')) {
                  if (selectedOptionElement === null) {
                     return;
                  }

                  if (selectedOptionElement.classList.contains('resume')) {
                     showPane('score');
                     local.game.run();
                  }
                  else if (selectedOptionElement.classList.contains('restart')) {
                     showPane('score');
                     local.game.stop();
                     local.game.start(getPlayerList());
                     local.game.run();
                  }
                  else if (selectedOptionElement.classList.contains('quit')) {
                     showPane('menu');
                     local.game.stop();
                  }
               }
            }
         }
      }

      /*
       * Event listeners
       */

      document.addEventListener('keydown', function(event) {
         sendKeyToActivePane(event.which);
      });

      local.game.subscribeToEvent('crash', function(players) {
         var classMap = {
            0: 'one',
            1: 'two'
         };
         var deadPlayerName = '';

         players.forEach(function(player, index) {
            var scoreElement = local.hudElement.querySelector('.score.pane .score.' + classMap[index]);
            if (scoreElement !== null) {
               scoreElement.textContent =  player.score;
            }

            if (player.isDead) {
               deadPlayerName = deadPlayerName === '' ? player.name : 'Everyone';
            }
         });

         var nameFieldElement = local.hudElement.querySelector('.crash.pane .loser.note .name.field');
         nameFieldElement.textContent = deadPlayerName;

         showPane('crash');
      });

      /*
       * Exports
       */

      this.showPane = showPane;
   })(game);

   hud.showPane('menu');

   /*
    * Debug zone
    */

   var getPlayerList = function() {
      var playerSpeed = 300;
      return [
         Player(
            Coordinates(game.getGridCellSize() * 3, game.getGridCellSize() * 3),
            Direction('right'),
            playerSpeed,
            Keymap(90, 83, 81, 68),
            Color(255, 127, 63, 255),
            'player1'
         ),
         Player(
            Coordinates(game.getGridCellSize() * (parseInt(game.getWidth() / game.getGridCellSize()) - 3), game.getGridCellSize() * (parseInt(game.getHeight() / game.getGridCellSize()) - 3)),
            Direction('left'),
            playerSpeed,
            Keymap(38, 40, 37, 39),
            Color(0, 191, 127, 255),
            'player2'
         )
      ];
   };

});

/*
 * TODO:
 * Game.stop needs to clear the collision map!!!! (Duh!!!)
 * Game should have a way of triggering actions on the Hud - perhaps an event/callback system on Game
 * Add method Game.configure and move Player list parameter from Game.start to Game.configure
 * Separate Game into Game and Renderer
 * Timer should be a separate entity to which Game and Renderer subscribe (sets up the code for future Net play)
 * Hud should subscribe to Game, but not Renderer
 */
