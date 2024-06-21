const sgMail = require('@sendgrid/mail');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/send-email', async (req, res) => {
    const { email, name } = req.body;

    // Simulate data storage operation
    const storeData = async (email, name) => {
        try {
            // Simulate a successful data storage operation
            console.log(`Data stored for email: ${email}, name: ${name}`);
            return true;
        } catch (error) {
            console.error('Failed to store data:', error);
            return false;
        }
    };

    // Try to store data
    const dataStored = await storeData(email, name);

    if (!dataStored) {
        return res.status(500).send({ error: 'Failed to store data' });
    }

    const msg = {
        to: email,
        from: {
            name: 'Ternary Development',
            email: process.env.FROM_EMAIL,
        },
        subject: 'Thank you! You have successfully submitted your form.',
        text: 'We look forward to sharing our story with you and learning more about yourself and your community. We are confident we can help you find ways to scale and grow your business and we appreciate the opportunity to partner.',
        html: '<strong>We look forward to sharing our story with you and learning more about yourself and your community. We are confident we can help you find ways to scale and grow your business and we appreciate the opportunity to partner.</strong>',
        template_id: process.env.SENDGRID_TEMPLATE_ID,
        dynamic_template_data: {
            name: name,
        },
    };

    try {
        await sgMail.send(msg);
        console.log('Email has been sent to your account');
        res.status(200).send({ message: 'Data stored successfully. Email sent successfully.' });
    } catch (error) {
        console.error('Failed to send email:', error);
        if (error.response) {
            console.error(error.response.body);
        }
        res.status(200).send({ message: 'Data stored successfully. Email failed to send.' });
    }
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
