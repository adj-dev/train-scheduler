/*
FIREBASE SET-UP AND CONFIG
*/

// Configuration settings for Firebase
var firebaseConfig = {
  apiKey: "AIzaSyDSimHBXQdwog6DHsSVsN4hfHl-GmNyyhw",
  authDomain: "coding-bootcamp-mn.firebaseapp.com",
  databaseURL: "https://coding-bootcamp-mn.firebaseio.com",
  projectId: "coding-bootcamp-mn",
  storageBucket: "coding-bootcamp-mn.appspot.com",
  messagingSenderId: "444761719741",
  appId: "1:444761719741:web:cf5e746d1c110d48"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Access database
const database = firebase.database();

/*
DECLARE AND DEFINE GLOBAL FUNCTIONS
*/

// Convert 24 hour time to 12-hour time
function convertTime(t) {
  let timeArray = t.split(':');
  let convertedTime = '';

  if (timeArray[0] > 12) {
    timeArray[0] -= 12;
    convertedTime = `${timeArray.join(':')}pm`;
  } else if (timeArray[0].startsWith('0')) {
    convertedTime = `${timeArray.join(':')}am`;
    return convertedTime.slice(1);
  } else if (timeArray[0] === '12') {
    convertedTime = `${timeArray.join(':')}pm`;
  } else {
    convertedTime = `${timeArray.join(':')}am`;
  }

  return convertedTime;
};


// Convert train object to "html"
function convertToHTML(trainObj) {
  // Capture properties via object destructuring
  let { trainName, destination, frequency, firstTrainTime } = trainObj;

  // Calculate "next arrival" and "time until departure"
  let { nextTrain, minutesAway } = calculateTime(firstTrainTime, frequency);

  // Convert 24-hour time to 12-hour
  nextTrain = convertTime(nextTrain);

  return $(`<tr><td>${trainName}</td><td>${destination}</td><td>${frequency}</td><td>${nextTrain}</td><td>${minutesAway} minutes</td></tr>`);
};

// Take the "initial departure time" and "frequency" and return the 
// "next arrival time" and "time until arrival"
function calculateTime(initial, frequency) {
  let initialTime = moment(initial, 'HH:mm').subtract(1, 'years');
  let timeDiff = moment().diff(initialTime, 'minutes');
  let remainder = timeDiff % frequency;
  let minutesAway = frequency - remainder;
  let nextTrain = moment().add(minutesAway, "minutes").format('HH:mm');

  return { nextTrain, minutesAway };
};

// Perform basic form validation
function formValidation(input) {
  // Collect input data via object destructuring
  let { trainName, destination, firstTrainTime, frequency } = input;

  // Check for empty train input
  if (trainName === '') {
    $('#name').addClass('error');
    $('#train-name').attr('placeholder', 'Please enter a train name');
    return false;
  }

  // Removes error class if input is corrected
  if (trainName !== '') {
    $('#name').removeClass('error');
  }

  // Check for empty destination input
  if (destination === '') {
    $('#dest').addClass('error');
    $('#destination').attr('placeholder', 'Please enter a destination');
    return false;
  }

  // Removes error class if input is corrected
  if (destination !== '') {
    $('#dest').removeClass('error');
  }

  // Check for valid 24-hour time via RegEx
  if (!firstTrainTime.match(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/gm)) {
    $('#time').addClass('error');
    $('#first-train-time').attr('placeholder', 'Please enter a valid initial train time');
    return false;
  }

  // Removes error class if input is corrected
  if (firstTrainTime.match(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/gm)) {
    $('#time').removeClass('error');
  }

  // Check for valid frequency via ensuring entry is a number
  // I acknowledge that an unrealistic value could make it through
  // but I'll save that task for a rainy day. 
  if (!parseInt(frequency)) {
    $('#freq').addClass('error');
    $('#frequency').attr('placeholder', 'Please enter a frequency');
    return false;
  }

  // Removes error class if input is corrected
  if (parseInt(frequency)) {
    $('#freq').removeClass('error');
  }

  // If form is valid return true and get the ball rollin'
  return true;
};

/*
SET-UP EVENT LISTENERS

The callback functions on the event listeners are what
sets everything in m~o~t~i~o~n. 

Once a user clicks on the "submit"
button all input values are captured and sent to Firebase as a 
new child of the root directory. 

Then, as if conjured by a wizard, the .on() method attached to 
the database object is cast and the chain reaction of function
calls ensues. Awesomely, this particular callback runs once
for every child in the root directory when the app is initialized. 
This results in all stored data being rendered onto the DOM when 
the application is initially loaded, and afterwards calling 
only once for each new child.
*/

// Form submit handler
$(document).on('click', '#submit', e => {
  e.preventDefault();

  // Capture input values
  let trainName = $('#train-name').val();
  let destination = $('#destination').val();
  let firstTrainTime = $('#first-train-time').val();
  let frequency = $('#frequency').val();

  const trainData = {
    trainName,
    destination,
    firstTrainTime,
    frequency
  };

  let validated = formValidation(trainData);

  // Send values to Firebase
  if (validated) {
    database.ref().push(trainData);
  }
});


// Set event listener for new entries on database ( wizard stuff )
database.ref().on('child_added', snapshot => {
  // Hide the "Add a train to schedule it..." message once a train is scheduled
  $('#add-train').css('display', 'none');
  // Append train data to table
  $('#train-data').append(convertToHTML(snapshot.val()));
}, error => {
  if (error) {
    console.log(error);
  }
});
