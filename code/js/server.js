const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'faq.html'));
});

app.get('*', (req, res) => {
    res.redirect('/');
});


app.listen(PORT, () => {
    console.log(`olá sou um servidor em em http://localhost:${PORT}`);
    console.log(`olá sou a pasta publica ${path.join(__dirname, 'public')}`);
});
