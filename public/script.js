// Quand la page a fini de charger
window.onload = async function (){
	// Modifier le thème par rapport au stockage local
	if(getCookie('theme') !== null) document.documentElement.setAttribute('data-theme', getCookie('theme'))

	// Si le thème est celui par défaut, modifier par rapport à la date
	if(getCookie('theme') === null){
		// Le jour d'halloween
		if(new Date().getMonth() == 9 && new Date().getDate() == 31){
			document.documentElement.setAttribute('data-theme', 'halloween')
		}

		// Le jour de la saint valentin
		if(new Date().getMonth() == 1 && new Date().getDate() == 14){
			document.documentElement.setAttribute('data-theme', 'valentine')
		}

		// Le 1er avril
		if(new Date().getMonth() == 3 && new Date().getDate() == 1){
			document.documentElement.setAttribute('data-theme', 'aqua')
		}
	}

	// Mettre le focus sur l'input
	document.getElementById("input_question").focus()

	// Si il y a un paramètre dans l'URL, le vérifier
	if(new URLSearchParams(window.location.search).get('message')){
		// Afficher un toast
		document.body.insertAdjacentHTML('beforeend', `<div id="toast-loading_from_params" class="animate__animated animate__fadeIn animate__fast absolute top-2 right-2 flex items-center w-full p-4 rounded-lg shadow text-gray-400 bg-gray-800" style="max-width: 21.5rem;" role="alert"><div id="toastBG-loading_from_params" class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-blue-800 text-blue-200"><i id="toastIcon-loading_from_params" class="fas fa-info"></i></div><div id="toastText-loading_from_params" class="ml-3 text-sm font-normal">Obtention du message à partir de l'URL...</div></div>`);

		// Afficher la réponse au message
		await askQuestion(new URLSearchParams(window.location.search).get('message'))

		// Modifier l'input pour ajouter le message
		document.getElementById('input_question').value = new URLSearchParams(window.location.search).get('message')

		// Modifier l'icône et le texte du toast
		document.getElementById('toastIcon-loading_from_params').classList.replace('fa-info', 'fa-check');
		document.getElementById('toastBG-loading_from_params').classList.replace('bg-blue-800', 'bg-green-500');
		document.getElementById('toastText-loading_from_params').innerText = "Obtention du message à partir de l'URL"

		// Enlever le toast au bout de quelques instants
		setTimeout(() => {
			document.getElementById('toast-loading_from_params').classList.replace('animate__fadeIn', 'animate__fadeOut');
			setTimeout(() => {
				document.getElementById('toast-loading_from_params').remove();
			}, 500);
		}, 2600);
	}
}

