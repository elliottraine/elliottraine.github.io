Square Quest!
==========================

A very minimal javascript platform game

TO-DO
=====
1. Change the player's color — edit the PLAYER_COLOR variable at the top of game.js.
2. Change the player's size — edit player.width / player.height.
3. Tune the physics — play with GRAVITY, MOVE_SPEED, and JUMP_POWER until the game feels good.
4. Add a platform — copy a line in the platforms array and change the numbers.
5. Change the sky color — one line in the draw() function.
6. Add more treasure — copy a line in the treasures array.
7. Show a "You win" message — check treasures.every(t => t.collected) and unhide winMessage.
8. Make enemies patrol — move enemy.x by enemy.vx each frame and flip direction at minX/maxX.
9. Stomp vs. hurt — landing on top of an enemy defeats it; touching it from the side sends the player back to start.
10. Lives / game over — use the existing lives variable, show it in the HUD, and add a game-over screen.
11. Sound effects — add <audio> tags in index.html, call .play() on jump/collect/stomp.
12. Play Again button (or a second level) — reset all the game state, or build a second level to switch to.
13. Remember the best score — save/read it with localStorage.
14. Polish — a little squash-and-stretch on the player, or a particle burst when treasure is collected.

SUPPORTED BROWSERS
==================

Any modern browser with canvas support

DEVELOPMENT
===========

The game is 100% client side javascript, html and css. It should run when served up by any web server.

License
=======

[MIT](http://en.wikipedia.org/wiki/MIT_License) license.

