import { List } from './types/List';
import { writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';

export class ListScreen {
  private element: HTMLDivElement;
  private mainContent: HTMLElement;
  private list: List;
  private onClose: () => Promise<void>;
  private addItemListener: (e: Event) => void;
  private keyPressListener: (e: KeyboardEvent) => void;

  constructor(list: List, onClose: () => Promise<void>) {
    this.list = list;
    this.onClose = onClose;
    this.mainContent = document.querySelector("#main-content") as HTMLElement;
    this.element = document.createElement("div");
    this.element.className = "list-screen";
    
    // Initialize event listener references
    this.addItemListener = () => {};
    this.keyPressListener = () => {};
    
    this.render();
    this.setupEventListeners();
  }

  private render() {
    this.element.innerHTML = `
      <div class="list-header">
        <h1>${this.list.header.name}</h1>
        <p class="list-meta">Created: ${new Date(this.list.header.createdAt).toLocaleDateString()}</p>
      </div>
      
      <div class="list-content">
        <div class="add-item-form">
          <input type="text" id="new-item-input" placeholder="Add a new item...">
          <button id="add-item-btn">Add</button>
        </div>
        
        <div class="items-container">
          ${this.renderItems()}
        </div>
      </div>
      
      <div class="list-footer">
        <button id="back-to-main" class="secondary-btn">Back</button>
      </div>
    `;
    
    if (this.mainContent) {
      this.mainContent.style.display = "none";
    }
    document.body.appendChild(this.element);
  }

  private renderItems() {
    if (this.list.body.items.length === 0) {
      return '<p class="empty-list-message">No items in this list yet. Add your first item above!</p>';
    }

    return `
      <ul class="items-list">
        ${this.list.body.items.map((item, index) => `
          <li class="list-item ${this.list.body.status[index] ? 'completed' : ''}" data-index="${index}">
            <div class="item-content">
              <input type="checkbox" class="item-checkbox" data-index="${index}" 
                ${this.list.body.status[index] ? 'checked' : ''}>
              <span class="item-text">${item}</span>
            </div>
            <button class="delete-item-btn" data-index="${index}">Delete</button>
          </li>
        `).join('')}
      </ul>
    `;
  }

  private setupEventListeners() {
    // Back button
    const backButton = this.element.querySelector("#back-to-main");
    if (backButton) {
      backButton.addEventListener("click", () => this.close());
    }

    // Add item button - store reference to remove later
    const addItemBtn = this.element.querySelector("#add-item-btn");
    const newItemInput = this.element.querySelector("#new-item-input") as HTMLInputElement;
    
    if (addItemBtn && newItemInput) {
      // Remove old listeners if they exist
      if (this.addItemListener) {
        addItemBtn.removeEventListener("click", this.addItemListener);
      }
      
      if (this.keyPressListener) {
        newItemInput.removeEventListener("keypress", this.keyPressListener);
      }
      
      // Create new listeners and store references
      this.addItemListener = () => this.addItem(newItemInput.value);
      this.keyPressListener = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          this.addItem(newItemInput.value);
        }
      };
      
      // Add the new listeners
      addItemBtn.addEventListener("click", this.addItemListener);
      newItemInput.addEventListener("keypress", this.keyPressListener);
    }

    // Set up one-time event delegation for delete and checkbox actions
    this.setupItemEventDelegation();
  }
  
  private setupItemEventDelegation() {
    // Use event delegation for item actions
    const itemsContainer = this.element.querySelector(".items-container");
    if (!itemsContainer) return;
    
    // Remove existing listeners first
    const newItemsContainer = itemsContainer.cloneNode(true);
    itemsContainer.parentNode?.replaceChild(newItemsContainer, itemsContainer);
    
    // Add single delegated event listener for all delete buttons
    newItemsContainer.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("delete-item-btn")) {
        const index = parseInt(target.getAttribute("data-index") || "0");
        this.deleteItem(index);
      }
    });
    
    // Add single delegated event listener for all checkboxes
    newItemsContainer.addEventListener("change", (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("item-checkbox")) {
        const index = parseInt(target.getAttribute("data-index") || "0");
        this.toggleItemStatus(index);
      }
    });
  }

  private async addItem(text: string) {
    text = text.trim();
    if (!text) return;
    
    this.list.body.items.push(text);
    this.list.body.status.push(false);
    this.list.header.lastModified = new Date().toISOString();
    
    await this.saveList();
    this.updateView();
    
    // Clear input
    const input = this.element.querySelector("#new-item-input") as HTMLInputElement;
    if (input) input.value = "";
  }

  private async deleteItem(index: number) {
    this.list.body.items.splice(index, 1);
    this.list.body.status.splice(index, 1);
    this.list.header.lastModified = new Date().toISOString();
    
    await this.saveList();
    this.updateView();
  }

  private async toggleItemStatus(index: number) {
    // Find the specific checkbox and list item
    const itemsContainer = this.element.querySelector(".items-container");
    const listItem = itemsContainer?.querySelector(`.list-item[data-index="${index}"]`) as HTMLElement;
    
    // Toggle the status in the data model
    this.list.body.status[index] = !this.list.body.status[index];
    this.list.header.lastModified = new Date().toISOString();
    
    // Update just the class on the specific item without re-rendering everything
    if (listItem) {
      if (this.list.body.status[index]) {
        listItem.classList.add('completed');
      } else {
        listItem.classList.remove('completed');
      }
      
      // Also update the checkbox checked state
      const checkbox = listItem.querySelector('.item-checkbox') as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = this.list.body.status[index];
      }
      
      // Save the list in the background
      this.saveList().catch(err => console.error('Error saving list:', err));
    } else {
      // Fallback to full re-render if item not found
      this.saveList().then(() => this.updateView());
    }
  }

  private async saveList() {
    try {
      const listFilePath = `lists/${this.list.header.name}.json`;
      const jsonList = JSON.stringify(this.list);
      
      await writeTextFile(listFilePath, jsonList, { 
        baseDir: BaseDirectory.AppData 
      });
      
      return true;
    } catch (error) {
      console.error('Error saving list:', error);
      return false;
    }
  }

  private updateView() {
    const itemsContainer = this.element.querySelector(".items-container");
    if (itemsContainer) {
      // Store the current scroll position
      const scrollPosition = itemsContainer.scrollTop;
      
      // Update the HTML content
      itemsContainer.innerHTML = this.renderItems();
      
      // Add 'rendered' class to all items to prevent animation replay
      setTimeout(() => {
        const items = itemsContainer.querySelectorAll('.list-item');
        items.forEach(item => {
          item.classList.add('rendered');
        });
      }, 600); // Wait for the initial animation to complete
      
      // Restore scroll position
      itemsContainer.scrollTop = scrollPosition;
    }
    
    // Set up event delegation for the updated items
    this.setupItemEventDelegation();
  }

  private async close() {
    // Safely remove element from its parent
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    if (this.mainContent) {
      this.mainContent.style.display = "block";
    }
    
    // Call the onClose callback to refresh the main view
    await this.onClose();
  }
} 