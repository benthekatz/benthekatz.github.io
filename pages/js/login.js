//google login
var auth2;
var loginStatus;
var timeoutStatus;

//login modal
var modal = document.getElementById("loginModal");
var close = document.getElementsByClassName("close")[0];
var error = document.getElementById("error");

//timeout modal
var timeoutModal = document.getElementById("timeoutModal")

//firebase authentication
var provider = new firebase.auth.GoogleAuthProvider();

//firebase database instance
var database = firebase.database();

//timers
var timeoutTimer = new Timer();

//drawings
var hex = "#000000";
var drawingRef = firebase.database().ref('drawings');
var newDrawingRef = drawingRef.push();
var mouseOn = false;
var tempDrawing = [];

var initClient = function () {
    gapi.load('auth2', function () {
        auth2 = gapi.auth2.init({
            client_id: 'CLIENT_ID.apps.googleusercontent.com'
        });

        auth2.attachClickHandler('signin-button', {}, onSignIn, onFailure);
    });

    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        loginStatus = true;
    } else {
        loginStatus = false;
    }
};

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId());
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail());

    console.log('Google Auth Response', googleUser);
    var unsubscribe = firebase.auth().onAuthStateChanged(function (firebaseUser) {
        unsubscribe();

        if (!isUserEqual(googleUser, firebaseUser)) {
            var credential = firebase.auth.GoogleAuthProvider.credential(
                    googleUser.getAuthResponse().id_token);
            firebase.auth().signInWithCredential(credential).catch(function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                var email = error.email;
                var credential = error.credential;
                console.log(errorCode, errorMessage, email, credential);
            });

        } else {
            console.log('User already signed-in Firebase.');
        }
    });

    loginStatus = true;
    $(".collapse").collapse("show");
    modal.style.display = "none";

    var userId = profile.getId();
    var ref = firebase.database().ref("users/" + userId);
    var timeout;
    ref.once("value", function (snapshot) {
        timeout = snapshot.child("timeout_active").val();
        if (timeout === true) {
            lock(userId);
            timeoutStatus = true;
        } else {
            unlock(userId);
            timeoutStatus = false;
        }
    }, function (error) {
        console.log("Error: " + error.code);
    });

    writeUserData(profile.getId(), profile.getName(), profile.getEmail(), profile.getImageUrl(), timeoutStatus);
}

var interval = 60000;

function reset() {
    localStorage.endTime = +new Date + interval;
}

function unlock(userId) {
    timeoutStatus = false;
    timeoutModal.style.display = "none";
    $("#drawingTimer").show();

    firebase.database().ref('users/' + userId).update({
        timeout_active: timeoutStatus
    });

    if (!localStorage.endTime) {
        reset();
    }

    setInterval(function () {
        var remaining = localStorage.endTime - new Date;
        if (remaining >= 0) {
            $('#timer').text(Math.floor(remaining / 1000));
        } else {
            lock(userId);
            localStorage.clear();
            $("#drawingTimer").hide();
        }
    }, 100);
}

function lock(userId) {
    timeoutStatus = true;

    firebase.database().ref('users/' + userId).update({
        timeout_active: timeoutStatus
    });

    if (loginStatus) {
        timeoutModal.style.display = "block";
        
        timeoutTimer.start({countdown: true, startValues: {seconds: 60}});
        $('#timeoutTimer .values').html("You can draw in: " + timeoutTimer.getTimeValues().toString());
        timeoutTimer.addEventListener('secondsUpdated', function (e) {
            $('#timeoutTimer .values').html("You can draw in: " + timeoutTimer.getTimeValues().toString());
        });
        timeoutTimer.addEventListener('targetAchieved', function (e) {
            $('#timeoutTimer .values').html("");
            unlock(userId);
        });
    }
}

function isUserEqual(googleUser, firebaseUser) {
    if (firebaseUser) {
        var providerData = firebaseUser.providerData;
        for (var i = 0; i < providerData.length; i++) {
            if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                    providerData[i].uid === googleUser.getBasicProfile().getId()) {
                // We don't need to reauth the Firebase connection.
                return true;
            }
        }
    }
    return false;
}

var onFailure = function (error) {
    error.style.display = "block";
};

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    $(".collapse").collapse("hide");
    $('#drawingTimer').hide();
    auth2.signOut().then(function () {
        loginStatus = false;
        console.log('User signed out.');
    });
}

close.onclick = function () {
    modal.style.display = "none";
};

function writeUserData(userId, name, email, imageUrl, timeout) {
    firebase.database().ref('users/' + userId).set({
        username: name,
        email: email,
        profile_picture: imageUrl,
        timeout_active: timeout
    });
}

$("#canvas").mousedown(function (e) {
    mouseOn = true;
    var x = e.pageX - $(this).offset().left;
    var y = parseInt(e.pageY - $(this).offset().top);

    if (!loginStatus) {
        modal.style.display = "block";
    } else if (loginStatus === undefined && !timeoutStatus || loginStatus && !timeoutStatus || loginStatus !== undefined && timeoutStatus !== undefined) {
        tempDrawing.push(x, y);
    }
});

