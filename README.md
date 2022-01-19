# ChatWeb

La commande chat d'[Anti Coupable](https://anticoupable.johanstickman.com), via navigateur.


## Tester le site

Vous pouvez accéder au site hebergé sur Vercel à [chatweb.johanstickman.com](https://chatweb.johanstickman.com).


## Fonctionnement

Vous entrez un message sur le site, ensuite :
- Votre message sera envoyé à l'API d'Anti coupable (anticoupable.johanstickman.com/api/ac-chat)
- L'API vérifiera si elle a la réponse à votre message :
  - Si elle a la réponse : elle vous la donnera
  - Sinon, vous aurez la possibilité d'ajouter votre réponse


## Démarrer sur son PC

*Git, NPM et NodeJS sont requis*

Un serveur web sera démarré sur votre appareil, vous pourrez y accéder depuis : http://127.0.0.1:3000

```
git clone https://github.com/johan-perso/chatweb
cd chatweb
npm install
npm run start
```


## Licence

MIT © [Johan](https://johanstickman.com)
