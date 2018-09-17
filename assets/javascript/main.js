$(document).ready(function () {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyAWOk7JlBX3jb37FECYXXEVVlwWiNRL6eU",
        authDomain: "train-scheduler-a16e5.firebaseapp.com",
        databaseURL: "https://train-scheduler-a16e5.firebaseio.com",
        projectId: "train-scheduler-a16e5",
        storageBucket: "train-scheduler-a16e5.appspot.com",
        messagingSenderId: "288635158964"
    };
    firebase.initializeApp(config);

    let database = firebase.database();

    let existingTrainArr = [];

    database.ref('/trainProfile/').orderByChild('name').once('value').then(function (snap) {
        snap.forEach(function (childSnap) {
            let trainObject = {
                name: "",
                destination: "",
                firstTime: "",
                frequency: ""
            };
            trainObject.name = childSnap.val().name;
            trainObject.destination = childSnap.val().destination;
            trainObject.firstTime = childSnap.val().firstTime;
            trainObject.frequency = childSnap.val().frequency;
            existingTrainArr.push(trainObject);
        });
    });

    document.querySelector(".trainCreateBtn").onclick = function () {
        let newTrain = {
            name: $(".trainNameNew").val(),
            destination: $(".destinationNew").val(),
            firstTime: $(".firstTimeNew").val(),
            frequency: $(".freqNew").val()
        };

          database.ref("/trainProfile/name").once('value', function(snapshot) {
            if (snapshot.hasChild(newTrain.name)) {
                alert("Train already exists!");
                console.log(snapshot);
            }
            else {
                database.ref("/trainProfile").push(newTrain);
            }
        });
    };


    database.ref("/trainProfile").on("child_added", function (snapshot) {
        // Change the HTML to reflect
        let newTrain = {
            name: snapshot.val().name,
            destination: snapshot.val().destination,
            firstTime: snapshot.val().firstTime,
            frequency: snapshot.val().frequency,
        };
        let minutesAway = calculateMinutesAway(newTrain).tMinutesTillTrain;
        let nextTrain = calculateMinutesAway(newTrain).nextTrainTime;

        $(".profileTable > tbody").append("<tr><td>" + newTrain.name + "</td><td>" + newTrain.destination + "</td><td>" + newTrain.frequency + "</td><td>" + nextTrain + "</td><td>" + minutesAway + "</td></tr>")


        // Handle the errors
    }, function (errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });



    function calculateMinutesAway(train) {
        // figure out next train, account for future times
        let firstTimeConverted = moment(train.firstTime, "HH:mm").subtract(1, "years");


        // Current Time, don't actually need at the moment
        let currentTime;
        currentTime = moment(currentTime).format("hh:mm");


        // Find difference between current time and converted time
        let diffTime = moment().diff(moment(firstTimeConverted), "minutes");

        // Time apart (remainder) 
        let tRemainder = diffTime % train.frequency;


        // Minute Until Train
        let tMinutesTillTrain = train.frequency - tRemainder;


        // Next Train
        let nextTrainTime = moment().add(tMinutesTillTrain, "minutes");
        nextTrainTime = moment(nextTrainTime).format("hh:mm");

        return { tMinutesTillTrain: tMinutesTillTrain, nextTrainTime: nextTrainTime };

    };
});