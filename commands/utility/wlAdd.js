const { SlashCommandBuilder } = require('discord.js')
const fs = require('node:fs');
const path = require('node:path');
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
const { RCONClient } = require('@minecraft-js/rcon');
const rcon = new RCONClient(config.rconIp, config.rconPass, config.rconPort);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Add to WhiteList!')
        .addStringOption( option =>
            option.setName('nick')
                .setDescription('player name')
                .setRequired(true)),
	async execute(interaction) {
        const playerNick = interaction.options.getString('nick');
        if (!interaction.member.roles.cache.has(config.roleId)) {
            return await interaction.reply({ content: `You can't use this command!`, ephemeral: true })
        }
        rcon.connect();
        rcon.on('authenticated', () => {
            // Do stuff
            rcon.executeCommandAsync(`${config.command} ${playerNick}`);
            rcon.disconnect();
        });
        rcon.on('error', () => {
            // Do stuff
            rcon.disconnect();
            console.log('Connection missed!')
          });
        console.log(`Player ${playerNick} added!`)
        await interaction.reply({ content: `Player ${playerNick} added!`, ephemeral: true})
	},  
};  