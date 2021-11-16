var active = 0;
var gauntlet = document.getElementById('gauntlet');
var box = document.getElementsByClassName('box');

function trick() {

    if(active == 0) {
        let audio = new Audio('audio/trick.mov');
        audio.loop = false;
        audio.play();
        gauntlet.src = 'img/2.png';
        setTimeout(function() {
            gauntlet.src = 'img/3.png';
        },400)
        setTimeout(function() {
            gauntlet.src = 'img/4.png';
        },1000)
        setTimeout(function() {
            gauntlet.src = 'img/5.png';
            kill();
        },1200)
        active = 0;
    
    }
}

function kill() {
   for (i = 1; i <= box.length; i +=1) {
    let audio = new Audio('audio/kill1.mp4');
    audio.loop = false;
    audio.play();
    $('#b'+i).fadeOut("slow",0);
   }
   setTimeout(function() {
            window.location.replace("./index.html");
   },2000)
   
     
}
