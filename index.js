// Importer FS et path
const fs = require('fs');
const path = require('path');

// Préparer un serveur web avec express.js
const express = require('express');
const app = express();
app.disable('x-powered-by');

// Modifier les éléments d'une page
function editPage(pageCode){
	return pageCode.replace(/{chatweb_version_number}/g, require('./package.json').version)
}

// Route - page d'accueil
app.get('/', async (req, res) => {
	res.send(editPage(fs.readFileSync(path.join(__dirname, 'public', 'index.html')).toString()))
})

// Route - script.js
app.get('/script.js', async (req, res) => {
	res.set('Content-Type', 'text/plain').send(editPage(fs.readFileSync(path.join(__dirname, 'public', 'script.js')).toString()))
})

// Routes - erreur 404
app.get('*', async (req, res) => {
	res.send(editPage(fs.readFileSync(path.join(__dirname, 'public', '404.html')).toString()))
})
app.post('*', async (req, res) => {
	res.send({ error: true, message: "Route non trouvé" });
})

// Démarrer le serveur web
const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Serveur web démarré sur le port ${server.address().port}`);
});