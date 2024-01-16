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

  function register(e) {
    e.preventDefault();

    const fullname = document.getElementById('full-name').value;
    const birthdate = document.getElementById('birthdate').value;
    const age = document.getElementById('age').value;
    const sex = document.getElementById('sex').value;
    const address = document.getElementById('address').value;
    const contact = document.getElementById('contact').value;
    const institute = document.getElementById('institute').value;
    const studnum = document.getElementById('studnum').value;
    const program = document.getElementById('program').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!fullname || !birthdate || !age || !sex || !address || !contact || !institute || !studnum || !program || !email || !password) {
        alert("Fill in all inputs");
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then(function (userCredential) {
            const user = userCredential.user;

            const userData = {
                fullname: fullname,
                birthdate: birthdate,
                age: age,
                sex: sex,
                address: address,
                contact: contact,
                institute: institute,
                studnum: studnum,
                program: program,
                email: email,
                password: password
            };

            const databaseRef = database.ref();
            databaseRef.child('patient/' + user.uid).set(userData)
                .then(function () {
                    alert("Account Created Successfully!");
                    window.location.href = 'login.html';
                });
        })
        .catch(function (error) {
            alert(error.message);
        });
}

  function login(e) {
    e.preventDefault()
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
      alert("Fill in all inputs!")
    }

    auth.signInWithEmailAndPassword(email, password)
    .then(function (userCredential) {
      window.location.href = 'profile.html';
    })
    .catch(function (error) {
        alert("Incorrect Password or Email!");
    });
  }