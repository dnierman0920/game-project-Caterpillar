// how much food needs to eat to win
const fooEatenToWin = 60;

// variable boolean whether or not the player has been notified that they have won
let winAlerted = false;

//Helper function for random numbers in a set interval
//create a function for random number that has a min and max
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

class Difficulty {
    constructor (maxSpeed, minSpeed,
                 eatingIncrementer, eatingDecrementer,
                sleepIncrementer, sleepDecrementer,
                jarSpinRandomIntervalMin, jarSpinRandomIntervalMax)
    {
        this.maxSpeed  = maxSpeed
        this.minSpeed = minSpeed
        this.eatingIncrementer = eatingIncrementer
        this.eatingDecrementer = eatingDecrementer
        this.sleepIncrementer = sleepIncrementer
        this.sleepDecrementer = sleepDecrementer
        this.jarSpinRandomIntervalMin = jarSpinRandomIntervalMin
        this.jarSpinRandomIntervalMax = jarSpinRandomIntervalMax
    }
}

// create difficulty levels instances
const easy = new Difficulty(14,4,3,5,0.03,0.1,25*1000,30*1000)
const medium = new Difficulty(12,3,2,10,0.02,0.02,20*1000,20*1000)
const hard = new Difficulty(10,2,1,20,0.01,0.01,15*1000,20*1000)

// variable to hold difficulty level instances
const difficultyLevels = [easy, medium, hard]

//manually set difficuly level for now
const difficultyRequest = 0; // setting this easy for now 

// create case staement based on difficuly level
const difficultySettings = difficultyLevels[difficultyRequest]

//globals for items on the screen that will need to be referenced
const canvasGlassJar = document.getElementById('canvasGlassJar')
const divToastEat = document.getElementById('divToastEat')
const divToastSleep = document.getElementById('divToastSleep')
//images for gameboard aka jar
const caterpillarImage = document.getElementById('caterpillarImage')
const antImage = document.getElementById('antImage')
const cacoonImage = document.getElementById('cacoonImage')
const butterflyImage = document.getElementById('butterflyImage')

// toast variables with delays
const toastEat = new bootstrap.Toast(divToastEat, {
    delay: 1500
})

const toastSleep = new bootstrap.Toast(divToastSleep, {
    delay: 1500
})

// we need to get the game's context, which will allows to specify where to put things
// and how big to make them
const ctx = canvasGlassJar.getContext('2d')

//create a class that will be used to create interactive elements on the screen
class InteractiveElement {
    constructor(x, y, width, height, color, image, opacity=1) {
        this.x = x,
        this.y = y,
        this.width = width,
        this.height = height,
        this.color = color,
        this.image = image,
        this.opacity = opacity,
        this.foodsEaten = 0;
        this.speed = 5;
        this.render = function() {
            ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y,this.width, this.height)
            //ctx.strokeStyle = 'black';
            //ctx.strokeRect(this.x, this.y,this.width, this.height); //create a border hopefully not affected by opacity
            ctx.localAlpha = this.opacity; // --> there is an issue here with opacity
            // ctx.fillRect will draw a rectangle on the canvas 
            // will be replacing this with an image --> https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
            ctx.drawImage(this.image,this.x,this.y,this.width, this.height)
        }
        this.increaseEatPoints = function () {
            this.height += difficultySettings.eatingIncrementer
            this.width += difficultySettings.eatingIncrementer
            this.foodsEaten += difficultySettings.eatingIncrementer
            toastEat.Settings
        }
        this.decreaseEatPoints = function(){
            if(this.height > 5 || this.width > 5){
                this.height -= difficultySettings.eatingDecrementer
                this.width -= difficultySettings.eatingDecrementer
                this.foodsEaten -= difficultySettings.eatingDecrementer
                console.log('caterpillar should be shrinking', caterpillar)
            }
            //toastEat.show() --> change this to a notification to "oh no you have been hit! or your life has been turned upside down!"
        }
        this.increaseSleepPoints = function () {
            if(this.opacity < 1){
                this.opacity += difficultySettings.sleepIncrementer
                this.color = `rgba(212, 254, 0, ${this.opacity})`
            }
            if(this.speed < difficultySettings.maxSpeed) {
                this.speed += difficultySettings.sleepIncrementer*10;
                toastSleep.show()
            }
        }
        this.decreaseSleepPoints = function () {
            if(this.opacity >0.20){
                this.opacity -= difficultySettings.sleepDecrementer
                this.color = `rgba(212, 254, 0, ${this.opacity})`
            }
            if(this.speed>difficultySettings.minSpeed) {
                this.speed -= difficultySettings.sleepDecrementer*10;
            }
        }
    }
}

// create Caterpillar & Bed
let caterpillar = new InteractiveElement(450,375,25,25,'rgba(212, 254, 0, 1)',caterpillarImage,)
let bed = new InteractiveElement(400,350,100,150,'rgba(255, 255, 255, 0)',cacoonImage)
let butterfly = new InteractiveElement(250,250,100,100,'rgba(255, 255, 255, 0)',butterflyImage)


