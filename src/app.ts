import { SERVER_PORT } from './config';
import { server } from './server';

server.listen(SERVER_PORT, () => console.log(`Ready...${SERVER_PORT}`));
