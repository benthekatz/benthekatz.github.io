var mouseOn = false;

//brush
var prevX, prevY;
var canvas_context;

//line
var startX = 0;
var startY = 0;

//shapes
var w = 10;
var h = 10;

var drawData = [];

//initialize
function init() {

    canvas = document.getElementById("canvas");
    canvas_context = canvas.getContext("2d");

    canvas.width = window.innerWidth * 0.75;
    canvas.height = window.innerHeight * 0.75;


    $("#canvas").mousedown(function (e) {
        if (returnTool() === "line") {
            var x = e.pageX - $(this).offset().left;
            var y = e.pageY - $(this).offset().top

            mouseOn = true;

            startX = x;
            startY = y;
        } else {
            mouseOn = true;
            doPaint(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
        }
    });

    $("#canvas").mousemove(function (e) {
        if (mouseOn) {
            if (returnTool() === "line") {

            } else {
                doPaint(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
            }

        }
    });

    $("#canvas").mouseup(function (e) {
        if (returnTool() === "line") {
            var x = e.pageX - $(this).offset().left;
            var y = e.pageY - $(this).offset().top;

            canvas_context.beginPath();
            canvas_context.moveTo(startX, startY);
            canvas_context.lineTo(x, y);
            canvas_context.strokeStyle = '#' + jscolor;
            canvas_context.lineWidth = $("#select-width").val();
            canvas_context.stroke();
        }
        mouseOn = false;
    });

    $("#canvas").mouseleave(function (e) {
        mouseOn = false;
    });

    readCanvas();
}

function returnTool() {
    return $(".active input").prop('id');
}

//painting
function doPaint(x, y, isPaint) {
    canvas_context.beginPath();
    canvas_context.strokeStyle = '#' + jscolor;
    canvas_context.lineWidth = $("#select-width").val();
    canvas_context.lineJoin = "round";
    switch (returnTool()) {
        case "brush":
            if (isPaint) {
                canvas_context.moveTo(prevX, prevY);
                canvas_context.lineTo(x, y);
            }
            prevX = x;
            prevY = y;
            break;
        case "rect":
            if (isPaint) {
                canvas_context.lineWidth = $("#select-width").val() * 1.75;
                canvas_context.rect(x, y, w, h);
                canvas_context.fill();
            }
            break;
        case "circle":
            if (isPaint) {
                canvas_context.arc(x, y, w, 0, 2 * Math.PI);
            }
            break;
    }
    canvas_context.closePath();
    canvas_context.stroke();
    //canvas_context.fill();
}

function updateColor(jscolor) {
    canvas_context.strokeStyle = '#' + jscolor;
    canvas_context.fillStyle = '#' + jscolor;
    hex = '#' + jscolor;
}

function saveImage() {
    var canvas = document.getElementById("canvas");
    var download = document.getElementById("download");
    
    var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    download.setAttribute("href", image);
}

