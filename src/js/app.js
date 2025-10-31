// TODO: write code here

import {
  renderCards,
  addCard,
  handleDragStart,
  handleDragOver,
  handleDragEnter,
  handleDragLeave,
  handleDrop,
  handleDragEnd,
} from "./taskboard/taskboard.js";

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

// Инициализация событий
function initEvents() {
  // Кнопки добавления карточек
  document.querySelectorAll(".add-card-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const columnId = btn.dataset.column;
      addCard(columnId);
    });
  });

  // Обработчики drag-and-drop
  document.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("card")) {
      handleDragStart(e);
    }
  });

  document.addEventListener("dragover", handleDragOver);
  document.addEventListener("dragenter", handleDragEnter);
  document.addEventListener("dragleave", handleDragLeave);
  document.addEventListener("drop", handleDrop);
  document.addEventListener("dragend", handleDragEnd);
}

// Основной запуск приложения
function initApp() {
  renderCards(); // Рендерим карточки из localStorage
  initEvents(); // Настраиваем обработчики событий
}
