require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.WEB_SERVER_PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/css', express.static(path.join(__dirname, 'code', 'css')));
app.use('/js', express.static(path.join(__dirname, 'code', 'js')));

const API_URL = process.env.API_URL || 'http://localhost:4000';

app.get('/pesquisa.html', (req, res) => {
    const htmlPath = path.join(__dirname, 'code', 'pesquisa.html');
    
    fs.readFile(htmlPath, 'utf8', (err, data) => {
        if (err) {
            res.sendFile(htmlPath);
            return;
        }
        
        let correctedHtml = data
            .replace(/href="\.\.\/css\//g, 'href="/css/')
            .replace(/src="\.\.\/js\//g, 'src="/js/')
            .replace(/src="\.\.\/\.\.\/assets\//g, 'src="/assets/')
            .replace(/href="\.\.\/\.\.\/assets\//g, 'href="/assets/')
            .replace(/action="\.\.\/php\/pesquisa\.php"/g, `action="/pesquisa.html"`);
        
        correctedHtml = correctedHtml.replace('</body>', `
            <script>
                window.API_URL = '${API_URL}';
            </script>
            <script src="/js/pesquisa.js"></script>
            </body>
        `);
        
        res.send(correctedHtml);
    });
});

app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'code', 'html', 'index.html');
    fs.readFile(htmlPath, 'utf8', (err, data) => {
        if (err) {
            res.sendFile(htmlPath);
            return;
        }
        
        let correctedHtml = data
            .replace(/href="\.\.\/css\//g, 'href="/css/')
            .replace(/src="\.\.\/js\//g, 'src="/js/')
            .replace(/src="\.\.\/\.\.\/assets\//g, 'src="/assets/')
            .replace(/href="\.\.\/\.\.\/assets\//g, 'href="/assets/')
            .replace(/action="\.\.\/php\/pesquisa\.php"/g, 'action="/pesquisa.html"');
        
        res.send(correctedHtml);
    });
});

app.get('/faq', (req, res) => {
    const htmlPath = path.join(__dirname, 'code', 'html', 'faq.html');
    fs.readFile(htmlPath, 'utf8', (err, data) => {
        if (err) {
            res.sendFile(htmlPath);
            return;
        }
        
        let correctedHtml = data
            .replace(/href="\.\.\/css\//g, 'href="/css/')
            .replace(/src="\.\.\/js\//g, 'src="/js/')
            .replace(/src="\.\.\/\.\.\/assets\//g, 'src="/assets/')
            .replace(/href="\.\.\/\.\.\/assets\//g, 'href="/assets/');
        
        res.send(correctedHtml);
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'PFPedia Web Server',
        timestamp: new Date().toISOString()
    });
});

app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>404</title></head>
        <body style="background:#fff7b1; text-align:center; padding:100px 20px;">
            <h1>404 - Page Not Found</h1>
            <a href="/">← Back to Home</a>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});