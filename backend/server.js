const app = require('./app');

// Handle uncaught exceptions (must be registered first)
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to uncaught exception`);
    process.exit(1);
});

// Load env variables
if (process.env.NODE_ENV !== "PRODUCTION") {
    require('dotenv').config({ path: 'config/.env' });
}

const connectDatabase = require('./db/Database.js');

// ✅ Correct startup order:
//    Step 1 — Connect to DB (await it — don't fire and forget)
//    Step 2 — THEN open the server to accept requests
//
// WHY: If app.listen() runs before DB connects, any request that
// arrives during the connection window hits Mongoose's buffer.
// If the buffer times out before Atlas wakes up → "buffering timed out" error.
// Solution: don't open the door until the DB is ready.

const startServer = async () => {
    try {
        await connectDatabase();             // ← wait for DB first
        console.log('✅ Database connected');

        const server = app.listen(process.env.PORT, () => {
            console.log(`🚀 Server running on Port: ${process.env.PORT}`);
        });

        // Unhandled promise rejection — shut down gracefully
        process.on("unhandledRejection", err => {
            console.log(`Error: ${err.message}`);
            console.log(`Shutting down server due to unhandled promise rejection`);
            server.close(() => {
                process.exit(1);
            });
        });

    } catch (error) {
        // DB failed to connect even after retries — don't open the server at all
        console.error('❌ Database connection failed — server will NOT start:', error.message);
        process.exit(1);
    }
};

startServer();