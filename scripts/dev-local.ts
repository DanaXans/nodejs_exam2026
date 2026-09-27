import {MongoMemoryServer} from 'mongodb-memory-server';

process.env.PORT = process.env.PORT || '5000';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const mongod = await MongoMemoryServer.create();
process.env.MONGO_URI = mongod.getUri();

const {createApp, initDatabase} = await import('../src/app.ts');
await initDatabase();

const port = Number(process.env.PORT);
const app = createApp();
const server = app.listen(port, () => {
    console.log(`Сервер запущено на http://localhost:${port}`);
    console.log('База тимчасова і зникне після зупинки. Для зупинки натисніть Ctrl+C.');
});

const shutdown = async () => {
    server.close();
    await mongod.stop();
    process.exit(0);
};

process.on('SIGINT', () => {
    void shutdown();
});
process.on('SIGTERM', () => {
    void shutdown();
});
