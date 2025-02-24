import { CreateListModal } from "./components/CreateListModal";
import { LoadLists } from "./components/LoadLists";
import { saveList } from './components/SaveList';
import { checkListDir } from './components/CheckListDir';

async function initializeApp() {
  await checkListDir();
}

const listLoader = new LoadLists();

document.querySelector("#start-list")?.addEventListener("click", () => {
  new CreateListModal(async (listName: string) => {
    const success = await saveList(listName);
    if (success) {
      showListScreen(listName);
    } else {
      alert('Failed to create list');
    }
  });
});

document.querySelector("#open-list")?.addEventListener("click", () => {
  new CreateListModal((listName: string) => {
    showListScreen(listName);
  });
});

// To load an existing list:
async function showListScreen(listName: string) {
  const list = await listLoader.loadListFromFile(listName);
  if (!list) {
    alert('Failed to load list');
    return;
  }

  // Hide current content
  const mainContent = document.querySelector<HTMLElement>("#main-content");
  if (mainContent) {
    mainContent.style.display = "none";
  }

  // Create and show list screen
  const listScreen = document.createElement("div");
  listScreen.className = "list-screen";
  listScreen.innerHTML = `
    <h1>${list.header.name}</h1>
    <div class="list-content">
      <ul>
        ${list.body.items.map(item => `<li>${item}</li>`).join('')}
      </ul>
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

// Call initializeApp when the app loads
document.addEventListener('DOMContentLoaded', () => {
  initializeApp().catch(console.error);
});