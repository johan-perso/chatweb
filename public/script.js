// Quand la page a fini de charger, mettre le focus sur l'input
window.onload = function () {
	document.getElementById("input_question").focus()
}

// Fonction pour obtenir le chemin de la page
function getPath(){
	return (window.location.pathname.replace(/\//g,"").replace(/#/g,"") === "") ? "index" : window.location.pathname.replace(/\//g,"").replace(/#/g,"")
}

// Raccourcis clavier
onkeydown = function(e){
	// "Entrer" pour continuer
	if(getPath() === "index" && e.key === 'Enter'){
		e.preventDefault();
		if(Array.from(document.getElementById('chooseAnswerDiv').classList).includes("hidden")){
			askQuestion(document.getElementById('input_question').value);
		} else {
			setAnswer(document.getElementById('input_question').value, document.getElementById('input_answer').value);
		}
	}

	// CTRL+A pour tout sélectionner
	if(getPath() === "index" && e.ctrlKey && e.key === 'a'){
		if(!Array.from(document.getElementById('chooseAnswerDiv').classList).includes("hidden")){
			document.getElementById('input_answer').focus();
			document.getElementById('input_answer').select();
		} else {
			document.getElementById('input_question').focus();
			document.getElementById('input_question').select();
		}
	}
}

// Fonction pour parse du markdown (codepen.io/kvendrik/pen/Gmefv)
function parseMarkdown(md){
	// Citation
	md = md.replace(/^\>(.+)/gm, '<cite>$1</cite>');
	md = md.replace(/^&gt;(.+)/gm, '<cite>$1</cite>');
	md = md.replace(/^&lt;(.+)/gm, '<cite>$1</cite>');

	// Style d'écriture (gras, italique)
	md = md.replace(/[\*]{2}([^\*]+)[\*]{2}/g, '<b>$1</b>');
	md = md.replace(/[\_]{2}([^\_]+)[\_]{2}/g, '<u>$1</u>');
	md = md.replace(/[\*\_]{1}([^\*\_]+)[\*\_]{1}/g, '<i>$1</i>');
	md = md.replace(/[\~]{2}([^\~]+)[\~]{2}/g, '<del>$1</del>');

	// Liens
	md = md.replace(/[\[]{1}([^\]]+)[\]]{1}[\(]{1}([^\)\"]+)(\"(.+)\")?[\)]{1}/g, '<a class="text-blue-400" href="$2" title="$4">$1</a>');

	// Pre
	md = md.replace(/^\s*\n\`\`\`(([^\s]+))?/gm, '<pre class="$2">');
	md = md.replace(/^\`\`\`\s*\n/gm, '</pre>\n\n');

	// Code
	md = md.replace(/[\`]{1}([^\`]+)[\`]{1}/g, '<code>$1</code>');

	// Saut de ligne
	md = md.replace(/\n/g, '<br>')

	// strip p from pre
	md = md.replace(/(\<pre.+\>)\s*\n\<p\>(.+)\<\/p\>/gm, '$1$2');

	// Retourner le texte
	return md;
}

// Fonction pour poser une question à Anti Coupable
async function askQuestion(question){
	// Vérifier si la question est donné
	if(question.length === 0) return document.getElementById("errorMessage").innerText = 'Veuillez entrer une question.'

	// Masquer la réponse précédente
	document.getElementById("answerDiv").classList.add("hidden")

	// Enlever le message d'erreur et la réponse précédente
	document.getElementById("errorMessage").innerText = ''
	document.getElementById("answerText").innerText = ''

	// Afficher un logo de chargement au bouton
	document.getElementById('askButton_icon_send').style.display = 'none'
	document.getElementById('askButton_icon_loading').style.display = 'block'

	// Faire une requête pour obtenir la réponse à la question
	var answer = await fetch('https://anticoupable.johanstickman.com/api/ac-chat', { method: 'POST', body: new URLSearchParams({ message: question }) }).then(res => res.json())

	// Afficher la réponse
	if(!answer.error) document.getElementById("answerDiv").classList.remove("hidden")
	if(!answer.error) document.getElementById("answerText").innerHTML = parseMarkdown(answer?.response?.toString()
		.replace(/{username}/g, 'toi')
		.replace(/#{discriminator}/g, '')
		.replace(/{discriminator}/g, '')
		.replace(/{time_HH}/g, new Date().getHours())
		.replace(/{time_mm}/g, new Date().getMinutes())
		.replace(/{time_ss}/g, new Date().getSeconds())
		.replace(/{date_dd}/g, new Intl.DateTimeFormat('fr', { weekday: 'long' }).format(new Date()))
		.replace(/{date_DD}/g, new Date().getDate())
		.replace(/{date_MM}/g, new Intl.DateTimeFormat('fr', { month: 'long' }).format(new Date()))
		.replace(/{date_mm}/g, new Date().getMonth() + 1)
		.replace(/{date_YYYY}/g, new Date().getFullYear())
		.replace(/{username}/g, 'toi')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
	)

	// Enlever le logo de chargement
	document.getElementById('askButton_icon_send').style.display = 'block'
	document.getElementById('askButton_icon_loading').style.display = 'none'

	// Si aucune réponse n'a été donné, en demander une
	if(answer.error){
		// Mettre l'input de la question en read only
		document.getElementById("input_question").readOnly = true

		// Afficher un div
		document.getElementById("chooseAnswerDiv").classList.remove("hidden")

		// Désactiver le bouton pour poser la question
		document.getElementById("askButton").disabled = true

		// Ajouter le focus sur l'autre input
		document.getElementById("input_answer").focus()
	}
}


// Fonction pour définir une réponse à une question à Anti Coupable
async function setAnswer(question, answer){
	// Vérifier si la question est donné
	if(question.length === 0) return document.getElementById("errorMessage").innerText = 'Veuillez entrer une question.'
	if(answer.length === 0) return document.getElementById("errorMessage").innerText = 'Veuillez entrer une réponse : elle sera utilisé par Anti Coupable.'

	// Masquer la réponse précédente
	document.getElementById("answerDiv").classList.add("hidden")

	// Enlever le message d'erreur et la réponse précédente
	document.getElementById("errorMessage").innerText = ''
	document.getElementById("answerText").innerText = ''

	// Afficher un logo de chargement au bouton
	document.getElementById('answerButton_icon_send').style.display = 'none'
	document.getElementById('answerButton_icon_loading').style.display = 'block'

	// Faire une requête pour obtenir la réponse à la question
	var setResponse = await fetch('https://anticoupable.johanstickman.com/api/set-ac-chat', { method: 'POST', body: new URLSearchParams({ question: question, answer: answer }) }).then(res => res.json())

	// Afficher la réponse
	if(!setResponse.error) document.getElementById("answerDiv").classList.remove("hidden")
	if(!setResponse.error) document.getElementById("answerText").innerText = setResponse.response

	// Enlever le logo de chargement
	document.getElementById('answerButton_icon_send').style.display = 'block'
	document.getElementById('answerButton_icon_loading').style.display = 'none'

	// Si il y a une erreur, afficher l'erreur
	if(setResponse.error) document.getElementById("errorMessage").innerText = setResponse.message

	// Réautoriser les modifications de la question
	document.getElementById("input_question").readOnly = false
	document.getElementById("askButton").disabled = false
	document.getElementById("chooseAnswerDiv").classList.add("hidden")

	// Mettre le focus sur l'input
	document.getElementById("input_question").focus()
}