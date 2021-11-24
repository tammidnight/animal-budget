const update = document.querySelectorAll(".update");
const kind = document.querySelector("#movement");
const category = document.querySelector("#category");

update.forEach((elem) => {
  elem.addEventListener("dblclick", (e) => {
    if (e.target.className == "update kind") {
      elem.innerText = "";
      const select = document.createElement("select");
      const choose = document.createElement("option");
      choose.setAttribute("value", "choose");
      choose.innerText = "Please choose one:";
      select.appendChild(choose);
      const income = document.createElement("option");
      income.setAttribute("value", "Income");
      income.innerText = "Income";
      select.appendChild(income);
      const spending = document.createElement("option");
      spending.setAttribute("value", "Spending");
      spending.innerText = "Spending";
      select.appendChild(spending);
      const saving = document.createElement("option");
      saving.setAttribute("value", "Saving");
      saving.innerText = "Saving";
      select.appendChild(saving);
      const savingSpending = document.createElement("option");
      savingSpending.setAttribute("value", "Saving Spending");
      savingSpending.innerText = "Saving Spending";
      select.appendChild(savingSpending);
      select.setAttribute("name", "kind");
      elem.appendChild(select);
    } else if (e.target.className == "update amount") {
      let data = e.target.innerText;
      elem.innerText = "";
      const input = document.createElement("input");
      input.value = data;
      input.setAttribute("type", "number");
      input.setAttribute("name", "amount");
      input.setAttribute("step", "0.01");
      elem.appendChild(input);
    } else if (e.target.className == "update category") {
      const parent = e.target.parentElement;
      if (parent.children[0].innerText === "Spending") {
        elem.innerText = "";
        const select = document.createElement("select");
        const choose = document.createElement("option");
        choose.setAttribute("value", "choose");
        choose.innerText = "Please choose one:";
        select.appendChild(choose);
        const income = document.createElement("option");
        income.setAttribute("value", "Income");
        income.innerText = "Income";
        select.appendChild(income);
        const saving = document.createElement("option");
        saving.setAttribute("value", "Saving");
        saving.innerText = "Saving";
        select.appendChild(saving);
        const transportation = document.createElement("option");
        transportation.setAttribute("value", "Transportation");
        transportation.innerText = "Transportation";
        select.appendChild(transportation);
        const food = document.createElement("option");
        food.setAttribute("value", "Food");
        food.innerText = "Food";
        select.appendChild(food);
        const pet = document.createElement("option");
        pet.setAttribute("value", "Pet");
        pet.innerText = "Pet";
        select.appendChild(pet);
        const leisure = document.createElement("option");
        leisure.setAttribute("value", "Leisure");
        leisure.innerText = "Leisure";
        select.appendChild(leisure);
        const present = document.createElement("option");
        present.setAttribute("value", "Present");
        present.innerText = "Present";
        select.appendChild(present);
        const other = document.createElement("option");
        other.setAttribute("value", "Other");
        other.innerText = "Other";
        select.appendChild(other);
        select.setAttribute("name", "category");
        elem.appendChild(select);
      }
    } else if (e.target.className == "update date") {
      let data = e.target.innerText;
      const day = data.slice(0, 2);
      const month = data.slice(3, 5);
      const year = data.slice(6);
      data = year + "-" + month + "-" + day;
      elem.innerText = "";
      const input = document.createElement("input");
      input.value = data;
      input.setAttribute("type", "date");
      input.setAttribute("name", "date");
      elem.appendChild(input);
    }
  });
});

update.forEach((elem) => {
  elem.addEventListener("keyup", (e) => {
    const _id = elem.parentElement.className;
    if (e.key == "Enter") {
      if (e.target.name == "amount") {
        if (e.target.value == "") {
          alert("Field cannot be empty");
          return;
        }
        const data = Number(e.target.value).toFixed(2);
        elem.innerHTML = `<td class='update kind'>${data}</td>`;
        const amount = elem.innerText;
        axios.post(`/movement/${_id}`, { _id, amount }).then(() => {
          location.reload();
        });
      } else if (e.target.name == "date") {
        if (e.target.value == "") {
          alert("Field cannot be empty");
          return;
        }
        const date = e.target.value;
        let data = date;
        const day = data.slice(8);
        const month = data.slice(5, 7);
        const year = data.slice(0, 4);
        data = day + "/" + month + "/" + year;
        elem.innerHTML = `<td class='update date'>${data}</td>`;
        axios.post(`/movement/${_id}`, { _id, date }).then(() => {
          location.reload();
        });
      }
    }
  });
});

update.forEach((elem) => {
  elem.addEventListener("change", (e) => {
    const _id = elem.parentElement.className;
    if (e.target.name == "kind") {
      const data = e.target.value;
      elem.innerHTML = `<td class='update kind'>${data}</td>`;
      const kind = elem.innerText;
      axios.post(`/movement/${_id}`, { _id, kind }).then(() => {
        location.reload();
      });
    } else if (e.target.name == "category") {
      const data = e.target.value;
      elem.innerHTML = `<td class='update category'>${data}</td>`;
      const category = elem.innerText;
      axios.post(`/movement/${_id}`, { _id, category }).then(() => {
        location.reload();
      });
    }
  });
});

category.addEventListener("click", (e) => {
  if (kind.value === "Income") {
    category.innerHTML =
      '<select id="category" name="category" class="movementInputField"> <option value="Income">Income</option> </select>';
  } else if (kind.value === "Saving" || kind.value === "Saving Spending") {
    category.innerHTML =
      '<select id="category" name="category" class="movementInputField"> <option value="Saving">Saving</option> </select>';
  } else if (kind.value === "Spending") {
    category.innerHTML =
      ' <select id="category" name="category" class="movementInputField"> <option value="Income">Income</option><option value="Saving">Saving</option><option value="Transportation">Transportation</option><option value="Food">Food</option><option value="Pet">Pet</option><option value="Leisure">Leisure</option><option value="Present">Present</option><option value="Other">Other</option></select>';
  }
});
