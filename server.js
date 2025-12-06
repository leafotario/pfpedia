const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/css', express.static(path.join(__dirname, 'code', 'css')));
app.use('/js', express.static(path.join(__dirname, 'code', 'js')));
app.use('/json', express.static(path.join(__dirname, 'code', 'json')));
app.use('/php', express.static(path.join(__dirname, 'code', 'php')));

app.get('/fonts/:file', (req, res) => {
    const fontPath = path.join(__dirname, 'assets', 'fonts', req.params.file);
    if (fs.existsSync(fontPath)) {
        res.sendFile(fontPath);
    } else {
        res.status(404).send('Fonte não encontrada');
    }
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
            .replace(/href="\.\.\/\.\.\/assets\//g, 'href="/assets/');
        
        
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


app.get('/php/:filename', (req, res) => {
    const phpPath = path.join(__dirname, 'code', 'php', req.params.filename);
    
    if (fs.existsSync(phpPath)) {
        res.type('text/html');
        res.sendFile(phpPath);
    } else {
        res.status(404).send('Arquivo PHP não encontrado');
    }
});

app.all('/pesquisa.php', (req, res) => {
    const phpPath = path.join(__dirname, 'code', 'php', 'pesquisa.php');
    
    if (fs.existsSync(phpPath)) {
        res.type('text/html');
        

        if (req.method === 'POST') {
            fs.readFile(phpPath, 'utf8', (err, data) => {
                if (err) {
                    res.sendFile(phpPath);
                    return;
                }
                
                const debugInfo = `
                    <!-- DEBUG INFO -->
                    <div style="background:#f0f0f0; padding:10px; margin:20px; border:1px solid #ccc;">
                        <h3>Informações do Formulário:</h3>
                        <p><strong>Método:</strong> ${req.method}</p>
                        <p><strong>Personagem pesquisado:</strong> ${req.body.personagem || req.query.personagem || '(não especificado)'}</p>
                        <p><strong>Nota:</strong> PHP não está sendo executado no Render. Para funcionalidade completa, você precisará de um servidor com PHP.</p>
                    </div>
                `;
                
                // Inserir no final do body
                const modifiedPHP = data.replace('</body>', debugInfo + '</body>');
                res.send(modifiedPHP);
            });
        } else {
            res.sendFile(phpPath);
        }
    } else {

        res.send(`
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Pesquisa - PFPedia</title>
                <link rel="stylesheet" href="/css/geral.css">
                <link rel="stylesheet" href="/css/barra.css">
                <style>
                    .search-results {
                        max-width: 800px;
                        margin: 50px auto;
                        padding: 20px;
                    }
                    .result-item {
                        background: white;
                        padding: 20px;
                        margin: 15px 0;
                        border-radius: 10px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    }
                </style>
            </head>
            <body style="background-color: #fff7b1;">
                <div class="search-results">
                    <h1>Resultados da Pesquisa</h1>
                    <p><strong>Termo buscado:</strong> ${req.query.personagem || '(nenhum)'}</p>
                    <p><em>Nota: O sistema PHP não está disponível no momento. Esta é uma página temporária.</em></p>
                    
                    <div class="result-item">
                        <h3>Exemplo de resultado 1</h3>
                        <p>Categoria: Anime</p>
                    </div>
                    
                    <div class="result-item">
                        <h3>Exemplo de resultado 2</h3>
                        <p>Categoria: Games</p>
                    </div>
                    
                    <a href="/" style="display:inline-block; margin-top:20px; padding:10px 20px; background:#ffea98; border-radius:5px;">
                        ← Voltar para Home
                    </a>
                </div>
            </body>
            </html>
        `);
    }
});

app.get('/placeholdernames.json', (req, res) => {
    const jsonPath = path.join(__dirname, 'code', 'json', 'placeholdernames.json');
    
    if (fs.existsSync(jsonPath)) {
        res.type('application/json');
        res.sendFile(jsonPath);
    } else {

app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'PFPedia',
        timestamp: new Date().toISOString(),
        php_support: 'static_only',
        note: 'PHP files are served as static files. For full PHP execution, use a PHP hosting service.'
    });
});

app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Página não encontrada - PFPedia</title>
            <link rel="stylesheet" href="/css/geral.css">
            <style>
                .error-container {
                    text-align: center;
                    padding: 100px 20px;
                }
                .error-title {
                    font-family: "Litebulb";
                    font-size: 72px;
                    color: #333;
                    margin-bottom: 20px;
                }
                .back-link {
                    display: inline-block;
                    margin-top: 30px;
                    padding: 15px 30px;
                    background: #ffea98;
                    border-radius: 10px;
                    text-decoration: none;
                    font-family: "Litebulb";
                    font-size: 24px;
                    color: #333;
                }
            </style>
        </head>
        <body style="background-color: #fff7b1;">
            <div class="error-container">
                <h1 class="error-title">404</h1>
                <p style="font-size: 24px;">Página não encontrada</p>
                <a href="/" class="back-link">Voltar para Home</a>
            </div>
        </body>
        </html>
    `);
});



app.listen(PORT, () => {
    console.log(`
    olá`);
});
