// =======================================================================
// YOUR FIREBASE CONFIGURATION
// =======================================================================
const firebaseConfig = {
    apiKey: "AIzaSyDDVWWClc0KyDeHjHJ0gzw84rER_Ddqz70",
    authDomain: "fir-8c51f.firebaseapp.com",
    projectId: "fir-8c51f",
    storageBucket: "fir-8c51f.firebasestorage.app",
    messagingSenderId: "99752081359",
    appId: "1:99752081359:web:6fc1bdfef19e68dbbe84ba"
};

// 1. Initialize Firebase Services
const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();

// 2. Initialize Google Provider (needed for the Google sign-in button)
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Define the URL for redirection (the current page)
const REDIRECT_URL = window.location.href.split('?')[0]; 


// --- A. FUNCTIONS TO HANDLE AUTHENTICATION ---

// **NEW FUNCTION:** Sign in with Google using a pop-up window
function signInWithGoogle() {
    const messageElement = document.getElementById('auth-message');
    
    auth.signInWithPopup(googleProvider)
        .then((result) => {
            // Signed-in user info is in result.user
            messageElement.textContent = 'Google Sign-in successful!';
            messageElement.style.color = 'green';
            // The onAuthStateChanged listener handles the rest (showing home section)
        })
        .catch((error) => {
            // Handle Errors here (e.g., if the user closes the pop-up)
            messageElement.textContent = `Google Sign-in Error: ${error.message}`;
            messageElement.style.color = 'red';
            console.error(error);
        });
}


// 1. Send the Email Link (Existing Logic)
function sendAuthLink() {
    const email = document.getElementById('email-input').value;
    const messageElement = document.getElementById('auth-message');

    if (!email) {
        messageElement.textContent = 'Please enter a valid email.';
        messageElement.style.color = 'red';
        return;
    }

    const actionCodeSettings = {
      url: REDIRECT_URL, 
      handleCodeInApp: true,
    };

    auth.sendSignInLinkToEmail(email, actionCodeSettings)
      .then(() => {
        window.localStorage.setItem('emailForSignIn', email);
        messageElement.textContent = `SUCCESS! A secure login link has been sent to ${email}. Please check your email!`;
        messageElement.style.color = 'green';
      })
      .catch((error) => {
        messageElement.textContent = `Error sending link: ${error.message}`;
        messageElement.style.color = 'red';
      });
}

// 2. Complete the Sign-in when redirected (Existing Logic)
function handleSignIn() {
    if (auth.isSignInWithEmailLink(window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');

        if (!email) {
            email = window.prompt('Please provide your email to complete sign-in:');
        }

        if (!email) {
            document.getElementById('auth-message').textContent = 'Email is required to complete sign-in.';
            return;
        }

        auth.signInWithEmailLink(email, window.location.href)
            .then(() => {
                window.localStorage.removeItem('emailForSignIn');
                window.history.replaceState({}, document.title, REDIRECT_URL);
            })
            .catch((error) => {
                document.getElementById('auth-message').textContent = `Sign-in Error: The link is invalid or expired. Please request a new one.`;
                document.getElementById('auth-message').style.color = 'red';
                window.localStorage.removeItem('emailForSignIn');
            });
    }
}

// 3. Handle Sign Out (Existing Logic)
function signOutUser() {
    auth.signOut().catch((error) => {
        console.error("Sign Out Error", error);
    });
}


// --- B. AUTH STATE OBSERVER (Handles View Switching) ---

auth.onAuthStateChanged((user) => {
    const authSection = document.getElementById('auth-section');
    const homeSection = document.getElementById('home-section');

    if (user) {
        // User is logged in! SHOW HOME SECTION
        authSection.classList.add('hidden');
        homeSection.classList.remove('hidden');

        // Note: For Google sign-in, user.displayName will be populated!
        document.getElementById('welcome-message').textContent = `Welcome, ${user.displayName || user.email || 'User'}!`;
        
        // Display all account details
        const details = {
            'User ID (UID)': user.uid,
            'Email': user.email,
            'Display Name': user.displayName,
            'Login Method': user.providerData[0] ? user.providerData[0].providerId : 'Email Link',
            'Creation Time': user.metadata.creationTime,
            'Last Sign In Time': user.metadata.lastSignInTime,
        };
        
        document.getElementById('user-details-output').textContent = JSON.stringify(details, null, 2);
    } else {
        // User is logged out. SHOW LOGIN SECTION
        authSection.classList.remove('hidden');
        homeSection.classList.add('hidden');
        document.getElementById('auth-message').textContent = 'Ready to sign in or sign up.'; 
        document.getElementById('auth-message').style.color = 'black';
    }
});


// --- C. RUN ON PAGE LOAD ---

handleSignIn();
