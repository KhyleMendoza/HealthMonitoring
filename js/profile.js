const firebaseConfig = {
    apiKey: "AIzaSyCaccr-PTPUKM8ohFgYsbM9aDmP2ffafmc",
    authDomain: "health-monitoring-ad75d.firebaseapp.com",
    projectId: "health-monitoring-ad75d",
    storageBucket: "health-monitoring-ad75d.appspot.com",
    messagingSenderId: "424960953670",
    appId: "1:424960953670:web:563639c4f44f59f0e9e947",
    measurementId: "G-0VS5DNPEWY"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const database = firebase.database();

document.addEventListener("DOMContentLoaded", function () {

    auth.onAuthStateChanged(function (user) {
        if (user) {
            console.log("Current user:", user);
            updateRecordDropdown(user.uid);
        } else {
            console.log("No user is currently authenticated.");
            window.location.href = 'index.html';
        }
    });
});

function logout() {
    firebase.auth().signOut().then(function () {
        window.location.href = '../index.html';
    }).catch(function (error) {
        window.location.href = '../index.html';
    });
}

function calculateBMI() {
    const height = document.getElementById("height").value;
    const weight = document.getElementById("weight").value;


    if (height && weight) {
        const bmi = (weight / ((height / 100) ** 2)).toFixed(1);

        document.getElementById("bmi").value = bmi;
    } else {
        alert("Please provide both height and weight to calculate BMI.");
    }
}

function generateRecordId(currentCount) {
    const paddedCount = String(currentCount).padStart(4, '0');
    return paddedCount;
}


function submitForm(e) {
    e.preventDefault();
    calculateBMI();

    const user = auth.currentUser;

    if (!user) {
        console.error("No user is currently authenticated.");
        return;
    }

    const countRef = database.ref('HealthRecordCount');
    countRef.transaction((currentCount) => {
        return (currentCount || 0) + 1;
    }, (error, committed, snapshot) => {
        if (error) {
            console.error("Transaction failed abnormally:", error);
        } else if (!committed) {
            console.log("Transaction aborted (count is null).");
        } else {
            const currentCount = snapshot.val();

            var now = new Date();
            var date = moment(now).format('YYYY-MM-DD');

            const healthData = {
                userid: user.uid,
                date: date,
                fullname: document.getElementById('fullName').value,
                age: document.getElementById('age').value,
                gender: document.getElementById('gender').value,
                height: document.getElementById('height').value,
                weight: document.getElementById('weight').value,
                bloodpressure: document.getElementById('bloodpressure').value,
                heartrate: document.getElementById('heartrate').value,
                exercise: document.getElementById('exercise').value,
                bmi: document.getElementById('bmi').value,
            };

            const recordId = generateRecordId(currentCount);

            const healthRecordRef = database.ref('HealthRecord/' + recordId);

            healthRecordRef.set(healthData)
                .then(() => {

                    updateRecordDropdown(user.uid);

                    const databaseRef = database.ref();

                    const recordData = {
                        recordId: recordId,
                        date: firebase.database.ServerValue.TIMESTAMP
                    };

                    databaseRef.child('patient/' + user.uid + '/record/' + recordId).update(recordData)
                        .then(() => {
                            document.getElementById('fullName').value = "";
                            document.getElementById('age').value = "";
                            document.getElementById('gender').value = "";
                            document.getElementById('height').value = "";
                            document.getElementById('weight').value = "";
                            document.getElementById('bloodpressure').value = "";
                            document.getElementById('heartrate').value = "";
                            document.getElementById('exercise').value = "";
                            document.getElementById('bmi').value = "";
                            alert("Added Record Successfully!");
                        })
                        .catch((error) => {
                            console.error("Error updating patient's records:", error);
                        });
                })
                .catch((error) => {
                    console.error("Error saving health data to Firebase:", error);
                });
        }
    });
}

function updateRecordDropdown(userId) {
    const selectElement = document.getElementById("recordSelect");
    selectElement.innerHTML = "";

    const blankOption = document.createElement("option");
    blankOption.value = "";
    blankOption.disabled = true;
    blankOption.selected = true;
    blankOption.text = "Select a Record";
    selectElement.appendChild(blankOption);

    const recordsRef = database.ref('patient/' + userId + '/record');
    recordsRef.once('value')
        .then((snapshot) => {
            const recordsData = snapshot.val();

            if (recordsData) {

                Object.keys(recordsData).forEach((recordId) => {
                    const option = document.createElement("option");
                    option.value = recordId;
                    option.text = "Result " + recordId;
                    selectElement.appendChild(option);
                });
            } else {
                console.log("No records Data found.");
            }
        })
        .catch((error) => {
            console.error("Error fetching record IDs from Firebase:", error);
        });
}

function displayResult() {
    const selectedRecordId = document.getElementById("recordSelect").value;
    console.log("Selected Record ID:", selectedRecordId);

    const healthRecordRef = database.ref('HealthRecord/' + selectedRecordId);

    healthRecordRef.once('value')
        .then((snapshot) => {
            const healthData = snapshot.val();

            let bmiCategory = "";
            if (healthData.bmi < 18.5) {
                bmiCategory = "Underweight";
            } else if (healthData.bmi >= 18.5 && healthData.bmi <= 24.9) {
                bmiCategory = "Normal";
            } else if (healthData.bmi >= 25 && healthData.bmi <= 29.9) {
                bmiCategory = "Overweight";
            } else {
                bmiCategory = "Obese";
            }

            let heartRateCategory = "";
            const heartRate = parseInt(healthData.heartrate);
            if (heartRate < 60) {
                heartRateCategory = "Slow";
            } else if (heartRate >= 60 && heartRate <= 100) {
                heartRateCategory = "Normal";
            } else {
                heartRateCategory = "Fast";
            }

            let bloodPressureCategory = "";
            const bloodPressureValues = healthData.bloodpressure.split('/');
            const systolic = parseInt(bloodPressureValues[0]);
            const diastolic = parseInt(bloodPressureValues[1]);

            if (isValidBloodPressure(systolic, diastolic)) {
                if (systolic < 90 && diastolic < 60) {
                    bloodPressureCategory = "Low Blood Pressure";
                } else if (systolic < 120 && diastolic < 80) {
                    bloodPressureCategory = "Normal Blood Pressure";
                } else if (systolic < 140 && diastolic < 90) {
                    bloodPressureCategory = "Pre Hypertension";
                } else {
                    bloodPressureCategory = "High Blood Pressure";
                }
            } else {
                bloodPressureCategory = "Invalid Blood Pressure Values";
            }

            document.getElementById("formResults").innerHTML = `
                <p>Result Date: ${healthData.date}</p>
                <p>Full Name: ${healthData.fullname}</p>
                <p>Age: ${healthData.age}</p>
                <p>Gender: ${healthData.gender}</p>
                <p>Height: ${healthData.height} cm</p>
                <p>Weight: ${healthData.weight} kg</p>
                <p>Blood Pressure: ${healthData.bloodpressure} (${bloodPressureCategory})</p>
                <p>Heart Rate: ${healthData.heartrate} bpm (${heartRateCategory})</p>
                <p>Exercise: ${healthData.exercise}</p>
                <p>BMI: ${healthData.bmi} (${bmiCategory})</p>
            `;
        })
        .catch((error) => {
            console.error(error);
        });
}

function isValidBloodPressure(systolic, diastolic) {
    return !isNaN(systolic) && !isNaN(diastolic) && systolic > 0 && diastolic > 0;
}

document.getElementById('bpp').style.display = 'none';


window.logout = logout;