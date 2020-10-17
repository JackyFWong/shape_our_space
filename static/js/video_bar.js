var shift_canvas = true;

function openBar() {
    document.getElementById("video-feed").style.width = "500px";
    document.getElementById("video-feed").style.padding = "20px";
    if (shift_canvas) {
        document.getElementById("screen-wrap").style.marginRight = "500px";
    }
}

function closeBar() {
    document.getElementById("video-feed").style.width = "0";
    document.getElementById("video-feed").style.padding = "0";
    if (shift_canvas) {
        document.getElementById("screen-wrap").style.marginRight = "0";
    }
}
