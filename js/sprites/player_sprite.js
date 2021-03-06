(function () {
    'use strict';

    var Player = function () {
        //SpriteSheet Player
        this.imageName = 'player_image';
        this.imageUrl = 'assets/spritesheets/walk-idle-transform-BAT.png';
        this.sprite = null;
        
        //BatShot
        this.imageNameBatShot = 'batShot_image';
        this.imageUrlBatShot = 'assets/img/red_square_10x10.png';
        this.imageBatShot = null;
        
        //Lives Blood
        this.imageNameLives = 'lives_image';
        this.imageUrlLives = 'assets/img/blood.png';
        this.imageBloodLives = null;
        
        this.gravity = 750;
        this.jumpVelocity = -450;
        this.isJumping = false;
        this.isDoubleJumping = false;
        this.initialPositionX = 50;
        this.initialPositionY = this.game.height - 500;
        
        this.bullets;
        this.bulletTime = 0;
        this.bullet;
        
        //Sound Jump
        this.soundNameJump = 'jumpSound';
        this.soundUrlJump = 'assets/sounds/jump2.ogg';
        this.soundJump = null;
        
        //Sound Pickup
        this.soundNamePickupBlood = 'pickupSound';
        this.soundUrlPickupBlood = 'assets/sounds/sipBlood.ogg';
        this.soundPickup = null;
        this.stateContext = null;
    }

    Player.prototype.preload = function () {
        //Load Imagens
        this.game.load.spritesheet(this.imageName, this.imageUrl, 48, 64);
        this.game.load.image(this.imageNameBatShot, this.imageUrlBatShot);
        this.game.load.image(this.imageNameLives, this.imageUrlLives);
        
        //Load Sounds
        this.game.load.audio(this.soundNameJump, this.soundUrlJump);
        this.game.load.audio(this.soundNamePickupBlood, this.soundUrlPickupBlood);
    }

    Player.prototype.setup = function (stateContext) {   
        var self = this;

        //Criando balas
        this.bullets = this.game.add.group();
        this.bullets.enableBody = true; 
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        for (var i = 0; i < 40; i++){
            var b = this.bullets.create(0, 0, this.imageNameBatShot);
            b.name = 'imageNameBatShot' + i;
            b.exists = false;
            b.visible = false;
            b.checkWorldBounds = true;
            b.events.onOutOfBounds.add(this.resetBullet, this);
        }
        
        //SpriteSheet and Animations Player
        this.sprite = this.game.add.sprite(this.initialPositionX, this.initialPositionY, this.imageName);   
        this.sprite.frame = 0;
        this.sprite.animations.add('walk', [0, 1, 2, 3], 22, true);
        this.sprite.animations.add('transform', [7,8,9], 22, true);
        this.sprite.animations.add('batTransformation', [10,11,12,13,14,15,16,17,18,19], 22, true);
        this.sprite.anchor.set(0.5);
        this.game.physics.arcade.enable(this.sprite);
        this.sprite.body.gravity.y = this.gravity;
        this.stateContext = stateContext;
        
        //Img Blood Lives
        this.imageBloodLives1 = this.game.add.sprite(40, 40, this.imageNameLives); 
        this.imageBloodLives1.anchor.set(0.5);
        this.imageBloodLives1.fixedToCamera = true;

        this.imageBloodLives2 = this.game.add.sprite(90, 40, this.imageNameLives); 
        this.imageBloodLives2.anchor.set(0.5);
        this.imageBloodLives2.fixedToCamera = true;

        this.imageBloodLives3 = this.game.add.sprite(140, 40, this.imageNameLives); 
        this.imageBloodLives3.anchor.set(0.5);
        this.imageBloodLives3.fixedToCamera = true;
                
        //Sounds
        this.soundJump = this.game.add.audio(this.soundNameJump);
        this.soundPickup = this.game.add.audio(this.soundNamePickupBlood);
        
        //Controles
        this.keys = this.game.input.keyboard.createCursorKeys();
        this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.jumpButton.onDown.add(this.jump, this);
        this.shotButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

    }

    Player.prototype.decreaseLives = function () {
        gameManager.globals.lives--;

        if(gameManager.globals.lives === 2) {
            this.imageBloodLives3.kill();
        }

        if(gameManager.globals.lives === 1) {
            this.imageBloodLives2.kill();
        }

        if(gameManager.globals.lives <= 0) {
            this.imageBloodLives1.kill();
            this.game.state.start('lose');
        }
    }

    Player.prototype.jump = function () {    
        if(this.sprite.body.touching.down || this.sprite.body.onFloor()) {
            this.isJumping = true;
            return doJump.apply(this);
        }
        else if(!this.isDoubleJumping) {
            this.isDoubleJumping = true;
            this.sprite.animations.play('batTransformation');
            return doJump.apply(this);
        }

        function doJump() {
            this.sprite.body.velocity.y = this.jumpVelocity || -450;
        }
    }

    Player.prototype.groundCollision = function (playerSprite) {
        if((this.isJumping) && (this.sprite.body.touching.down || this.sprite.body.onFloor())) {
            this.isJumping = false;
            this.isDoubleJumping = false;
             this.sprite.animations.play('walk');
        }
    }

    Player.prototype.handleInputs = function () {      
        if(this.keys.left.isDown){
            this.sprite.body.velocity.x = -150; // Ajustar velocidade
            // Se o jogador estiver virado para a direita, inverter a escala para que ele vire para o outro lado
            if(this.sprite.scale.x == 1) this.sprite.scale.x = -1;
            // Iniciando a animação 'walk'
            if(!this.isJumping) {
                this.sprite.animations.play('walk');
            }
        }

        // mover o sprite para a direita
        else if(this.keys.right.isDown){
            // se a tecla direita estiver pressionada
            this.sprite.body.velocity.x = 150;  // Ajustar velocidade
            // Se o jogador estiver virado para a direita, inverter a escala para que ele vire para o outro lado
            if(this.sprite.scale.x == -1) this.sprite.scale.x = 1;

            if(!this.isDoubleJumping) {
                this.sprite.animations.play('walk');
            }
        }
        else {
            // Ajustar velocidade para zero
            this.sprite.body.velocity.x = 0;
             
            if(!this.isDoubleJumping) {
                this.sprite.animations.play('');
            }
        }
        
        if (this.shotButton.isDown){
            this.fire();
        }
    }
    
    //Shot Bats
    Player.prototype.fire = function () {
        if (this.game.time.now > this.bulletTime) {
            this.bullet = this.bullets.getFirstExists(false);
            if (this.bullet) {
                this.bullet.reset(this.sprite.x, this.sprite.y);
                if (this.sprite.scale.x == 1) {
                    this.bullet.body.velocity.x = 300;
                    this.bulletTime = this.game.time.now + 150;
                } else {
                    this.bullet.body.velocity.x = -300;
                    this.bulletTime = this.game.time.now + 150;
                }
            }
        }
    }
    
    Player.prototype.resetBullet = function(bullet) {
        bullet.kill();
    }
    gameManager.addSprite('player', Player);

})();