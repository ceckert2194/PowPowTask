// check if the lists directory exists, if not create it
import { exists, BaseDirectory, mkdir } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';

// the directory name for the app
const appDirName = await appDataDir();
// console.log(appDirName);
// console.log(await exists(appDirName));

export async function checkListDir() {
    // check if the directory exists
    if (!await exists(appDirName)) {
        // create the directory
        await mkdir(appDirName, { baseDir: BaseDirectory.AppData });
        console.log('Directory created');
    } else {
        console.log('Directory already exists');
        // check if the lists directory exists, if not create it
        const listsDirExists = await exists('lists', { baseDir: BaseDirectory.AppData });
        if (!listsDirExists) {
            await mkdir('lists', { baseDir: BaseDirectory.AppData });
            console.log('Lists directory created');
        } else {
            console.log('Lists directory already exists');
        }
    }
}