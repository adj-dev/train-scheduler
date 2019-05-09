// Configuration settings for Firebase web app
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

const database = firebase.database();

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
}


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
}


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

  // Send values to Firebase
  database.ref().push(trainData);
});


// Set event listener for new entries on database
database.ref().on('child_added', snapshot => {
  $('#train-data').append(convertToHTML(snapshot.val()));
});