// Fonction pour obtenir le chemin de la page
function getPath(){
	return (window.location.pathname.replace(/\//g,"").replace(/#/g,"") === "") ? "index" : window.location.pathname.replace(/\//g,"").replace(/#/g,"")
}

// Fonction pour changer de thème
function changeTheme(themeName){
	// Si le thème est déjà choisi, annuler
	if(themeName === document.documentElement.getAttribute('data-theme')) return;

	// Mettre une animation
	document.documentElement.classList.add('animate__animated','animate__fadeOut','animate__faster')

	// Modifier le thème (stockage local)
	if(themeName !== "default") setCookie('theme', themeName);
	if(themeName === "default") setCookie('theme', '', -1)

	// Au bout de 700 ms, modifier le thème (visuellement)
	setTimeout(() => {
		if(themeName !== "default") document.documentElement.setAttribute('data-theme', themeName)
		if(themeName === "default") document.documentElement.setAttribute('data-theme','')
	}, 700)

	// Au bout de 1250 ms, enlever l'animation (et donc réafficher la page)
	setTimeout(() => {
		document.documentElement.classList.remove('animate__animated','animate__fadeOut','animate__faster')
		document.documentElement.classList.add('animate__animated','animate__fadeIn','animate__faster')
	}, 1250)
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
	md = md.replace(/^&gt; (.+)/gm, '<blockquote class="border-l-4 border-gray-400 px-2 py-1">$1</blockquote>');

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
	if(question?.toString()?.replace(/ /g,'')?.length === 0) return document.getElementById("errorMessage").innerText = 'Veuillez entrer une question.'

	// Masquer la réponse précédente
	document.getElementById("answerDiv").classList.add("hidden")

	// Enlever le message d'erreur et la réponse précédente
	document.getElementById("errorMessage").innerText = ''
	document.getElementById("answerText").innerText = ''

	// Afficher un logo de chargement au bouton
	document.getElementById('askButton_icon_send').style.display = 'none'
	document.getElementById('askButton_icon_loading').style.display = 'block'

	// Faire une requête pour obtenir la réponse à la question
	var answer = await fetch('https://anticoupable.johanstick.me/api/ac-chat', { method: 'POST', body: new URLSearchParams({ message: question }) }).then(res => res.json())

	// Modifier certains éléments du message (placeholder et markdown vers HTML);
	answer.message = parseMarkdown(answer?.response?.toString()
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
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
	)

	// Si la réponse est trop longue, la couper
	if(answer.message.length > 500) answer.message = `${answer.message.substring(0, 500)}...<br><a id="showCompleteAnswerButton" href="javascript:void(0)" class="text-center font-semibold text-blue-400">Afficher plus</a>`

	// Afficher la réponse
	if(!answer.error) document.getElementById("answerDiv").classList.remove("hidden")
	if(!answer.error) document.getElementById("answerText").innerHTML = answer.message

	// Rendre le texte "Afficher plus" cliquable
	if(document.getElementById("showCompleteAnswerButton")) document.getElementById("showCompleteAnswerButton").setAttribute('onclick', `showCompleteAnswer('${answer?.response?.toString().replace(/'/g,'&apos;').replace(/"/g,'&quot;').replace(/\(/g,'&lpar;').replace(/\)/g,'&rpar;').replace(/>/g,'&gt;')}')`)

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

// Fonction pour afficher une réponse complète
function showCompleteAnswer(answerText){
	return document.getElementById("answerText").innerHTML = parseMarkdown(answerText?.toString()
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
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
	)
}


// Fonction pour définir une réponse à une question à Anti Coupable
async function setAnswer(question, answer){
	// Vérifier si la question est donné
	if(question?.toString()?.replace(/ /g,'')?.length === 0) return document.getElementById("errorMessage").innerText = 'Veuillez entrer une question.'
	if(answer?.toString()?.replace(/ /g,'')?.length === 0) return document.getElementById("errorMessage").innerText = 'Veuillez entrer une réponse : elle sera utilisé par Anti Coupable.'

	// Masquer la réponse précédente
	document.getElementById("answerDiv").classList.add("hidden")

	// Enlever le message d'erreur et la réponse précédente
	document.getElementById("errorMessage").innerText = ''
	document.getElementById("answerText").innerText = ''

	// Afficher un logo de chargement au bouton
	document.getElementById('answerButton_icon_send').style.display = 'none'
	document.getElementById('answerButton_icon_loading').style.display = 'block'

	// Faire une requête pour obtenir la réponse à la question
	var setResponse = await fetch('https://anticoupable.johanstick.me/api/set-ac-chat', { method: 'POST', body: new URLSearchParams({ question: question, answer: answer }) }).then(res => res.json())

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

// Konami code pour avoir un... thème
new Konami(() => {
	// Demander une confirmation
	var confirm = window.confirm("Voulez-vous activer le mode \"thème aléatoire\" (changement de thème toutes les secondes) ?");
	if(!confirm) return;

	// Préparer une liste avec tout les thèmes
	var allThemes = ['light','dark','cupcake','emerald','synthwave','retro','valentine','halloween','aqua','bumblebee','garden','forest']

	// Fonction pour afficher tout les thèmes
	function showThemes(){
		allThemes.forEach((theme,i) => {
			setTimeout(() => { document.documentElement.setAttribute('data-theme', allThemes[Math.floor(Math.random() * allThemes.length)]) }, i * 1000)
		})
	}; showThemes();

	// Changer de thèmes en boucle
	setInterval(() => {
		showThemes()
	}, allThemes.length * 1000)
});

// Fonction pour définir un cookie
function setCookie(name, value, days=999){
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + ";";
}

// Fonction pour obtenir un cookie
function getCookie(name){
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++){
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
