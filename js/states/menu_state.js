(function () {
    'use strict'; 

    var MenuState = function() {
    };

    MenuState.prototype.preload = function() {
        this.onMenu = true;
        this.game.load.image('background', 'assets/img/LOGO_SPLASH.png');
        this.game.load.image('start', 'assets/img/start1.png');
        this.game.load.audio('environment', 'assets/audio/environment.ogg');
        this.game.load.audio('clickSound', 'assets/audio/click.ogg');
    }   
    
    MenuState.prototype.create = function() {
        
        this.game.add.tileSprite(0, 0, 800, 600, 'background');
        
        this.clickSound = this.game.add.audio('clickSound');
        
        this.onMenu = true;
        
        //var text = this.game.add.text(this.game.world.centerX, this.game.world.centerY - 150, 'Vampixel', { fill: '#ffffff', align: 'center', fontSize: 80 });
        //text.anchor.set(0.5);

        var button = this.game.add.button(this.game.world.centerX, this.game.world.centerY + 150, 'start', clicked, this);
        button.anchor.set(0.5);

        function clicked() {
            this.game.state.start('lavel1');
            this.clickSound.play();
        }  
    }
    
    MenuState.prototype.update = function() {
    }  
    
    gameManager.addState('menu', MenuState);

})();