"use strict";



function main() {
    console.log('Hello world.');
}

function displayImage(sel) {
    var select = document.getElementById('image-selector');
    var option = select.options[select.selectedIndex].value;

    var imgDiv = document.getElementById("image-holder");
    var img = document.getElementById("test-image");

    switch (option) {
        case '1':
            imgDiv.style.visibility = "visible";
            img.src = "https://i.ibb.co/f2Sjd0W/gdp-capita.png";
            break;
        case '2':
            imgDiv.style.visibility = "visible";
            img.src = "https://i.ibb.co/KXB3t52/GINI.png";
            break;
        case '3':
            imgDiv.style.visibility = "visible";
            img.src = "https://i.ibb.co/hWCvhJc/homicideper100.png";
            break;
        default:
            imgDiv.style.visibility = "hidden";
            break;
    }

}

// Use window.onload event to launch the main function when loading process has ended
window.onload = main;