import {createApp, initDatabase} from './app.js';
import {getConfig} from './config.js';

const startServer = async () => {
    try {
        await initDatabase();
        const {port} = getConfig();
        const app = createApp();
        app.listen(port, () => {
            console.log(`Сервер запущено на http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Не вдалося запустити сервер:', error);
        process.exit(1);
    }
};

void startServer();
