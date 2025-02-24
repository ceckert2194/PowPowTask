import { BaseDirectory, open } from '@tauri-apps/plugin-fs';
import { sep } from '@tauri-apps/api/path';
import { type List } from './types/List';

export class LoadLists {
  private readonly LIST_DIR = 'lists';

  async loadListFromFile(listName: string): Promise<List | null> {
    try {
      const filePath = [this.LIST_DIR, `${listName}.json`].join(sep());
      const file = await open(filePath, {
        read: true,
        baseDir: BaseDirectory.AppData
      });
      const stat = await file.stat();
      const buf = new Uint8Array(stat.size);
      await file.read(buf);
      await file.close();
      const contents = new TextDecoder().decode(buf);
      return JSON.parse(contents);
    } catch (err) {
      console.error('Failed to load list:', err);
      return null;
    }
  }
}