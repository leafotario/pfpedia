require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const axios = require('axios');

const app = express();
const PORT = process.env.WEB_SERVER_PORT || 3000;

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'pfpedia-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === 'production'
    }
}));

const requireAuth = (req, res, next) => {
    if (!req.session.user && req.path !== '/login') {
        return res.redirect('/login');
    }
    next();
};

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.use(express.static(__dirname));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/css', express.static(path.join(__dirname, 'code', 'css')));
app.use('/js', express.static(path.join(__dirname, 'code', 'js')));

const API_URL = process.env.API_URL || 'http://localhost:4000';

app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    
    const htmlPath = path.join(__dirname, 'code', 'html', 'login.html');
    if (fs.existsSync(htmlPath)) {
        return res.sendFile(htmlPath);
    }
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>PFPedia - Login</title>
            <link rel="stylesheet" href="/css/global.css">
            <style>
                .login-container {
                    max-width: 400px;
                    margin: 100px auto;
                    padding: 40px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    text-align: center;
                }
                .discord-login-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    background: #5865F2;
                    color: white;
                    padding: 15px 30px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 16px;
                    transition: all 0.3s ease;
                    border: none;
                    cursor: pointer;
                    width: 100%;
                    margin-top: 20px;
                }
                .discord-login-btn:hover {
                    background: #4752C4;
                    transform: translateY(-2px);
                }
                .logo {
                    font-size: 2.5em;
                    margin-bottom: 20px;
                    color: #333;
                }
            </style>
        </head>
        <body>
            <div class="login-container">
                <div class="logo">PFPedia</div>
                <h2>Entrar na sua conta</h2>
                <p>Faça login com sua conta do Discord para acessar a PFPedia</p>
                
                <a href="/auth/discord" class="discord-login-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .085.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    Entrar com Discord
                </a>
                
                <div style="margin-top: 30px; font-size: 14px; color: #666;">
                    <p>Não compartilhamos seus dados</p>
                    <p>Login 100% seguro via Discord</p>
                    <p>Apenas lemos: nome, avatar e email</p>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.get('/auth/discord', (req, res) => {
    const scopes = ['identify', 'email'].join('%20');
    const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI)}&response_type=code&scope=${scopes}&prompt=none`;
    res.redirect(discordUrl);
});

app.get('/auth/discord/callback', async (req, res) => {
    const { code, error } = req.query;
    
    if (error) {
        return res.redirect('/login?error=' + error);
    }
    
    if (!code) {
        return res.redirect('/login?error=no_code');
    }
    
    try {
        const tokenParams = new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.DISCORD_REDIRECT_URI
        });
        
        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            tokenParams.toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
        });
        
        req.session.user = {
            id: userResponse.data.id,
            username: userResponse.data.username,
            discriminator: userResponse.data.discriminator,
            avatar: userResponse.data.avatar,
            email: userResponse.data.email,
            verified: userResponse.data.verified,
            mfa_enabled: userResponse.data.mfa_enabled,
            locale: userResponse.data.locale,
            loggedAt: new Date()
        };
        
        console.log(` Usuário logado: ${req.session.user.username}#${req.session.user.discriminator}`);
        
        res.redirect('/');
        
    } catch (error) {
        console.error('Erro na autenticação Discord:', error.response?.data || error.message);
        res.redirect('/login?error=auth_failed');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

const serveHtml = (filePath, res, options = {}) => {
    const fullPath = path.join(__dirname, 'code', 'html', filePath);
    
    fs.readFile(fullPath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Erro ao ler ${filePath}:`, err);
            return res.status(404).send('<h1>404 - Arquivo não encontrado</h1>');
        }
        
        let correctedHtml = data
            .replace(/href="\.\.\/css\//g, 'href="/css/')
            .replace(/src="\.\.\/js\//g, 'src="/js/')
            .replace(/src="\.\.\/\.\.\/assets\//g, 'src="/assets/')
            .replace(/href="\.\.\/\.\.\/assets\//g, 'href="/assets/')
            .replace(/action="\.\.\/php\/pesquisa\.php"/g, 'action="/pesquisa.html"');

        if (options.injectScript) {
            correctedHtml = correctedHtml.replace('</body>', options.injectScript + '</body>');
        }

        res.send(correctedHtml);
    });
};

app.get('/', (req, res) => {
    serveHtml('index.html', res, {
        injectScript: req.session.user ? `
            <div style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
                <a href="/logout" style="background: #5865F2; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    Logout
                </a>
            </div>
        ` : `
            <div style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
                <a href="/login" style="background: #5865F2; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    Login
                </a>
            </div>
        `
    });
});

app.get('/pesquisa.html', requireAuth, (req, res) => {
    serveHtml('pesquisa.html', res, {
        injectScript: `
            <script>
                window.API_URL = '${API_URL}';
                window.USER_ID = '${req.session.user.id}';
            </script>
            <script src="/js/pesquisa.js"></script>
            <div style="position: fixed; top: 20px; right: 20px; background: white; padding: 10px 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="https://cdn.discordapp.com/avatars/${req.session.user.id}/${req.session.user.avatar}.png?size=32" 
                         style="width: 32px; height: 32px; border-radius: 50%;">
                    <span>${req.session.user.username}</span>
                    <a href="/logout" style="margin-left: 10px; color: #ff4757; text-decoration: none;">Sair</a>
                </div>
            </div>
        `
    });
});

app.get('/faq', (req, res) => {
    serveHtml('faq.html', res);
});

app.get('/regras.html', (req, res) => {
    serveHtml('regras.html', res);
});

app.get('/signup.html', (req, res) => {
    if (req.session.user) return res.redirect('/');
    serveHtml('signup.html', res);
});

app.get('/uploadpfp.html', requireAuth, (req, res) => {
    serveHtml('uploadpfp.html', res);
});

app.get('/api/user', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Não autenticado' });
    }
    res.json(req.session.user);
});

app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'PFPedia Web Server',
        authenticated: !!req.session.user,
        timestamp: new Date().toISOString()
    });
});

app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>404</title></head>
        <body style="background:#fff7b1; text-align:center; padding:100px 20px; font-family: sans-serif;">
            <h1 style="color: #333;">404 - Page Not Found</h1>
            <a href="/" style="color: #5865F2; text-decoration: none; font-weight: bold;">← Back to Home</a>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`eu acho isso um pouco intuitivo http://localhost:${PORT}`);
    console.log(`VOCÊ NÃO VAI ACREDITAR CARA: http://localhost:${PORT}/login`);
});