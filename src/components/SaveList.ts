import { BaseDirectory, writeTextFile } from '@tauri-apps/plugin-fs';
import { List } from './types/List';

export async function saveList(listName: string): Promise<boolean> {
  try {
    const listFilePath = `lists/${listName}.json`;
    
    // Create an empty list object
    const list: List = {
      header: {
        name: listName,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      },
      body: {
        items: [],
        status: []
      }
    };

    const jsonList = JSON.stringify(list);
    
    // Write directly to the AppData directory using BaseDirectory
    await writeTextFile(listFilePath, jsonList, { 
      baseDir: BaseDirectory.AppData 
    });

    return true;
  } catch (error) {
    console.error('Error saving list:', error);
    return false;
  }
}