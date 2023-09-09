# ChatWeb

La commande chat d'[Anti Coupable](https://anticoupable.johanstick.fr), via navigateur.


## Tester le site

Le site n'est plus disponible. L'api non plus.


## Fonctionnement

Vous entrez un message sur le site, ensuite :
- Votre message sera envoyé à l'API d'Anti coupable (anticoupable.johanstick.fr/api/ac-chat)
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

MIT © [Johan](https://johanstick.me)
