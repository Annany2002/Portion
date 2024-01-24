const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuid4 } = require("uuid");

let storage = multer.diskStorage({
    destination: (res, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()} - ${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, file.originalname);
    }
})

let upload = multer({
    storage,
    limits: { fileSize: 100000 * 100 }
}).single("myFile");

router.post("/", (req, res) => {
    upload(req, res, async (err) => {
        if (!req.file)
            return res.json({ error: "All fields are required" });
        if (err)
            return res.status(500).json({ error: err.message });
        const file = new File({
            filename: req.file.filename,
            uuid: uuid4(),
            path: req.file.path,
            size: req.file.size
        });
        const response = await file.save();
        return res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
    })
})

router.post("/send", async (req, res) => {
    const { uuid, senderEmail, receiverEmail } = req.body;
    if (!uuid || !senderEmail || !receiverEmail)
        return res.status(422).json({ error: "All fields are required" });

    const file = await File.findOne({ uuid: uuid });
    if (file.sender)
        return res.status(422).json({ error: "Email already send" });

    file.sender = senderEmail;
    file.receiver = receiverEmail;

    const response = await file.save();
    const { sendMail } = require("../services/emailService");
    sendMail({
        from: senderEmail,
        to: receiverEmail,
        subject: "Portion : A file sharing system",
        text: `${senderEmail} shared a file with you through Portion`,
        html: require("../services/emailTemplate")({
            emailFrom: senderEmail,
            downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size: parseInt(file.size / 100) + "KB",
            expires: '10 minutes'
        })
    })
    return res.send({ success : true});
});

module.exports = router;