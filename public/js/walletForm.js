const sharedTrue = document.querySelector("#true");
const sharedFalse = document.querySelector("#false");
const sharedUser = document.querySelector(".sharedWalletTrue");

window.addEventListener("load", () => {
  if (sharedTrue.checked) {
    sharedUser.style.display = "flex";
  }

  sharedUser.style.display = "none";

  sharedTrue.addEventListener("click", () => {
    sharedUser.style.display = "flex";
  });

  sharedFalse.addEventListener("click", () => {
    sharedUser.style.display = "none";
    sharedUser.innerHTML =
      '<label>Username of the second User*</label> <input type="text" name="sharedWalletUser" placeholder="Please enter the username for sharing" class="walletInputField"/>';
  });
});
