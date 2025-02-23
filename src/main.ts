import { invoke } from "@tauri-apps/api/core";

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

async function greet() {
  if (greetMsgEl && greetInputEl) {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    greetMsgEl.textContent = await invoke("greet", {
      name: greetInputEl.value,
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
});

document.querySelector("#start-list")?.addEventListener("click", () => {
  // Create and show the modal dialog
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Create New List</h2>
      <input type="text" id="list-name-input" placeholder="Enter list name">
      <div class="modal-buttons">
        <button id="cancel-list">Cancel</button>
        <button id="confirm-list">Create</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Handle modal interactions
  const listNameInput = modal.querySelector("#list-name-input") as HTMLInputElement;
  
  modal.querySelector("#cancel-list")?.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  modal.querySelector("#confirm-list")?.addEventListener("click", () => {
    const listName = listNameInput.value.trim();
    if (listName) {
      // Navigate to the list screen
      showListScreen(listName);
      document.body.removeChild(modal);
    }
  });
});

function showListScreen(listName: string) {
  const mainContent = document.querySelector("#main-content") as HTMLElement;
  if (mainContent) {
    mainContent.style.display = "none";
  }

  // Create and show list screen
  const listScreen = document.createElement("div");
  listScreen.className = "list-screen";
  listScreen.innerHTML = `
    <h1>${listName}</h1>
    <div class="list-content">
      <!-- Add your list content here -->
    </div>
    <button id="back-to-main">Back</button>
  `;

  document.body.appendChild(listScreen);

  // Handle back button
  listScreen.querySelector("#back-to-main")?.addEventListener("click", () => {
    document.body.removeChild(listScreen);
    if (mainContent) {
      mainContent.style.display = "block";
    }
  });
}