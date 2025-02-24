import { exists, create, BaseDirectory } from '@tauri-apps/plugin-fs';

export async function createNewList(listName: string): Promise<boolean> {
  try {
    const appDirName = 'lists/';
    
    // check if the directory exists
    if (!await exists(appDirName)) {
      return false;
    }

    const listFilePath = appDirName + listName + '.json';
    await create(listFilePath, { baseDir: BaseDirectory.AppData });

    return true;
  } catch (error) {
    console.error('Error saving list:', error);
    return false;
  }
}