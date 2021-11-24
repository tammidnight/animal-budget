const deleteBtn = document.querySelector(".firstDelete");
const cancelBtn = document.querySelector(".cancel");
const confirmDeleting = document.querySelector(".confirmDeleting");

window.addEventListener("load", () => {
  confirmDeleting.style.display = "none";

  deleteBtn.addEventListener("click", () => {
    confirmDeleting.style.display = "flex";
    deleteBtn.style.display = "none";
  });

  cancelBtn.addEventListener("click", () => {
    confirmDeleting.style.display = "none";
    deleteBtn.style.display = "flex";
  });
});
