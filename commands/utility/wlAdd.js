const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
const { RCONClient } = require('@minecraft-js/rcon');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add to WhiteList!')
        .addStringOption(option =>
            option.setName('nick')
                .setDescription('player name')
                .setRequired(true)
        ),
    async execute(interaction) {
        const playerNick = interaction.options.getString('nick');
        if (!interaction.member.roles.cache.has(config.roleId)) {
            return await interaction.reply({ content: `You can't use this command!`, ephemeral: true });
        }

        const rcon = new RCONClient(config.rconIp, config.rconPass, config.rconPort);

        rcon.on('authenticated', async () => {
            try {
                await rcon.executeCommandAsync(`${config.command} ${playerNick}`);
                console.log(`Player ${playerNick} added!`);
                await interaction.reply({ content: `Player ${playerNick} added!`, ephemeral: true });
            } catch (err) {
                console.error(`Failed to execute RCON command: ${err}`);
                await interaction.reply({ content: `Failed to add player ${playerNick}. Please try again later.`, ephemeral: true });
            } finally {
                rcon.disconnect();
            }
        });

        rcon.on('error', (err) => {
            console.error('RCON connection error:', err);
            interaction.reply({ content: 'Failed to connect to the server. Please try again later.', ephemeral: true });
        });

        try {
            await rcon.connect();
        } catch (err) {
            console.error('Failed to connect to RCON:', err);
            await interaction.reply({ content: 'Failed to connect to the server. Please try again later.', ephemeral: true });
        }
    },
};
