import { create, BaseDirectory, writeTextFile } from '@tauri-apps/plugin-fs';
import { join, appDataDir } from '@tauri-apps/api/path';
import { List } from './types/List';

export async function saveList(listName: string): Promise<boolean> {
  try {
    const listFilePath = await join('lists', `${listName}.json`);
    await create(listFilePath, { baseDir: BaseDirectory.AppData });

    // write an empty json object to the file
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
    const basePath = await appDataDir();
    const fPath = basePath + "\\" + listFilePath;

    await writeTextFile(fPath, jsonList);

    return true;
  } catch (error) {
    console.error('Error saving list:', error);
    return false;
  }
}