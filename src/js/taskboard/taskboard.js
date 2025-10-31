const COLUMNS = ["todo", "inprogress", "done"];
const STORAGE_KEY = "trelloBoardState";

// Получение состояния из localStorage
export function getState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    todo: [],
    inprogress: [],
    done: [],
  };
}

// Сохранение состояния в localStorage
export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Рендеринг всех карточек
export function renderCards() {
  const state = getState();
  COLUMNS.forEach((columnId) => {
    const cardList = document.querySelector(`[data-card-list="${columnId}"]`);
    if (!cardList) return;
    cardList.innerHTML = "";

    state[columnId].forEach((cardText, index) => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.id = index;
      card.dataset.column = columnId;
      card.draggable = true;

      const text = document.createElement("div");
      text.textContent = cardText;

      const deleteBtn = document.createElement("span");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "×";
      deleteBtn.addEventListener("click", () => deleteCard(columnId, index));

      card.append(text);
      card.append(deleteBtn);
      cardList.append(card);
    });
  });
}

// Добавление новой карточки
export function addCard(columnId) {
  const state = getState();
  const newText = prompt("Введите текст карточки:");
  if (newText && newText.trim() !== "") {
    state[columnId].push(newText.trim());
    saveState(state);
    renderCards();
  }
}

// Удаление карточки
export function deleteCard(columnId, index) {
  const state = getState();
  state[columnId].splice(index, 1);
  saveState(state);
  renderCards();
}

// Обработчики drag-and-drop (экспортируем для подключения в app.js)
export let draggedCard = null;
export let dragStartColumn = null;

export function handleDragStart(e) {
  draggedCard = e.target;
  dragStartColumn = draggedCard.dataset.column;

  draggedCard.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", draggedCard.dataset.id);
}

export function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";

  const target = e.target;
  if (
    target.classList.contains("card-list") ||
    target.classList.contains("column")
  ) {
    target.classList.add("drop-area");
  }
}

export function handleDragEnter(e) {
  e.preventDefault();
}

export function handleDragLeave(e) {
  const target = e.target;
  if (target.classList.contains("drop-area")) {
    target.classList.remove("drop-area");
  }
}

export function handleDrop(e) {
  e.preventDefault();

  const dropTarget = e.target;
  const targetList = dropTarget.classList.contains("card-list")
    ? dropTarget
    : dropTarget.closest(".card-list");

  if (!targetList || !draggedCard) return;

  const targetColumnId = targetList.dataset.cardList;
  const state = getState();

  // Удаление из исходной колонки
  const startIndex = Array.from(
    draggedCard.parentNode.querySelectorAll(".card"),
  ).findIndex((card) => card.dataset.id === draggedCard.dataset.id);

  if (startIndex !== -1) {
    state[dragStartColumn].splice(startIndex, 1);
  } else {
    console.warn("Карточка не найдена в исходной колонке");
    handleDragEnd();
    return;
  }

  // Определение индекса вставки
  const cardsInTarget = Array.from(targetList.querySelectorAll(".card"));
  let insertIndex = cardsInTarget.length;

  for (let i = 0; i < cardsInTarget.length; i++) {
    const cardRect = cardsInTarget[i].getBoundingClientRect();
    const dropY = e.clientY;
    if (dropY < cardRect.top + cardRect.height / 2) {
      insertIndex = i;
      break;
    }
  }

  // Вставка в целевую колонку
  const draggedText = draggedCard.querySelector("div").textContent;
  state[targetColumnId].splice(insertIndex, 0, draggedText);

  saveState(state);
  draggedCard.remove();
  renderCards();
  targetList.classList.remove("drop-area");
  handleDragEnd();
}

export function handleDragEnd() {
  if (draggedCard) {
    draggedCard.classList.remove("dragging");
    if (document.contains(draggedCard)) {
      draggedCard.remove();
    }
  }
  draggedCard = null;
  dragStartColumn = null;
}
