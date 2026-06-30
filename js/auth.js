import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* ── Password strength: min 8 chars, at least one number ── */
function isStrongPassword(pw) {
  return pw.length >= 8 && /\d/.test(pw);
}

/* ── Friendly Firebase error messages ── */
function friendlyError(code) {
  const map = {
    "auth/email-already-in-use":    "This email is already registered.",
    "auth/invalid-email":           "Please enter a valid email address.",
    "auth/weak-password":           "Password must be at least 8 characters.",
    "auth/user-not-found":          "No account found with this email.",
    "auth/wrong-password":          "Incorrect password. Please try again.",
    "auth/invalid-credential":      "Invalid email or password.",
    "auth/too-many-requests":       "Too many attempts. Please wait a few minutes.",
    "auth/network-request-failed":  "Network error. Check your connection."
  };
  return map[code] || "Something went wrong. Please try again.";
}

/* NOTE: Admin routing is done by checking the email after login.
   For better security in production, use Firebase Custom Claims
   set via Cloud Functions instead of exposing the admin email here. */
const ADMIN_EMAIL = "kodaihillsspot@gmail.com";

const signupBtn = document.getElementById("signupBtn");
const loginBtn  = document.getElementById("loginBtn");
const forgotBtn = document.getElementById("forgotPassword");

/* ═══════════════════════════ SIGNUP ═══════════════════════════ */
signupBtn.onclick = async () => {
  try {
    const name     = document.getElementById("name").value.trim();
    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !password) {
      showPopup("Fields Empty", "Please fill all fields.");
      return;
    }

    /* FIX: Added password strength validation (was missing — only empty check before) */
    if (!isStrongPassword(password)) {
      showPopup("Weak Password", "Password must be at least 8 characters and contain a number.");
      return;
    }

    signupBtn.innerText  = "Creating...";
    signupBtn.disabled   = true;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user           = userCredential.user;

    await setDoc(doc(db, "Users", user.uid), {
      uid:       user.uid,
      name:      name,
      email:     email,
      createdAt: new Date()
    });

    showPopup("Success ✅", "Account created successfully!");
    setTimeout(() => { window.location = "index.html"; }, 1500);

  } catch (error) {
    showPopup("Signup Failed", friendlyError(error.code));
  } finally {
    signupBtn.innerText = "Sign Up";
    signupBtn.disabled  = false;
  }
};

/* ═══════════════════════════ LOGIN ═══════════════════════════ */

/* FIX: Simple login rate-limit — tracks failed attempts in memory
   and blocks for 60s after 5 consecutive failures */
let loginAttempts  = 0;
let loginBlockedAt = 0;

loginBtn.onclick = async () => {
  /* Rate-limit check */
  if (loginAttempts >= 5) {
    const elapsed = Date.now() - loginBlockedAt;
    if (elapsed < 60000) {
      const wait = Math.ceil((60000 - elapsed) / 1000);
      showPopup("Too Many Attempts", `Please wait ${wait} seconds before trying again.`);
      return;
    }
    loginAttempts = 0; // Reset after cooldown
  }

  try {
    const email    = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
      showPopup("Fields Empty", "Please enter email and password.");
      return;
    }

    loginBtn.innerText = "Logging in...";
    loginBtn.disabled  = true;

    await signInWithEmailAndPassword(auth, email, password);

    loginAttempts = 0; // Reset on success

    if (email.trim().toLowerCase() === ADMIN_EMAIL) {
      showPopup("Admin Login ✅", "Admin login successful.");
      setTimeout(() => { window.location = "admin.html"; }, 1500);
    } else {
      showPopup("Login Success ✅", "Welcome back!");
      setTimeout(() => { window.location = "index.html"; }, 1500);
    }

  } catch (error) {
    loginAttempts++;
    if (loginAttempts >= 5) loginBlockedAt = Date.now();
    showPopup("Login Failed", friendlyError(error.code));
  } finally {
    loginBtn.innerText = "Login";
    loginBtn.disabled  = false;
  }
};

/* ═══════════════════════════ FORGOT PASSWORD ═══════════════════════════ */

/* Open popup — pre-fill email if already typed in login field */
forgotBtn.onclick = () => {
  const loginEmail = document.getElementById("loginEmail").value.trim();
  document.getElementById("resetEmail").value = loginEmail;
  document.getElementById("resetPopup").style.display = "flex";
};

/* Close popup */
window.closeResetPopup = () => {
  document.getElementById("resetPopup").style.display = "none";
};

/* Send reset link */
document.getElementById("sendResetBtn").onclick = async () => {
  const btn   = document.getElementById("sendResetBtn");
  const email = document.getElementById("resetEmail").value.trim();

  if (!email) {
    showPopup("Email Required", "Please enter your email address.");
    return;
  }

  try {
    btn.innerText = "Sending...";
    btn.disabled  = true;

    await sendPasswordResetEmail(auth, email);

    closeResetPopup();
    showPopup("Reset Link Sent ✅",
      "Password reset link sent to your email.\nPlease check your Inbox and Spam folder.");

  } catch (error) {
    showPopup("Reset Failed", friendlyError(error.code));
  } finally {
    btn.innerText = "Send Link";
    btn.disabled  = false;
  }
};
