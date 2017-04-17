let game = new Phaser.Game(
    800,
    600,
    Phaser.AUTO,
    'game',
    {
        preload: preload,
        create: create,
        update: update
    }
);

let player;
let tie_fighters;
let destroyer;
let starfield;
let cursors;
let bank;
let bullets;
let enemyBullets;
let fireButton;
let bulletTime = 0;
let health;
let gameOver;
let restartText;
let tie_fighterLaunchTime;
let destroyerLaunchTime;
let score = 0;
let scoreText;
let music;
let pauseButton;

let AccelerationX = 600;
let AccelerationY = 300;
let Drag = 450;
let MaxSpeed = 450;

function preload() {
    game.load.image('starfield', './resForGame/starbackground.png');
    game.load.image('ship', './resForGame/X_Wing.png');
    game.load.image('bullet', './resForGame/bulletHero1.png');
    game.load.image('trail', './resForGame/bullet.png');
    game.load.image('tie-fighter', './resForGame/TIE_Fighter1.png');
    game.load.image('destroyer', './resForGame/destroyer.png');
    game.load.bitmapFont('swfont','./resForGame/font.png','./resForGame/font.fnt')
    game.load.image('destroyerEnemyBullet', './resForGame/bulletEvil1.png');
    game.load.audio('mainTheme', './resForGame/mainTheme.mp3');
}

