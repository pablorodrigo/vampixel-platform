(function () {
    'use strict'; 
    
    var player = {
        sprite: null,
        jumpVelocity: -450,
        isJumping: false,
        isDoubleJumping: false,
        setup: function () {
            player.sprite = this.game.add.sprite(this.game.world.centerX, 450, 'player');
            player.sprite.anchor.set(0.5);
            this.game.physics.arcade.enable(player.sprite);
            player.sprite.body.gravity.y = 750;
        },
        jump: function () {
            if(player.sprite.body.touching.down) {
                player.isJumping = true;
                doJump.apply(this);
            }
            else if(!player.isDoubleJumping) {
                player.isDoubleJumping = true;
                doJump.apply(this);
            }

            function doJump() {
                // this.jumpSound.play();
                this.game.add.tween(player.sprite).to({ angle: 360 }, 750, Phaser.Easing.Exponential.Out).start();
                player.sprite.body.velocity.y = player.jumpVelocity || -450;
            }
        },
        groundCollision: function (playerSprite) {
            if(player.isJumping) {
                player.isJumping = false;
                player.isDoubleJumping = false;
                playerSprite.angle = 0;
            }
        },
        bloodCollision: function (player, blood) {
            // this.bloodSound.play();
            blood.kill();

            // this.particleEmitter.x = blood.x;
            // this.particleEmitter.y = blood.y;
            // this.particleEmitter.start(true, 500, null, 10);
        }
    }

    var GameState = function() {
    };

    GameState.prototype.preload = function() {
        this.game.load.image('player', 'assets/img/player.png');
        this.game.load.image('platform', 'assets/img/wallHorizontal.png');
        this.game.load.image('particle', 'assets/img/pixel.png');
        this.game.load.audio('jumpSound', 'assets/audio/jump.ogg');
        this.game.load.image('blood', 'assets/img/blood.png');
        // this.game.load.audio('bloodSound', 'assets/audio/blood.ogg');
    }

    GameState.prototype.create = function() {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.stage.backgroundColor = '#62a2c5';

        // setup initial player properties
        player.setup.apply(this);

        this.platform = this.game.add.sprite(0, this.game.world.height - 100, 'platform');
        this.game.physics.arcade.enable(this.platform);
        this.platform.body.immovable = true;
        this.platform.width = this.game.world.width;
        this.platform.height = 100;
        this.jumpSound = this.game.add.audio('jumpSound');
        // this.bloodSound = this.game.add.audio('bloodSound');

        // blood group
        this.bloods = this.game.add.group();
        this.bloods.enableBody = true;
        this.bloods.create(200, 400, 'blood');
        this.bloods.create(400, 400, 'blood');
        this.bloods.create(600, 400, 'blood');
        this.bloods.setAll('body.immovable', true);

        // this.bloodCount = 3;

        // Emissor de particulas
        // this.particleEmitter = this.game.add.emitter(0, 0, 100);
        // this.particleEmitter.makeParticles('particle');
    }

    GameState.prototype.update = function() {
        handleColliders.apply(this);
        handleInputs.apply(this);
    }    
    
    GameState.prototype.render = function() {
        // this.game.debug.inputInfo(32, 32);
    }

    function handleColliders() {
        this.game.physics.arcade.collide(player.sprite, this.platform, player.groundCollision, null, this);
        this.game.physics.arcade.overlap(player.sprite, this.bloods, player.bloodCollision, null, this);
    }

    function handleInputs() {
        
        this.game.input.keyboard.addKey(Phaser.Keyboard.W).onDown.add(function () {
            player.jump.apply(this);
        }, this);

        if (this.game.input.keyboard.isDown(Phaser.Keyboard.A)) {
            player.sprite.body.velocity.x = -150;
        }
        else if (this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            player.sprite.body.velocity.x = 150;
        }
        else {
             player.sprite.body.velocity.x = 0;
        }
    }

    gameManager.addState('game', GameState);

})();