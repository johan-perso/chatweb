// Importer quelques librairies
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Préparer un serveur web avec express.js
const express = require('express');
const app = express();
app.disable('x-powered-by');
var cookieParser = require('cookie-parser');
app.use(cookieParser());

// Vérifier si la plateforme est censé être down
isDown = false;
async function checkDown(){
	// Fetch pour obtenir la liste des maintenances
	var listDown = await fetch(`https://johanstickman.com/api/listDown?from=chatweb`).then(res => res.json()).catch(err => { return "retry" })
	if(listDown === "retry") return setTimeout(() => checkDown(), 5000);

	// Obtenir le statut de ce service
	if(listDown.advancedInfo) var platformDown = listDown.advancedInfo.filter(function(item) { return item.name === 'chatweb'; });

	// Modifier la variable isDown en fonction du statut
	if(platformDown[0]?.down === true) isDown = true; else isDown = false;

	// Refaire la vérification de temps en temps
	if(isDown) setTimeout(checkDown, 60000);
	if(!isDown) setTimeout(checkDown, 120000);

	// Retourner le statut
	return isDown;
}; checkDown();


// Modifier les éléments d'une page
function editPage(pageCode){
	return pageCode.replace(/{chatweb_version_number}/g, require('./package.json').version)
}

// Route - page d'accueil
app.get('/', async (req, res) => {
	if(isDown === true) return res.status('503').send(editPage(fs.readFileSync(path.join(__dirname, 'public', 'down.html')).toString()).replace('{colorTheme}',req?.cookies?.theme))
	res.send(editPage(fs.readFileSync(path.join(__dirname, 'public', 'index.html')).toString()).replace('{colorTheme}',req?.cookies?.theme))
})

// Route - script.js
app.get('/script.js', async (req, res) => {
	if(isDown === true) return res.status('503').send("console.log('ChatWeb est actuellement en maintenance')")
	res.set('Content-Type', 'text/plain').send(editPage(fs.readFileSync(path.join(__dirname, 'public', 'script.js')).toString()))
})

// Routes - erreur 404
app.get('*', async (req, res) => {
	if(isDown === true) return res.status('503').send(editPage(fs.readFileSync(path.join(__dirname, 'public', 'down.html')).toString()).replace('{colorTheme}',req?.cookies?.theme))
	res.send(editPage(fs.readFileSync(path.join(__dirname, 'public', '404.html')).toString()).replace('{colorTheme}',req?.cookies?.theme))
})
app.post('*', async (req, res) => {
	if(isDown === true) return res.status('503').send({ error: true, message: "ChatWeb est actuellement en maintenance", code: 99 })
	res.send({ error: true, message: "Route non trouvé" });
})

// Démarrer le serveur web
const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Serveur web démarré sur le port ${server.address().port}`);
});
