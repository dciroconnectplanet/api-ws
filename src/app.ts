import { SERVER_PORT } from './config';
import app from './server';

app.listen(SERVER_PORT, () => console.log(`Ready...${SERVER_PORT}`));
