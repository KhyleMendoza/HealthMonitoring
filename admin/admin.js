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

function logout() {
    firebase.auth().signOut().then(function () {
        window.location.href = '../index.html';
    }).catch(function (error) {
        window.location.href = '../index.html';
    });
}

window.logout = logout;