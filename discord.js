import Discord from 'discord'

const client = new Discord.Client({ intents: ['Guilds', 'GuildMessages'] })

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`)
})
client.once('ready', () => {
  console.log('Discord Bot is ready!')
})
client.on('message', (message) => {
  // check if the message is not from the bot
  if (message.author.bot) return

  // if it is not from the bot, say hello world
  message.channel.send('Hello World')
})
