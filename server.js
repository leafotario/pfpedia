const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// imagens
app.use(express.static(__dirname));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/code/css', express.static(path.join(__dirname, 'code', 'css')));
app.use('/code/js', express.static(path.join(__dirname, 'code', 'js')));
app.use('/code/json', express.static(path.join(__dirname, 'code', 'json')));
app.use('/code/php', express.static(path.join(__dirname, 'code', 'php')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'code', 'html', 'index.html'));
});

app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, 'code', 'html', 'faq.html'));
});

// PHP aqueles que sabem
app.get('/php/:file', (req, res) => {
    const phpPath = path.join(__dirname, 'code', 'php', req.params.file);
    if (fs.existsSync(phpPath)) {
        res.type('text/plain');
        res.sendFile(phpPath);
    } else {
        res.status(404).send('Arquivo PHP não encontrado');
    }
});

// json vei não mexe
app.get('/placeholdernames.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'code', 'json', 'placeholdernames.json'));
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'PFPedia Frontend' });
});

app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`olá eu sou a porta ${PORT}`);
    console.log(`olá eu sou o php funcional /code/php/pesquisa.php`);
    console.log(`olá eu sou o website http://localhost:${PORT}`);
});
