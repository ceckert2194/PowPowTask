export class CreateListModal {
  private modal: HTMLDivElement;
  
  constructor(onConfirm: (listName: string) => void) {
    this.modal = document.createElement("div");
    this.modal.className = "modal";
    this.modal.innerHTML = `
      <div class="modal-content">
        <h2>Create New List</h2>
        <input type="text" id="list-name-input" placeholder="Enter list name" autocomplete="off">
        <div class="modal-buttons">
          <button id="cancel-list">Cancel</button>
          <button id="confirm-list">Create</button>
        </div>
      </div>
    `;

    this.setupEventListeners(onConfirm);
    document.body.appendChild(this.modal);
  }

  private setupEventListeners(onConfirm: (listName: string) => void) {
    const listNameInput = this.modal.querySelector("#list-name-input") as HTMLInputElement;
    
    this.modal.querySelector("#cancel-list")?.addEventListener("click", () => {
      this.close();
    });

    this.modal.querySelector("#confirm-list")?.addEventListener("click", () => {
      const listName = listNameInput.value.trim();
      if (listName) {
        onConfirm(listName);
        this.close();
      }
    });
  }

  private close() {
    document.body.removeChild(this.modal);
  }
} 