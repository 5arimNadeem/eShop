const app = require('./app');
// console.log(app)
//handling uncaught exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server due to uncaught exception`);
    process.exit(1);
});

//config
console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV !== "PRODUCTION") {
    // console.log(require('dotenv').config({ path: 'config/.env' }));
    require('dotenv').config({ path: 'config/.env' })
}

const connectDatabase = require('./db/Database.js');

const initializeDatabase = async () => {
    try {
        await connectDatabase();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
    }
};

initializeDatabase()

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is working on Port:${process.env.PORT}`);
})

//unhandled promise rejection
process.on("unhandledRejection", err => {
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server due to unhandled promise rejection`);
    server.close(() => {
        process.exit(1);
    });
});