function create() {
    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    music = game.add.audio('mainTheme');
    music.play()


    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(10, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    tie_fighters = game.add.group();
    tie_fighters.enableBody = true;
    tie_fighters.physicsBodyType = Phaser.Physics.ARCADE;
    tie_fighters.createMultiple(5, 'tie-fighter');
    tie_fighters.setAll('anchor.x', 0.5);
    tie_fighters.setAll('anchor.y', 0.5);
    tie_fighters.setAll('scale.x', 0.5);
    tie_fighters.setAll('scale.y', 0.5);
    tie_fighters.setAll('angle', 180);
    tie_fighters.setAll('outOfBoundsKill', true);
    tie_fighters.setAll('checkWorldBounds', true);

    tie_fighters.forEach(function (enemy) {
        enemy.body.setSize(enemy.width, enemy.height);
        enemy.damage = 20;
    });


    game.time.events.add(1000, launchTieFighter);

    destroyerEnemyBullets = game.add.group();
    destroyerEnemyBullets.enableBody = true;
    destroyerEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    destroyerEnemyBullets.createMultiple(10, 'destroyerEnemyBullet');
    destroyerEnemyBullets.setAll('alpha', 0.9);
    destroyerEnemyBullets.setAll('anchor.x', 0.5);
    destroyerEnemyBullets.setAll('anchor.y', 0.5);
    destroyerEnemyBullets.setAll('outOfBoundsKill', true);
    destroyerEnemyBullets.setAll('checkWorldBounds', true);
    destroyerEnemyBullets.forEach(function (enemy) {
        enemy.body.setSize(10,30)
    });



    destroyer = game.add.group();
    destroyer.enableBody = true;
    destroyer.physicsBodyType = Phaser.Physics.ARCADE;
    destroyer.createMultiple(5, 'destroyer');
    destroyer.setAll('anchor.x', 0.5);
    destroyer.setAll('anchor.y', 0.5);
    destroyer.setAll('scale.x', 0.5);
    destroyer.setAll('scale.y', 0.5);
    destroyer.setAll('angle', 180);
    destroyer.setAll('outOfBoundsKill', true);
    destroyer.setAll('checkWorldBounds', true);

    destroyer.forEach(function(enemy){
        enemy.body.setSize(enemy.width, enemy.height);
        enemy.damage = 30;
    });

    game.time.events.add(1000, launchDestroyer);


    player = game.add.sprite(400, 540, 'ship');
    player.health = 100;
    player.anchor.setTo(0.5, 0.5);

    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.maxVelocity.setTo(MaxSpeed, MaxSpeed);
    player.body.drag.setTo(Drag, Drag);

    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    pauseButton = game.input.keyboard.addKey(Phaser.Keyboard.ESC);

    health = game.add.bitmapText(game.world.width - 175, 10, 'swfont', '' + player.health, 25);
    health.render = function () {
        health.text = 'Health:' + Math.max(player.health, 0);
    };
    health.render();

    gameOver = game.add.bitmapText(game.world.centerX, game.world.centerY, 'swfont', 'game over', 84);
    gameOver.anchor.setTo(0.5, 0.5);
    gameOver.visible = false;
    restartText = game.add.bitmapText(game.world.centerX, game.world.centerY + 100, 'swfont', 'press space to restart', 20);
    restartText.anchor.setTo(0.5, 0.5);
    restartText.visible = false;

    scoreText = game.add.bitmapText(20, 10, 'swfont','',25);
    scoreText.render = function(){
       scoreText.text = 'Score:' + score;
    };
    scoreText.render();
}
function update() {
    starfield.tilePosition.y += 2;

    player.body.acceleration.x = 0;
    player.body.acceleration.y = 0;

    if (cursors.left.isDown) {
        player.body.acceleration.x = -AccelerationX;
    }
    else if (cursors.right.isDown) {
        player.body.acceleration.x = AccelerationX;
    }
    else if (cursors.up.isDown) {
        player.body.acceleration.y = -AccelerationY;
    }
    else if (cursors.down.isDown) {
        player.body.acceleration.y = AccelerationY;
    }


    bank = player.body.velocity.x / MaxSpeed;
    player.scale.x = 1 - Math.abs(bank) / 2;
    player.angle = bank * 30;

    if (player.x > game.width - 40) {
        player.x = game.width - 40;
        player.body.acceleration.x = 0;
    }
    if (player.x < 40) {
        player.x = 40;
        player.body.acceleration.x = 0;
    }
    if (player.y > game.height - 40) {
        player.y = game.height - 40;
        player.body.acceleration.y = 0;
    }
    if (player.y < 40) {
        player.y = 40;
        player.body.acceleration.y = 0;
    }

    if (player.alive && fireButton.isDown) {
        fireBullet();
    }

    game.physics.arcade.overlap(player, tie_fighters, shipCollision, null, this);
    game.physics.arcade.overlap(tie_fighters, bullets, damageEnemy, null, this);
    game.physics.arcade.overlap(player, destroyer, shipCollision, null, this);
    game.physics.arcade.overlap(destroyer, bullets, damageEnemy, null, this);
    game.physics.arcade.overlap(destroyerEnemyBullets, player, enemyHits, null, this);

    if (!player.alive && gameOver.visible === false) {
        gameOver.visible = true;
        restartText.visible = true;
        let fadeInGameOver = game.add.tween(gameOver);
        fadeInGameOver.to({alpha: 1}, 1000, Phaser.Easing.Quintic.Out);
        fadeInGameOver.onComplete.add(setResetHandlers);
        fadeInGameOver.start();
        function setResetHandlers() {
            let spaceRestart = fireButton.onDown.addOnce(_restart, this);
            function _restart() {
                spaceRestart.detach();
                restart();
            }
        }
    }
}

function render() {
    game.debug.soundInfo(music, 20, 32);
}

function launchTieFighter() {
    let Min_Enemy_Spacing = 300;
    let Max_Enemy_Spacing = 3000;
    let Enemy_Speed = 300;

    let enemy = tie_fighters.getFirstExists(false);
    if (enemy) {
        enemy.reset(game.rnd.integerInRange(0, game.width), -20);
        enemy.body.velocity.x = game.rnd.integerInRange(-300, 300);
        enemy.body.velocity.y = Enemy_Speed;
        enemy.body.drag.x = 100;
    }

    tie_fighterLaunchTime = game.time.events.add(game.rnd.integerInRange(Min_Enemy_Spacing, Max_Enemy_Spacing), launchTieFighter);
}

function launchDestroyer(){
    let startingX = game.rnd.integerInRange(100, game.width - 100);
    let speed = 150;
    let spread = 90;
    let frequency = 80;
    let verticalSpacing = 90;
    let numberEnemiesInWave = 4;
    let timeBetween = 5000;

    for(let i = 0; i < numberEnemiesInWave; i++){
        let enemy = destroyer.getFirstExists(false);
        if(enemy){
            enemy.startingX = startingX;
            enemy.reset(game.width / 2, -verticalSpacing * i);
            enemy.body.velocity.y = speed;

            let bulletSpeed = 400;
            let delay = 500;
            enemy.bullets = 3;
            enemy.lastShot = 0;

            enemy.update = function () {
                this.body.x = this.startingX + Math.sin((this.y)/frequency)*spread;

                let enemyBullet = destroyerEnemyBullets.getFirstExists(false);
                if (enemyBullet && this.alive && this.bullets && this.y > game.width / 8 &&
                    game.time.now > delay + this.lastShot){
                    this.lastShot = game.time.now;
                    this.bullets--;
                    enemyBullet.reset(this.x, this.y + this.height / 2);
                    enemyBullet.damage = this.damage;
                    let angle = game.physics.arcade.moveToObject(enemyBullet, player, bulletSpeed);
                    enemyBullet.angle = game.math.radToDeg(angle+90);
                }

                if(this.y > game.height + 200){
                    this.kill();
                }
            };

        }
    }


    destroyerLaunchTime = game.time.events.add(timeBetween, launchDestroyer);
}

function fireBullet() {
    if (game.time.now > bulletTime) {
        let Bullet_Speed = 400;
        let Bullet_Spacing = 250;
        let bullet = bullets.getFirstExists(false);
        if (bullet) {
            let bulletOffset = 10 * Math.sin(game.math.degToRad(player.angle));
            bullet.reset(player.x + bulletOffset, player.y);
            bullet.angle = player.angle;
            game.physics.arcade.velocityFromAngle(bullet.angle - 90, Bullet_Speed, bullet.body.velocity);
            bullet.body.velocity.x += player.body.velocity.x;

            bulletTime = game.time.now + Bullet_Spacing;
        }
    }
}
function shipCollision(player, enemy) {
    enemy.kill();
    player.damage(enemy.damage);
    health.render();
    score += enemy.damage * 5;
    scoreText.render();
}
function damageEnemy(enemy, bullet) {
    enemy.kill();
    bullet.kill();
    score += enemy.damage * 5;
    scoreText.render();
}
function enemyHits(player, bullet) {
    bullet.kill();
    player.damage(bullet.damage);
    health.render();
}
function restart(){
    tie_fighters.callAll('kill');
    game.time.events.remove(tie_fighterLaunchTime);
    game.time.events.add(1000, launchTieFighter);

    destroyer.callAll('kill');
    destroyerEnemyBullets.callAll('kill');
    game.time.events.remove(destroyerLaunchTime);
    game.time.events.add(1000, launchDestroyer);
    player.revive();
    player.health = 100;
    health.render();
    score = 0;
    scoreText.render();
    gameOver.visible = false;
    restartText.visible = false;
}

function changeVolume(pointer) {

    if (pointer.y < 100)
    {
        music.mute = false;
    }
    else if (pointer.y < 300)
    {
        music.volume += 0.1;
    }
    else
    {
        music.volume -= 0.1;
    }

}
