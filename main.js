import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlsB8OD3j8fcChrAqfFr3Sa9nWLa1kKV8",
  authDomain: "lms-novaforge-147147.firebaseapp.com",
  projectId: "lms-novaforge-147147",
  storageBucket: "lms-novaforge-147147.firebasestorage.app",
  messagingSenderId: "933736096520",
  appId: "1:933736096520:web:230765d537372eec9742bd",
  measurementId: "G-0MQT1H5LJN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const userForm = document.getElementById("user-form");
const otpForm = document.getElementById("otp-form");
const successMessage = document.getElementById("success-message");
const nameInput = document.getElementById("name");
const phoneNumberInput = document.getElementById("phoneNumber");
const otpInput = document.getElementById("otp");
const sendOtpButton = document.getElementById("sendOtpButton");
const verifyOtpButton = document.getElementById("verifyOtpButton");
const resendOtpButton = document.getElementById("resendOtpButton");
const copyButton = document.getElementById("copyButton");
const goToQuizButton = document.getElementById("goToQuizButton");
const clipboardSuccess = document.getElementById("clipboard-success");
const errorMessage = document.getElementById("error-message");

let recaptchaVerifier;
let confirmationResult;
let isCooldown = false;

window.onload = () => {
  recaptchaVerifier = new RecaptchaVerifier(
    "recaptcha-container",
    {
      size: "normal",
      callback: () => {
        sendOtpButton.disabled = false;
      },
    },
    auth
  );
  recaptchaVerifier.render().catch((error) => {
    console.error("reCAPTCHA initialization failed:", error);
  });
};

// Send OTP Handler
sendOtpButton.addEventListener("click", async () => {
  if (isCooldown) return;

  const name = nameInput.value.trim();
  let phoneNumber = phoneNumberInput.value.trim();

  if (!name || !phoneNumber) {
    showError("Please enter both your name and phone number.");
    return;
  }

  if (!phoneNumber.startsWith("+91")) {
    phoneNumber = `+91${phoneNumber}`;
  }

  try {
    confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier
    );
    window.confirmationResult = confirmationResult;

    userForm.classList.add("hidden");
    otpForm.classList.remove("hidden");
    startCooldown();
    clearError();
  } catch (error) {
    showError(`Error sending OTP: ${error.message}`);
  }
});

// Verify OTP Handler
verifyOtpButton.addEventListener("click", async () => {
  const otp = otpInput.value.trim();

  if (!otp) {
    showError("Please enter the 6-digit OTP.");
    return;
  }

  try {
    const result = await confirmationResult.confirm(otp);
    const user = result.user;

    const password = generateRandomPassword(8);

    otpForm.classList.add("hidden");
    successMessage.classList.remove("hidden");
    successMessage.innerHTML = `
      Welcome, <strong>${nameInput.value}</strong>!<br>
      Username: <strong>${user.phoneNumber}</strong><br>
      Password: <strong>${password}</strong>
    `;

    copyButton.classList.remove("hidden");
    goToQuizButton.classList.remove("hidden");

    copyButton.addEventListener("click", () => {
      copyToClipboard(`Username: ${user.phoneNumber}\nPassword: ${password}`);
    });

   

    clearError();
  } catch (error) {
    showError("Invalid OTP. Please try again.");
    resendOtpButton.classList.remove("hidden");
  }
});

// Resend OTP Handler
resendOtpButton.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  let phoneNumber = phoneNumberInput.value.trim();

  if (!name || !phoneNumber) {
    showError("Please enter both your name and phone number.");
    return;
  }

  if (!phoneNumber.startsWith("+91")) {
    phoneNumber = `+91${phoneNumber}`;
  }

  try {
    confirmationResult = null;

    otpForm.classList.add("hidden");
    userForm.classList.remove("hidden");
    otpInput.value = "";
    resendOtpButton.classList.add("hidden");
    clearError();

    confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier
    );
    window.confirmationResult = confirmationResult;
    startCooldown();
  } catch (error) {
    showError(`Error resending OTP: ${error.message}`);
  }
});

// Helper Functions
function generateRandomPassword(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(
    () => {
      showClipboardSuccess("Copied to clipboard successfully!");
    },
    () => {
      showClipboardSuccess("Failed to copy. Try again.");
    }
  );
}

function showClipboardSuccess(message) {
  clipboardSuccess.innerText = message;
  clipboardSuccess.classList.remove("hidden");
  setTimeout(() => clipboardSuccess.classList.add("hidden"), 3000);
}

function showError(message) {
  errorMessage.innerText = message;
  errorMessage.classList.remove("hidden");
}

function clearError() {
  errorMessage.innerText = "";
  errorMessage.classList.add("hidden");
}

function startCooldown() {
  isCooldown = true;
  sendOtpButton.disabled = true;
  sendOtpButton.innerText = "Wait 30 seconds...";

  let countdown = 30;
  const interval = setInterval(() => {
    countdown -= 1;
    sendOtpButton.innerText = `Wait ${countdown} seconds...`;
    if (countdown <= 0) {
      clearInterval(interval);
      isCooldown = false;
      sendOtpButton.disabled = false;
      sendOtpButton.innerText = "Send OTP";
    }
  }, 1000);
}
