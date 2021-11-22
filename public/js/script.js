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
      let data = e.target.innerText;
      elem.innerText = "";
      const input = document.createElement("input");
      input.value = data;
      input.setAttribute("type", "number");
      input.setAttribute("name", "amount");
      input.setAttribute("step", "0.01");
      elem.appendChild(input);
    } else if (e.target.className == "update category") {
      let data = e.target.innerText;
      elem.innerText = "";
      const input = document.createElement("input");
      input.value = data;
      input.setAttribute("name", "category");
      elem.appendChild(input);
    } else if (e.target.className == "update date") {
      let data = e.target.innerText;
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
        let data = Number(e.target.value).toFixed(2);
        elem.innerHTML = `<td class='update kind'>${data}</td>`;
        const amount = elem.innerText;
        axios.post(`/movement/${_id}`, { _id, amount }).then(() => {
          location.reload();
        });
      } else if (e.target.name == "category") {
        if (e.target.value == "") {
          alert("Field cannot be empty");
          return;
        }
        let data = e.target.value;
        elem.innerHTML = `<td class='update category'>${data}</td>`;
        const category = elem.innerText;
        axios.post(`/movement/${_id}`, { _id, category });
      } else if (e.target.name == "date") {
        if (e.target.value == "") {
          alert("Field cannot be empty");
          return;
        }
        let data = e.target.value;
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
      let data = e.target.value;
      elem.innerHTML = `<td class='update kind'>${data}</td>`;
      const kind = elem.innerText;
      axios.post(`/movement/${_id}`, { _id, kind });
    }
  });
});
