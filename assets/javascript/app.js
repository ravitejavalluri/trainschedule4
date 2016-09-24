$(document).ready(function(){
// Initialize Firebase
var config = {
    apiKey: "AIzaSyBLw6ftPn541RzpgLFZMfvi0HXAq5QrCZw",
    authDomain: "train-schedule-ed1ea.firebaseapp.com",
    databaseURL: "https://train-schedule-ed1ea.firebaseio.com",
    storageBucket: "",
    messagingSenderId: "44826566717"
  };
firebase.initializeApp(config);

var database = firebase.database();
// variables 

var tName = "";
var tDestination = "";
var tTime = "";
var tFrequency = 0;
var arrival = "";
var minutes = 0;
var trainCount = 1;
var logged = false;

//Google sign-in
var provider = new firebase.auth.GoogleAuthProvider();
function login() {
firebase.auth().signInWithPopup(provider).then(function(result) {
  // This gives you a Google Access Token. You can use it to access the Google API.
  var token = result.credential.accessToken;
  // The signed-in user info.
  var user = result.user;
  $('#user-message').text("Welcome, " + user.displayName + "!");
}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;
  // ...
});
};
function logout(){
firebase.auth().signOut().then(function() {
  // Sign-out successful.
}, function(error) {
  console.log(error.code);
});
};

$('#in').on('click', function(){
    login();
    logged = true;
});

$('#out').on('click', function(){
    logout();
    $('#user-message').empty();
    logged = false;
});

//adding trains to list
$("#addTrain").on("click", function() {
    if (logged == false) {
        alert("Please log-in to add trains");
        tName = $('#traininput').val("");
    	tDestination = $('#destinationinput').val("");
    	tTime = $('#timeinput').val("");
    	tFrequency = $('#frequencyinput').val("");
        return false;
    } else {
    //data stored in variables
    tName = $('#traininput').val().trim();
    tDestination = $('#destinationinput').val().trim();
    tTime = $('#timeinput').val().trim();
    tFrequency = parseInt($('#frequencyinput').val().trim());
    console.log("This is tTime: " + tTime);

    //no blank entries
    if ((!tName) || (!tDestination) || (!tTime) || (!tFrequency)) {
        alert("Please enter in all of the train parameters");
        return false;
    } else {

    // Code for the push
    database.ref().push({
        tName: tName,
        tDestination: tDestination,
        tTime: tTime,
        tFrequency: tFrequency,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    })

    //clear out entries
    tName = $('#traininput').val("");
    tDestination = $('#destinationinput').val("");
    tTime = $('#timeinput').val("");
    tFrequency = $('#frequencyinput').val("");

    return false;
}
}
});

//watches for child added to database
//placing in values of variables
//autoUpdate function updates the page every minute without reloading the page
var autoUpdate = function() {
    $('#trainData > tbody').empty();
  database.ref().on("child_added", function(childSnapshot) {
    tName = childSnapshot.val().tName;
    tDestination = childSnapshot.val().tDestination;
    tTime = childSnapshot.val().tTime;
    tFrequency = childSnapshot.val().tFrequency;
    
    //math to determine arrival time and minutes that the train will arrive
    // present
    var current = moment();
    
    // read that you need to subtract 1 year to make sure it comes before current time
    var trainTime = moment(tTime,"HH:mm").subtract(1, "years");

    // time difference between present and train time in minutes
    var difference = moment().diff(moment(trainTime), "minutes");

    // divide the time difference by the frequency, this number is important in determining when the next train is coming
    var difference2 = difference % tFrequency;

    // minutes for the train to arrive
    var minutes = tFrequency - difference2;

    // time the train arrives
    var arrival = moment().add(minutes, "minutes")

    //checking values
    // console.log("current: " + moment(current).format("HH:mm"));
    // console.log("trainTime: " + trainTime);
    // console.log("difference: " + difference);
    // console.log("difference2: " + difference2);
    // console.log("minutes: " + minutes);
    // console.log("arrival: " + moment(arrival).format("hh:mm A"));


    // appending information to train table
    $('#trainData >tbody').append("<tr><td>" + childSnapshot.val().tName + "</td><td>" + childSnapshot.val().tDestination + "</td><td>" + childSnapshot.val().tFrequency + "</td><td>" + moment(arrival).format("hh:mm A") + "</td><td>" + minutes + "</td></tr>");
// error code
}, function(errorObject){
    console.log("There was an error: " + errorObject.code);
});

};

var interval = 1000 * 60;

setInterval(autoUpdate, interval);

autoUpdate();
});