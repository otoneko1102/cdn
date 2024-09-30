# cdn
Discordからの遠隔アップロード

## How to Use
```bash
npm init -y
npm i axios discord.js@13
```

```json
"dependencies": {
  "axios": "^1.7.7",
  "discord.js": "^13.17.1"
}
```

### config.jsの作成
discord/example.config.jsを参考に作成<br>
GitHubのトークンにはrepo権限を付与してください

### bot.jsの作成
configの適切なファイルパスを渡してください<br>
Self Botで作成する場合は<br>
`discord.js --> discord.js-selfbot-v13`<br>
`({ intents: [...] }) --> ({ checkUpdate: false })`<br>
のように変更<br>
Discord Botで作成する場合はそのままで大丈夫です
