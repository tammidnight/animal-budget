document.addEventListener(
  "DOMContentLoaded",
  () => {
    console.log("animal-budget JS imported successfully!");
  },
  false
);

const update = document.querySelectorAll(".update");

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
      const data = e.target.innerText;
      elem.innerText = "";
      const input = document.createElement("input");
      input.value = data;
      input.setAttribute("type", "number");
      input.setAttribute("name", "amount");
      input.setAttribute("step", "0.01");
      elem.appendChild(input);
    } else if (e.target.className == "update category") {
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
    } else if (e.target.className == "update date") {
      const data = e.target.innerText;
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
        const data = e.target.value;
        const day = data.slice(0, 2);
        const month = data.slice(5, 6);
        const year = data.slice(0, 4);
        data = day + "/" + month + "/" + year;
        elem.innerHTML = `<td class='update date'>${data}</td>`;
        const date = elem.innerText;
        axios.post(`/movement/${_id}`, { _id, date });
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
      axios.post(`/movement/${_id}`, { _id, kind });
    } else if (e.target.name == "category") {
      const data = e.target.value;
      elem.innerHTML = `<td class='update category'>${data}</td>`;
      const category = elem.innerText;
      axios.post(`/movement/${_id}`, { _id, category });
    }
  });
});
