// ============ 1. Obtener los elementos del HTML ============
const form = document.getElementById("debt-form");
const nameInput = document.getElementById("debt-name");
const costInput = document.getElementById("debt-cost");
const dateInput = document.getElementById("debt-date");
const nameError = document.getElementById("debt-name-error");
const costError = document.getElementById("debt-cost-error");
const dateError = document.getElementById("debt-date-error");
const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-edit-button");
const debtList = document.getElementById("debt-list");
const emptyMessage = document.getElementById("empty-message");
const totalElement = document.getElementById("total");

// ============ 2. Cargar las deudas desde localStorage ============
const STORAGE_KEY = "debts";

function getDebts() {
  try {
    const savedDebts = localStorage.getItem(STORAGE_KEY);

    // Si todavía no hay nada guardado, empezamos con una lista vacía
    if (!savedDebts) {
      return [];
    }

    return JSON.parse(savedDebts);
  } catch (error) {
    // Si los datos guardados están dañados, preferimos una lista vacía
    return [];
  }
}

function saveDebts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(debts));
}

let debts = getDebts();

// Aquí guardamos el id de la deuda que se está editando (null = deuda nueva)
let editingId = null;

// ============ 3. Funciones para dar formato al dinero y las fechas ============
function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// Revisa que la fecha tenga el formato AAAA-MM-DD y que exista de verdad
function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parts = value.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// Calcula los días que faltan para la fecha de vencimiento
function getDaysUntil(dueDateString) {
  if (!isValidDateString(dueDateString)) {
    return null;
  }

  const dueParts = dueDateString.split("-");
  const todayParts = getTodayString().split("-");

  // Usamos Date.UTC para comparar solo días y evitar problemas de zona horaria
  const dueUTC = Date.UTC(
    Number(dueParts[0]),
    Number(dueParts[1]) - 1,
    Number(dueParts[2])
  );
  const todayUTC = Date.UTC(
    Number(todayParts[0]),
    Number(todayParts[1]) - 1,
    Number(todayParts[2])
  );

  return Math.round((dueUTC - todayUTC) / 86400000);
}

// Devuelve el texto y el color del estado según los días restantes
function getStatusInfo(daysUntil) {
  if (daysUntil < 0) {
    const daysPast = Math.abs(daysUntil);
    return {
      text:
        "Vencida · Venció hace " +
        daysPast +
        (daysPast === 1 ? " día" : " días"),
      className: "status-overdue",
    };
  }

  if (daysUntil === 0) {
    return { text: "Cerca · Vence hoy", className: "status-near" };
  }

  const countdown =
    daysUntil === 1 ? "Vence en 1 día" : "Vence en " + daysUntil + " días";

  if (daysUntil <= 7) {
    return { text: "Cerca · " + countdown, className: "status-near" };
  }

  if (daysUntil <= 30) {
    return { text: "No tan cerca · " + countdown, className: "status-medium" };
  }

  return { text: "Lejos · " + countdown, className: "status-far" };
}

// Convierte "1234567" en "1.234.567"
function formatCost(value) {
  const onlyNumbers = value.replace(/\D/g, "");

  if (onlyNumbers === "") {
    return "";
  }

  return Number(onlyNumbers).toLocaleString("es-CO");
}

// Convierte 1234567 en "$1.234.567"
function formatMoney(value) {
  return "$" + Number(value).toLocaleString("es-CO");
}

// Lee el campo del costo y lo devuelve como número (quita los puntos)
function getCostValue() {
  return Number(costInput.value.replace(/\./g, ""));
}

// Convierte "2026-11-15" en "15/11/2026"
function formatDateForDisplay(dueDateString) {
  const parts = dueDateString.split("-");
  return parts[2] + "/" + parts[1] + "/" + parts[0];
}

// ============ 4. Editar y eliminar deudas ============
function setMinDate() {
  dateInput.min = getTodayString();
}

// Deja el formulario listo para agregar una deuda nueva
function resetForm() {
  editingId = null;
  form.reset();
  setMinDate();
  submitButton.textContent = "Agregar deuda";
  cancelButton.hidden = true;
  nameError.textContent = "";
  costError.textContent = "";
  dateError.textContent = "";
}

// Pone los datos de la deuda en el formulario para poder editarla
function startEditing(debt) {
  editingId = debt.id;
  setMinDate();
  nameInput.value = debt.name;
  costInput.value = formatCost(String(debt.cost));
  dateInput.value = isValidDateString(debt.dueDate) ? debt.dueDate : "";
  submitButton.textContent = "Guardar cambios";
  cancelButton.hidden = false;
  nameError.textContent = "";
  costError.textContent = "";
  dateError.textContent = "";

  // Llevar al usuario al formulario
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  nameInput.focus();
}

// Elimina una deuda después de pedir confirmación
function deleteDebt(id) {
  const wantsToDelete = confirm("¿Seguro que quieres eliminar esta deuda?");

  if (!wantsToDelete) {
    return;
  }

  debts = debts.filter(function (debt) {
    return debt.id !== id;
  });

  saveDebts();

  // Si la deuda eliminada era la que se editaba, limpiamos el formulario
  if (editingId === id) {
    resetForm();
  }

  renderDebts();
}

