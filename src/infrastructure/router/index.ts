import { Router } from 'express';
import { readdirSync } from 'fs';
import { join } from 'path';

const router: Router = Router();
const PATH_ROUTES = join(__dirname);

function removeExtension(fileName: string): string {
  const cleanFileName = <string>fileName.split('.').shift();
  return cleanFileName;
}

/**
 *
 * @param file tracks.ts
 */
function loadRouter(file: string): void {
  const name = removeExtension(file);
  if (name !== 'index') {
    import(`./${file}`).then((routerModule) => {
      console.log('cargado', name);
      router.use(`/${name}`, routerModule.router);
    });
  }
}
readdirSync(PATH_ROUTES).filter((file) => loadRouter(file));

export default router;
