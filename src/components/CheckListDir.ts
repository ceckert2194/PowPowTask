// check if the lists directory exists, if not create it
import { exists, BaseDirectory, mkdir } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';

export async function checkListDir() {
    try {
        // Get the app data directory
        const appDirName = await appDataDir();
        console.log('App data directory:', appDirName);
        
        // Check if the app directory exists
        const appDirExists = await exists(appDirName);
        console.log('App directory exists:', appDirExists);
        
        if (!appDirExists) {
            // Create the app directory
            await mkdir(appDirName, { baseDir: BaseDirectory.AppData });
            console.log('App directory created');
        }
        
        // Check if the lists directory exists
        const listsDirExists = await exists('lists', { baseDir: BaseDirectory.AppData });
        console.log('Lists directory exists:', listsDirExists);
        
        if (!listsDirExists) {
            // Create the lists directory
            await mkdir('lists', { baseDir: BaseDirectory.AppData });
            console.log('Lists directory created');
        } else {
            console.log('Lists directory already exists');
        }
        
        return true;
    } catch (error) {
        console.error('Error checking/creating directories:', error);
        return false;
    }
}