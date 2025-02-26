import { CreateListModal } from "./components/CreateListModal";
import { LoadLists } from "./components/LoadLists";
import { saveList } from './components/SaveList';
import { checkListDir } from './components/CheckListDir';
import { ListScreen } from './components/ListScreen';
import { readDir, BaseDirectory } from '@tauri-apps/plugin-fs';

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  
  // Main content elements - moved inside DOMContentLoaded to ensure elements exist
  const mainContent = document.querySelector<HTMLElement>("#main-content");
  const loadingView = document.querySelector<HTMLElement>("#loading-view");
  const noListsView = document.querySelector<HTMLElement>("#no-lists-view");
  const listsView = document.querySelector<HTMLElement>("#lists-view");
  const listSelector = document.querySelector<HTMLSelectElement>("#list-selector");
  
  console.log('DOM elements found:', { 
    mainContent: !!mainContent,
    loadingView: !!loadingView,
    noListsView: !!noListsView, 
    listsView: !!listsView, 
    listSelector: !!listSelector 
  });

  const listLoader = new LoadLists();

  /**
   * Initialize the application
   * - Check if the lists directory exists, create if not
   * - Check if any lists exist
   * - Show appropriate view based on list existence
   */
  async function initializeApp() {
    try {
      console.log('Starting app initialization...');
      
      // Show loading view during initialization
      showLoadingView();

      // Use setTimeout with a promise instead of undefined sleep function
      // await new Promise(resolve => setTimeout(resolve, 2000));
      
      // First ensure the lists directory exists
      await checkListDir();
      console.log('Lists directory checked/created');
      
      // Then check for existing lists and update the UI
      await updateListsView();
      console.log('Lists view updated');
    } catch (error) {
      console.error('Error initializing app:', error);
      // Fallback to no lists view on error
      hideLoadingView();
      showNoListsView();
      console.log('No lists view shown due to error');
    }
  }

  /**
   * Show the loading view and hide other views
   */
  function showLoadingView() {
    console.log('Showing loading view');
    if (loadingView) {
      loadingView.style.display = "block";
    }
    if (noListsView) {
      noListsView.style.display = "none";
    }
    if (listsView) {
      listsView.style.display = "none";
    }
  }

  /**
   * Hide the loading view
   */
  function hideLoadingView() {
    console.log('Hiding loading view');
    if (loadingView) {
      loadingView.style.display = "none";
    }
  }

  /**
   * Check if any lists exist and update the UI accordingly
   */
  async function updateListsView() {
    try {
      console.log('Checking for existing lists...');
      
      // Check if any lists exist
      try {
        const files = await readDir('lists', { baseDir: BaseDirectory.AppData });
        console.log('Files in lists directory:', files);
        
        const listFiles = files.filter(file => file.name && file.name.endsWith('.json'));
        console.log('JSON files found:', listFiles.length);
        
        // Hide loading view now that we have results
        hideLoadingView();
        
        if (listFiles.length === 0) {
          // No lists found - show the no lists view
          console.log('No lists found, showing no lists view');
          showNoListsView();
        } else {
          // Lists found - populate the dropdown and show the lists view
          console.log('Lists found, showing lists view');
          await populateListSelector(listFiles);
          showListsView();
        }
      } catch (readError) {
        console.error('Error reading lists directory:', readError);
        hideLoadingView();
        showNoListsView();
      }
    } catch (error) {
      console.error('Error checking for lists:', error);
      hideLoadingView();
      showNoListsView(); // Default to no lists view on error
    }
  }

  /**
   * Show the view for when no lists exist
   */
  function showNoListsView() {
    console.log('Showing no lists view');
    if (!noListsView || !listsView) {
      console.error('Required DOM elements not found:', { noListsView, listsView });
      return;
    }
    
    noListsView.style.display = "block";
    listsView.style.display = "none";
  }

  /**
   * Show the view for when lists exist
   */
  function showListsView() {
    console.log('Showing lists view');
    if (!noListsView || !listsView) {
      console.error('Required DOM elements not found:', { noListsView, listsView });
      return;
    }
    
    noListsView.style.display = "none";
    listsView.style.display = "block";
  }

  /**
   * Populate the list selector dropdown with available lists
   */
  async function populateListSelector(files: { name: string }[]) {
    if (!listSelector) {
      console.error('List selector element not found');
      return;
    }
    
    console.log('Populating list selector with files:', files);
    
    // Clear existing options
    listSelector.innerHTML = '<option value="">Select a list</option>';
    
    // Add an option for each list
    for (const file of files) {
      const listName = file.name.replace('.json', '');
      const option = document.createElement('option');
      option.value = listName;
      option.textContent = listName;
      listSelector.appendChild(option);
    }
  }

  // Event listener for the start list button (works in both views)
  document.querySelectorAll("#start-list").forEach(button => {
    button.addEventListener("click", () => {
      console.log('Start list button clicked');
      new CreateListModal(async (listName: string) => {
        console.log('Creating new list:', listName);
        const success = await saveList(listName);
        if (success) {
          console.log('List created successfully');
          await updateListsView(); // Update the view after creating a list
          openListScreen(listName);
        } else {
          console.error('Failed to create list');
          alert('Failed to create list');
        }
      });
    });
  });

  // Event listener for list selection change
  listSelector?.addEventListener("change", (event) => {
    const selectedList = (event.target as HTMLSelectElement).value;
    console.log('List selected:', selectedList);
    if (selectedList) {
      openListScreen(selectedList);
    }
  });

  // Event listener for the open selected list button
  document.querySelector("#open-selected-list")?.addEventListener("click", () => {
    console.log('Open list button clicked');
    if (listSelector && listSelector.value) {
      openListScreen(listSelector.value);
    } else {
      console.warn('No list selected');
      alert('Please select a list first');
    }
  });

  /**
   * Open the list screen for a specific list
   */
  async function openListScreen(listName: string) {
    console.log('Opening list screen for:', listName);
    const list = await listLoader.loadListFromFile(listName);
    if (!list) {
      console.error('Failed to load list:', listName);
      alert('Failed to load list');
      return;
    }
    
    console.log('List loaded successfully:', list);
    new ListScreen(list, async () => {
      // This callback is called when returning to the main screen
      console.log('Returning to main screen');
      await updateListsView();
    });
  }

  // Start the app initialization
  initializeApp().catch(error => {
    console.error('Failed to initialize app:', error);
    hideLoadingView();
    showNoListsView();
  });
});