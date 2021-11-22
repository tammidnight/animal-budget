const loginBtn = document.querySelector("#loginBtn");
const signupBtn = document.querySelector("#signupBtn");
const signup = document.querySelector("#signup");
const login = document.querySelector("#login");
const needToSignup = document.querySelector("#needToSignup");
const alreadyAccount = document.querySelector("#alreadyAccount");

window.addEventListener("load", () => {
  signup.style.display = "none";
  alreadyAccount.style.display = "none";

  loginBtn.addEventListener("click", () => {
    signup.style.display = "none";
    alreadyAccount.style.display = "none";
    login.style.display = "flex";
    needToSignup.style.display = "flex";
  });

  signupBtn.addEventListener("click", () => {
    signup.style.display = "flex";
    alreadyAccount.style.display = "flex";
    login.style.display = "none";
    needToSignup.style.display = "none";
  });
});
