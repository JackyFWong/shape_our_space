var shift_canvas = true;

function openBar() {
    $("#video-feed").removeClass("close-video").addClass("open-video");
    if (shift_canvas) {
        $("#screen-wrap").removeClass("close-screen").addClass("open-screen");
        $("#personal-video").removeClass("close-preview").addClass("open-preview");
    }
}

function closeBar() {
    $("#video-feed").removeClass("open-video").addClass("close-video");
    if (shift_canvas) {
        $("#screen-wrap").removeClass("open-screen").addClass("close-screen");
        $("#personal-video").removeClass("open-preview").addClass("close-preview");
    }
}

$(document).ready( () => {
	//openBar();
});
