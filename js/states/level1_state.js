(function () {
    'use strict'; 

    var Level1State = function(Level1) {
        // load sprites here
        this.player = gameManager.getSprite('player');
 
    };
    
    Level1State.prototype.preload = function() {
        // player
        this.player.preload();
        this.game.load.image('mapTiles', 'assets/spritesheets/tiled-fases.png');
        this.game.load.spritesheet('items', 'Assets/spritesheets/items.png', 32, 32, 16);
        this.game.load.audio('environmentSound', 'assets/sounds/environment.ogg');
        
        //Tile maps
        this.game.load.tilemap('Level1','assets/maps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    }

    Level1State.prototype.create = function() {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        
        this.environmentSound = this.game.add.audio('environmentSound');
        this.environmentSound.loop = true;
        this.environmentSound.play();
    
        //Tile maps
        this.Level1 = this.game.add.tilemap('Level1');
        this.Level1.addTilesetImage('tiled-fases','mapTiles');
        
        this.bgLayer = this.Level1.createLayer('Bg');
        this.fireLayer = this.Level1.createLayer('Fire');
        this.wallsLayer = this.Level1.createLayer('Walls');
        this.wallsLayer.resizeWorld();
        
        //Tile maps - collision
        this.Level1.setCollisionByExclusion([19,20,21,22,23,24], true, this.wallsLayer);
        this.Level1.setCollision(29, true, this.fireLayer);
        
        // setup initial player properties
        this.player.setup(this);
        this.player.sprite.x = this.game.world.centerX;
        this.player.sprite.y = 70;
        
        //Movimentacao de camera
        this.game.camera.follow(this.player.sprite);
        
        // Grupo de diamantes
        this.diamonds = this.game.add.physicsGroup();
        this.Level1.createFromObjects('Items', 'diamond', 'items', 5, true, false, this.diamonds);
        // Para cada objeto do grupo, vamos executar uma função
        this.diamonds.forEach(function(diamond){
            // body.immovable = true indica que o objeto não é afetado por forças externas
            diamond.body.immovable = true;
            // Adicionando animações; o parâmetro true indica que a animação é em loop
            diamond.animations.add('spin', [4, 5, 6, 7, 6, 5], 6, true);
            diamond.animations.play('spin');
        });
        
        //Fire effect with phaser particles
        var emitter;
        var pSize = this.game.world.width / 12.5;
        var bmpd = this.game.add.bitmapData(pSize, pSize);
        // Create a radial gradient, yellow-ish on the inside, orange
        // on the outside. Use it to draw a circle that will be used
        // by the FireParticle class.
        var grd = bmpd.ctx.createRadialGradient(
                    pSize / 2, pSize /2, 2,
                    pSize / 2, pSize / 2, pSize * 0.5);
        
        grd.addColorStop(0, 'rgba(193, 170, 30, 0.6)');
        grd.addColorStop(1, 'rgba(255, 100, 30, 0.1)');
        bmpd.ctx.fillStyle = grd;
        
        bmpd.ctx.arc(pSize / 2, pSize / 2 , pSize / 2, 0, Math.PI * 2);
        bmpd.ctx.fill();
        
        this.game.cache.addBitmapData('flame', bmpd);
        
        // Generate 100 particles
        emitter = this.game.add.emitter(this.game.world.centerX, this.game.world.height, 100);
        emitter.width = 11 * pSize;
        emitter.particleClass = FireParticle;
        
        // Magic happens here, bleding the colors of each particle
        // generates the bright light effect
        emitter.blendMode = PIXI.blendModes.ADD;
        emitter.makeParticles();
        emitter.minParticleSpeed.set(-15, -160);
        emitter.maxParticleSpeed.set(15, -200);
        emitter.setRotation(0, 0);
        // Make the flames taller than they are wide to simulate the
        // effect of flame tongues
        emitter.setScale(3, 1, 4, 3, 12000, Phaser.Easing.Quintic.Out);
        emitter.gravity = -20;
        emitter.start(false, 3000, 50);
    }
    
    function FireParticle(game, x, y) {
        Phaser.Particle.call(this, game, x, y, game.cache.getBitmapData('flame'));
    }
    
    FireParticle.prototype = Object.create(Phaser.Particle.prototype);
    FireParticle.prototype.constructor = FireParticle;
    
    Level1State.prototype.update = function() {
        // Colisão com o fogo - o jogador morre
        this.game.physics.arcade.collide(this.player.sprite, this.fireLayer, this.fireDeath, null, this.player);
        this.game.physics.arcade.collide(this.player.sprite, this.wallsLayer, this.player.groundCollision, null, this.player);
        // Colisão com os diamantes - devem ser coletados
        this.game.physics.arcade.overlap(this.player.sprite, this.diamonds, this.diamondCollect, null, this.player);
        this.player.handleInputs();        
    } 

    // Tratamento da colisão entre o jogador e os diamantes
    // As funções para esse fim sempre recebem os dois objetos que colidiram,
    // e então podemos manipular tais objetos
    Level1State.prototype.diamondCollect = function(player, diamond){
        diamond.kill();
        this.game.state.start('level2');  
    }
    
    Level1State.prototype.fireDeath = function(player, fire){
        console.debug("fireDeath");
        this.Level1.setCollision(29, false, this.fireLayer);
        this.game.state.start('level2');
    }
    
    gameManager.addState('level1', Level1State);

})();
