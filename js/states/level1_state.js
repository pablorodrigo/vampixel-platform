(function () {
    'use strict'; 

    var Level1State = function(Level1) {
        // load sprites here
        this.player              = gameManager.getSprite('player');
 
    };
    
    Level1State.prototype.preload = function() {
        // player
        this.player.preload();
        
        //Tile maps
        this.game.load.tilemap('Level1','assets/maps/Level1.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('mapTiles', 'assets/spritesheets/tiles.png');
    }

    Level1State.prototype.create = function() {
       this.game.physics.startSystem(Phaser.Physics.ARCADE);
    
        //Tile maps
        this.Level1 = this.game.add.tilemap('Level1');
        this.Level1.addTilesetImage('tiles','mapTiles');
        
        this.bgLayer = this.Level1.createLayer('Bg');
        this.lavaLayer = this.Level1.createLayer('Lava');
        this.wallsLayer = this.Level1.createLayer('Walls');
        this.wallsLayer.resizeWorld();
        
        //Tile maps - collision
        this.Level1.setCollisionByExclusion([8,9,19,11,16,17,18,19], true, this.wallsLayer);
        this.Level1.setCollision([5,6,13], true, this.lavaLayer);
        
        // setup initial player properties
        this.player.setup(this);
        
        //Movimentacao de camera
        
    }
    
    Level1State.prototype.update = function() {
        this.game.physics.arcade.collide(this.player, this.wallsLayer);
    } 

    
    gameManager.addState('level1', Level1State);

})();