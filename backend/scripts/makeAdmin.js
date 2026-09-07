// Promotes an already-registered user to the Admin role.
//
//   cd backend && npm run make-admin -- someone@example.com
//
// Signup always writes role: "user", so the first administrator has to be
// created out of band.

const mongoose = require("mongoose");

if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "config/.env" });
}

const User = require("../model/user.js");

const email = process.argv[2];

const makeAdmin = async () => {
    if (!email) {
        console.error("Usage: npm run make-admin -- <email>");
        process.exit(1);
    }

    if (!process.env.DB_URL) {
        console.error("DB_URL is not set. Run this from the backend/ directory.");
        process.exit(1);
    }

    // Connecting directly rather than through db/Database.js: that helper swallows
    // failures and retries on a timer, which would leave this script running
    // queries against a dead connection.
    await mongoose.connect(process.env.DB_URL, { serverSelectionTimeoutMS: 30000 });

    const user = await User.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        { role: "Admin" },
        { returnDocument: "after" }
    );

    if (!user) {
        console.error(`No user found with email ${email}. Sign up first, then re-run this.`);
        await mongoose.disconnect();
        process.exit(1);
    }

    console.log(`${user.name} <${user.email}> is now role "${user.role}".`);

    await mongoose.disconnect();
};

makeAdmin().catch(async (error) => {
    console.error("Failed to promote user:", error.message);
    await mongoose.disconnect().catch(() => { });
    process.exit(1);
});