// ============ 5. Validar el formulario ============
function validateForm() {
  let isValid = true;

  // Limpiar los mensajes de error anteriores
  nameError.textContent = "";
  costError.textContent = "";
  dateError.textContent = "";

  const name = nameInput.value.trim();
  const cost = getCostValue();
  const dueDate = dateInput.value;
  const todayString = getTodayString();

  // Validación del nombre de la deuda
  if (name.length === 0) {
    nameError.textContent = "Por favor escribe el nombre de la deuda.";
    isValid = false;
  } else if (name.length < 4) {
    nameError.textContent = "El nombre de la deuda debe tener al menos 4 caracteres.";
    isValid = false;
  }

  // Validación del costo de la deuda
  if (costInput.value.trim() === "") {
    costError.textContent = "Por favor escribe el costo de la deuda.";
    isValid = false;
  } else if (cost < 1000) {
    costError.textContent = "El costo de la deuda debe ser de al menos $1.000.";
    isValid = false;
  }

  // Validación de la fecha de vencimiento
  if (dueDate === "") {
    dateError.textContent = "Por favor elige la fecha de vencimiento.";
    isValid = false;
  } else if (!isValidDateString(dueDate)) {
    dateError.textContent = "Por favor escribe una fecha válida.";
    isValid = false;
  } else if (dueDate < todayString) {
    dateError.textContent = "La fecha debe ser hoy o una fecha futura.";
    isValid = false;
  }

  return isValid;
}

// ============ 6. Mostrar las deudas en pantalla ============
function renderDebts() {
  // Limpiar la lista antes de dibujarla de nuevo
  debtList.innerHTML = "";

  // Actualizar fecha mínima por si la página queda abierta después de medianoche
  setMinDate();

  // Mostrar u ocultar el mensaje de lista vacía
  if (debts.length === 0) {
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
  }

  let total = 0;

  // Ordenar: vencidas primero y luego de menos días a más días
  const debtsToShow = debts.slice().sort(function (a, b) {
    const daysA = getDaysUntil(a.dueDate);
    const daysB = getDaysUntil(b.dueDate);

    if (daysA === null && daysB === null) {
      return a.id - b.id;
    }
    if (daysA === null) {
      return 1;
    }
    if (daysB === null) {
      return -1;
    }
    if (daysA !== daysB) {
      return daysA - daysB;
    }

    // Si tienen los mismos días, respetar el orden de creación
    return a.id - b.id;
  });

  debtsToShow.forEach(function (debt) {
    total = total + debt.cost;

    const daysUntil = getDaysUntil(debt.dueDate);
    const item = document.createElement("li");

    // Información de la deuda: nombre, costo, fecha y estado
    const info = document.createElement("div");
    info.className = "debt-item-info";

    const name = document.createElement("span");
    name.className = "debt-item-name";
    name.textContent = debt.name;

    const cost = document.createElement("span");
    cost.className = "debt-item-cost";
    cost.textContent = formatMoney(debt.cost);

    const dateRow = document.createElement("div");
    dateRow.className = "debt-date-row";

    const dateText = document.createElement("span");
    dateText.className = "debt-date-text";

    const status = document.createElement("span");
    status.className = "debt-status";

    if (daysUntil === null) {
      dateText.textContent = "Sin fecha";
      status.textContent = "Fecha pendiente";
      status.classList.add("status-none");
    } else {
      const statusInfo = getStatusInfo(daysUntil);
      dateText.textContent = formatDateForDisplay(debt.dueDate);
      status.textContent = statusInfo.text;
      status.classList.add(statusInfo.className);
    }

    dateRow.appendChild(dateText);
    dateRow.appendChild(status);

    info.appendChild(name);
    info.appendChild(cost);
    info.appendChild(dateRow);

    // Botones para editar y eliminar
    const actions = document.createElement("div");
    actions.className = "debt-item-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "action-button";
    editButton.textContent = "Editar";
    editButton.addEventListener("click", function () {
      startEditing(debt);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "action-button action-button-danger";
    deleteButton.textContent = "Eliminar";
    deleteButton.addEventListener("click", function () {
      deleteDebt(debt.id);
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    item.appendChild(info);
    item.appendChild(actions);
    debtList.appendChild(item);
  });

  totalElement.textContent = formatMoney(total);
}

// ============ 7. Eventos ============
costInput.addEventListener("input", function () {
  costInput.value = formatCost(costInput.value);
  costError.textContent = "";
});

nameInput.addEventListener("input", function () {
  nameError.textContent = "";
});

dateInput.addEventListener("input", function () {
  dateError.textContent = "";
  setMinDate();
});

cancelButton.addEventListener("click", function () {
  resetForm();
  nameInput.focus();
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  setMinDate();
  if (!validateForm()) {
    return;
  }

  const name = nameInput.value.trim();
  const cost = getCostValue();
  const dueDate = dateInput.value;

  if (editingId === null) {
    const newDebt = {
      id: Date.now(),
      name: name,
      cost: cost,
      dueDate: dueDate,
    };

    debts.push(newDebt);
  } else {
    const debtToEdit = debts.find(function (debt) {
      return debt.id === editingId;
    });

    if (debtToEdit) {
      debtToEdit.name = name;
      debtToEdit.cost = cost;
      debtToEdit.dueDate = dueDate;
    }
  }

  saveDebts();
  renderDebts();
  resetForm();
  nameInput.focus();
});

// ============ 8. Iniciar la aplicación ============
setMinDate();
renderDebts();
