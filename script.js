const File = require("./models/file");
const fs = require("fs");
const connectDb = require("./config/db");
connectDb();

async function fetchData() {
    const pastDate = new Date(Date.now() - 10 * 60 * 1000);
    const files = File.find({ createdAt: { $lt: pastDate } });

    if (files.length) {
        for (const file of files) {
            try {
                fs.unlinkSync(file.path);
                await file.remove();
                console.log(`Successfully deleted ${file.filename}`);
            } catch (error) {
                console.log("Error is: ", error);
            }
            console.log("Job Done");
        }
    }
}

fetchData().then(process.exit())