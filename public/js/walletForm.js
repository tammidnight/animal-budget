const sharedTrue = document.querySelector("#true");
const sharedFalse = document.querySelector("#false");
const sharedUser = document.querySelector(".sharedWalletTrue");

window.addEventListener("load", () => {
  if (sharedTrue.checked) {
    sharedUser.style.display = "flex";
  } else {
    sharedUser.style.display = "none";
  }

  sharedTrue.addEventListener("click", () => {
    sharedUser.style.display = "flex";
  });

  sharedFalse.addEventListener("click", () => {
    sharedUser.style.display = "none";
    sharedUser.innerHTML =
      '<label>Username of the second User*</label> <input type="text" name="sharedWalletUser" placeholder="Please enter the username for sharing" class="walletInputField"/>';
  });
});

var tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});
