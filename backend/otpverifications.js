const axios = require("axios");

app.post("/send-otp", async (req, res) => {
    const { phone } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);

    try {
        await axios.get("https://www.fast2sms.com/dev/bulkV2", {
            params: {
                authorization: "YOUR_API_KEY",
                variables_values: otp,
                route: "otp",
                numbers: phone,
            },
        });

        res.json({ message: "OTP sent to mobile ✅" });

    } catch (err) {
        res.status(500).json({ error: "Failed to send OTP" });
    }
});