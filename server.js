const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
app.use(bodyParser.json()); // Parse JSON body
app.use(express.static('templates')); // Serve static HTML/CSS files

// Route pour générer le PDF
app.post('/generate-pdf', async (req, res) => {
    const { name } = req.body; // Données envoyées au backend
    if (!name) {
        return res.status(400).send({ error: 'Name is required!' });
    }

    try {
        // Charger le modèle HTML
        const htmlTemplate = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>PDF</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    .header {
                        text-align: center;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .content {
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="header">Hello, ${name}!</div>
                <div class="content">
                    This is a dynamically generated PDF using Puppeteer.
                </div>
            </body>
            </html>
        `;

        // Lancer Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Charger le contenu HTML
        await page.setContent(htmlTemplate);

        // Générer le PDF
        const pdfBuffer = await page.pdf({ format: 'A4' });

        // Fermer le navigateur
        await browser.close();

        // Renvoyer le PDF en tant que fichier téléchargeable
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${name}_document.pdf`);
        res.send(pdfBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Failed to generate PDF!' });
    }
});

// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
