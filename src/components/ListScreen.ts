export class ListScreen {
  private element: HTMLDivElement;
  private mainContent: HTMLElement;

  constructor(listName: string) {
    this.mainContent = document.querySelector("#main-content") as HTMLElement;
    this.element = document.createElement("div");
    this.element.className = "list-screen";
    this.render(listName);
    this.setupEventListeners();
  }

  private render(listName: string) {
    this.element.innerHTML = `
      <h1>${listName}</h1>
      <div class="list-content">
        <p>Your new list is ready!</p>
      </div>
      <button id="back-to-main">Back</button>
    `;
    
    if (this.mainContent) {
      this.mainContent.style.display = "none";
    }
    document.body.appendChild(this.element);
  }

  private setupEventListeners() {
    const backButton = this.element.querySelector("#back-to-main");
    if (backButton) {
      backButton.addEventListener("click", () => this.close());
    }
  }

  private close() {
    document.body.removeChild(this.element);
    if (this.mainContent) {
      this.mainContent.style.display = "block";
    }
  }
} 