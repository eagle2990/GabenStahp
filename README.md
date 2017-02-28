# GabenStahp

Powered by [![Webtask.io]()](https://webtask.io)

---

Simple API to know how much money you would have if you wouldn't have used Steam at all

Includes:
  - Total hours you have played **ALL** your games
  - Current amount of money for **ALL** your games (it doesn't include in-game purchases)
  - How much money you would have right now if you would have worked the total amount of hours played.

### Installation
Follow this in case you want to deploy it in your own webtask.io:

```bash
$ git clone ...
$ npm install typings wt wt-bundle nodemon ts-node -g
$ npm install

# Change the value of the STEAM_API_KEY inside package.json in {"scripts": { ..., "deploy": ...} } 
# You can get one key in http://steamcommunity.com/dev/apikey
```
### Deployment
Make sure you have set up your own **STEAM_API_KEY** or it will show errors. You can get one key in http://steamcommunity.com/dev/apikey
```bash
$ npm run deploy
```
### Usage
You need to include the variables **_username_** and  **min_wage_hour**.
* **username**: This should be the value of your community id. This one is the same value that appears in the url when you access your steam profile (http://steamcommunity.com/id/community_id/)
* **min_wage_hour**: The minimum wage per hour in the city/state/country you live in. It's not necessary the currency as it's taken form your steam location.
 
---
Warning
---
This API was made just for regular steam users. Game developers or users that have access to games not included in the shop will throw some errors.

# Example
https://wt-4f399db08be369de673abf7e75aad7f7-0.run.webtask.io/GabenStahp?username=ProfileID&min_wage_hour=Number
[Steam Profile](https://wt-4f399db08be369de673abf7e75aad7f7-0.run.webtask.io/GabenStahp?username=eagle2990&min_wage_hour=3.91)

### Todos

 - Code cleaning

License
----

MIT.

**Please just use it to have fun, not for illegal purposes.**

**Free Software, Hell Yeah!**