const checkWinner = () => {
    if(caterpillar.foodsEaten >= fooEatenToWin){ // need this and to avoid endless loop
        timers.forEach(timer => clearInterval(timer)) // stop game play except for screen refresh
        return true
    }
    return false
}

// create function that receives a 'keydown' and moves accordingly
// found each key's code using this website: https://www.khanacademy.org/computer-programming/keycode-database/1902917694
// up=38, down=40, left=37, right=39
const movementHandler = (e, speed=caterpillar.speed) => {
    let character;
    if(!checkWinner()){
        character = caterpillar
    }
    else{
        character = butterfly
    }
    console.log(`character coordinates (${character.x},${character.y})`)
    switch(e.keyCode){
        case(38): //up arrow
            character.y -= speed;
            if(character.y <78 && character == caterpillar) character.y = 78; // the jar lid start at the y coordinate 78
            break
        case(40): // down arrow
            character.y += speed;
            if(character.y + character.height>=canvasGlassJar.height && character == caterpillar) character.y = canvasGlassJar.height - character.height // set outside of the gameboard
            break
        case(39): // right arrow
            character.x += speed;
            if(character.x+ character.width>= canvasGlassJar.width && character == caterpillar) character.x = canvasGlassJar.width - character.width  // set outside of the gameboard
            break
        case(37): // left arrow
        character.x -= speed;
            if(character.x<0 && character == caterpillar) character.x = 0   // set outside of the gameboard
            break
    }
}

// create a list of food instances
let foods = []

// create a function that creates food
const createFood = () => {
    let numberOfFoods = getRandomIntInclusive(1,10);
    foods = []
    for(let i = 0; i < numberOfFoods; i++) {
    let foodX = Math.floor(Math.random() * 500); // trying to keep food outside of the bed
    let foodY = getRandomIntInclusive(78,500); // trying to keep food outside of the bed
    let foodWidth = 20;
    let foodHeight = 20;
    let food = new InteractiveElement(foodX,foodY,foodWidth,foodHeight,'rgba(255, 255, 255, 0)',antImage)
    foods.push(food)
    }
}

// create a function that indicates when the Caterpillar eats the food
const eatIndicator = () => {
    for ( let i = 0; i < foods.length; i++){ // loop through all the foods and see if the caterpillar has touched any of them
        if (caterpillar.x < foods[i].x + foods[i].width
            && caterpillar.x + caterpillar.width > foods[i].x
            && caterpillar.y < foods[i].y + foods[i].height
            && caterpillar.y + caterpillar.height > foods[i].y
        ){
            caterpillar.increaseEatPoints()
            foods.splice(i,1)
            divToastEat.toast('show')
        }
    }
}

const sleepIndicator = () => {
    if (caterpillar.x > bed.x 
        && caterpillar.x + caterpillar.width < bed.x + bed.width
        && caterpillar.y > bed.y
        && caterpillar.y + caterpillar.height < bed.y + bed.height
    ){ 
        caterpillar.increaseSleepPoints()
    }
}

const drainSleep = () => {
    caterpillar.decreaseSleepPoints()
}

// create a function that attacks (spins) the player and reduces eatingPoints

const jarSpins = () => {
    alert('uh oh, someone kicked the jar..\n HOLD ON!!')
    let startingDegrees = 0
    const rotateJar = () => {
        canvasGlassJar.style.transform = `rotate(${startingDegrees+=90}deg)`;
    }
    const rotateJarInterval = setInterval(rotateJar,500)
    setTimeout(clearInterval,2000, rotateJarInterval)
    caterpillar.decreaseEatPoints()
}


// create a function that refreshes the page every 50 milliseconds to reflect the movements on the screen
const screenRefresh = () => {
    console.log('screen refreshed!')
    if(!checkWinner()){
        ctx.clearRect(0,0,500,500)
        checkWinner()
        bed.render()
        caterpillar.render()
        sleepIndicator()
        foods.forEach(element => element.render())
        eatIndicator()
    }
    else {
        ctx.clearRect(0,0,500,500)
        if(!winAlerted){
            winAlerted = true
            alert("you've won it's time to fly away!")
        }
        butterfly.render()
    }
}

const timers = []

//add event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keydown', movementHandler,)
    //create Timers
    const createFoodInterval = setInterval(createFood, getRandomIntInclusive(2000,5000))
    const drainSleepInterval =  setInterval(drainSleep, 2000)
    const jarShakesInterval = setInterval(jarSpins, getRandomIntInclusive(difficultySettings.jarSpinRandomIntervalMin, difficultySettings.jarSpinRandomIntervalMax))
    const screenRefreshInterval = setInterval(screenRefresh, 50) // refresh screen every 50 ms
    // add Timers to global list --> this will allow the removal of them later
    timers.push(createFoodInterval)
    timers.push(drainSleepInterval)
    //timers.push(screenRefreshInterval) // --> we want to screen to keep refreshing after there is a winner
    timers.push(jarShakesInterval)
})