$("#canvas").mousemove(function (e) {
    var x = e.pageX - $(this).offset().left;
    var y = parseInt(e.pageY - $(this).offset().top);

    if (mouseOn) {
        if (returnTool() === "line") {

        } else {
            if (loginStatus === undefined && !timeoutStatus || loginStatus && !timeoutStatus || loginStatus !== undefined && timeoutStatus !== undefined) {
                tempDrawing.push(x, y);
            }
        }
    }
});

$("#canvas").mouseup(function (e) {
    var x = e.pageX - $(this).offset().left;
    var y = parseInt(e.pageY - $(this).offset().top);
    var width;
    var tool = returnTool();
    if ($("#select-width").val() === null || $("#select-width").val() === "") {
        width = 1;
    } else {
        width = $("#select-width").val();
    }

    if (loginStatus === undefined && !timeoutStatus || loginStatus && !timeoutStatus || loginStatus !== undefined && timeoutStatus !== undefined) {
        tempDrawing.push(x, y);

        drawingRef.push({
            tool: tool,
            points: tempDrawing,
            color: hex,
            width: width
        });
    }
    mouseOn = false;
    tempDrawing = [];
});

$("#canvas").mouseleave(function (e) {
    var x = e.pageX - $(this).offset().left;
    var y = parseInt(e.pageY - $(this).offset().top);
    var width;
    var tool = returnTool();
    if ($("#select-width").val() === null || $("#select-width").val() === "") {
        width = 1;
    } else {
        width = $("#select-width").val();
    }
    if (mouseOn) {
        if (loginStatus === undefined && !timeoutStatus || loginStatus && !timeoutStatus || loginStatus !== undefined && timeoutStatus !== undefined) {
            tempDrawing.push(x, y);

            drawingRef.push({
                tool: tool,
                points: tempDrawing,
                color: hex,
                width: width
            });
        }
        mouseOn = false;
        tempDrawing = [];
    }
});

function readCanvas() {
    drawingRef.once('value', gotData, errData);
}

var canvas = document.getElementById("canvas");
var canvas_context = canvas.getContext("2d");

function gotData(data) {
    if (!data.hasChildren()) {

    } else {
        //console.log(data.val());
        var drawings = data.val();
        var keys = Object.keys(drawings);
        //console.log(keys);

        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            var tool = drawings[k].tool;
            var color = drawings[k].color;
            var width = drawings[k].width;
            var points = drawings[k].points;

            renderDrawings(tool, color, width, points);
        }
    }
}

function renderDrawings(tool, color, width, points) {
    var prevX, prevY;

    canvas_context.beginPath();
    canvas_context.strokeStyle = color;
    canvas_context.fillStyle = color;
    canvas_context.lineWidth = width;
    canvas_context.lineJoin = "round";
    for (var j = 0; j < points.length; j += 2) {
        var x = points[j];
        var y = points[j + 1];

        switch (tool) {
            case "line":
            case "brush":

                canvas_context.moveTo(prevX, prevY);
                canvas_context.lineTo(x, y);
                prevX = x;
                prevY = y;

                canvas_context.closePath();
                canvas_context.stroke();
                canvas_context.fill();
                break;
            case "rect":
                canvas_context.beginPath();
                canvas_context.lineWidth = width * 1.75;
                canvas_context.rect(x, y, 10, 10);

                canvas_context.closePath();
                canvas_context.stroke();
                canvas_context.fill();
                break;
            case "circle":
                canvas_context.arc(x, y, 10, 0, 2 * Math.PI);
                canvas_context.stroke();
                break;
        }
    }
}

//Sync Firebase Drawing List Changes
drawingRef.limitToLast(1).on('child_added', function (data) {
    var prevX, prevY;

    var newDrawing = data.val();
    var tool = newDrawing.tool;
    var color = newDrawing.color;
    var width = newDrawing.width;
    var points = newDrawing.points;

    canvas_context.beginPath();
    canvas_context.strokeStyle = color;
    canvas_context.fillStyle = color;
    canvas_context.lineWidth = width;
    canvas_context.lineJoin = "round";

    for (var j = 0; j < points.length; j += 2) {
        var x = points[j];
        var y = points[j + 1];

        switch (tool) {
            case "line":
            case "brush":
                canvas_context.moveTo(prevX, prevY);
                canvas_context.lineTo(x, y);
                prevX = x;
                prevY = y;

                canvas_context.closePath();
                canvas_context.stroke();
                canvas_context.fill();
                break;
            case "rect":
                canvas_context.beginPath();
                canvas_context.lineWidth = width * 1.75;
                canvas_context.rect(x, y, 10, 10);

                canvas_context.closePath();
                canvas_context.stroke();
                canvas_context.fill();
                break;
            case "circle":
                canvas_context.arc(x, y, 10, 0, 2 * Math.PI);
                canvas_context.stroke();
                break;
        }
    }
});

function errData(err) {
    console.log(err);
}
