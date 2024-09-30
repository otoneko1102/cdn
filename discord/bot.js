const { Client } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const {
  DISCORD_TOKEN,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_BRANCH,
  GITHUB_TOKEN,
  YOUR_URL,
} = require('../discord/config');

const client = new Client({ intents: [53608447] });

const generateRandomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.id !== client.user.id) return;

  if (message.content.startsWith('o.save')) {
    const args = message.content.split(' ');
    const filenameArg = args[1];

    if (message.reference) {
      const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);

      if (repliedMessage.attachments.size > 0) {
        const attachment = repliedMessage.attachments.first();
        const fileUrl = attachment.url;
        const fileExtension = path.extname(attachment.name); // 拡張子を取得
        const mimeType = attachment.contentType; // MIMEタイプを取得

        let fileName;
        if (filenameArg) {
          fileName = filenameArg + fileExtension;
        } else {
          const randomFileName = generateRandomString(10);
          fileName = randomFileName + fileExtension;
        }

        let folderPath;
        if (mimeType.startsWith('image/')) {
          folderPath = 'img/';
        } else if (mimeType.startsWith('video/')) {
          folderPath = 'vid/';
        } else if (mimeType.startsWith('audio/')) {
          folderPath = 'aud/';
        } else {
          folderPath = 'oth/';
        }

        const fullPath = folderPath + fileName;

        try {
          const response = await axios.get(fileUrl, {
            responseType: 'arraybuffer',
          });

          const content = Buffer.from(response.data).toString('base64');

          const githubUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fullPath}`;
          await axios.put(githubUrl, {
            message: `Add ${fullPath} from Discord`,
            content: content,
            branch: GITHUB_BRANCH,
          }, {
            headers: {
              Authorization: `token ${GITHUB_TOKEN}`,
              'Content-Type': 'application/json',
            },
          });

          const fileUrlOnGithubPages = YOUR_URL + fullPath;

          message.reply(`Uploading this file to ${fileUrlOnGithubPages}\n-# Please wait...`);
        } catch (error) {
          console.error('Error uploading file:', error);
          message.reply('Error.');
        }
      } else {
        message.react('❌');
      }
    }
  } else if (message.content.startsWith('o.delete')) {
    const args = message.content.split(' ');
    const filePath = args[1];

    if (!filePath) {
      return message.react('❌');
    }

    try {
      const getFileUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
      const fileResponse = await axios.get(getFileUrl, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      const fileSHA = fileResponse.data.sha;

      const deleteUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
      await axios.delete(deleteUrl, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        data: {
          message: `Delete ${filePath} from Discord`,
          sha: fileSHA,
        },
      });

      message.reply(`Deleting ${filePath} from CDN`);
    } catch (error) {
      console.error('Error deleting file:', error);
      message.reply('Error.');
    }
  }
});

client.login(DISCORD_TOKEN);
