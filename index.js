// //////////////////// Bot Basics
const Discord = require('discord.js');
const client = new Discord.Client({ forceFetchUsers: true });
const { prefix, token, adminID, ytToken } = require('./config.json');
//* ********************Bot Basics

// //////////////////// Usefull Javascript Capabilities
const fs = require('fs');
const url = require('url');
const http = require('http');
const util = require('util');

//* ********************Usefull Javascript Capabilities

// //////////////////// Database Management
const sql = require('sqlite');
sql.open('./score.sqlite');
//* ********************Database Management

// //////////////////// Music Bot
const { YTSearcher } = require('ytsearcher');
const searcher = new YTSearcher(ytToken);
const yt = require('ytdl-core');
const google = require('google');
const roles = { 'fighter': 'Fighter', 'cleric': 'Cleric', 'paladin': 'Paladin', 'ranger': 'Ranger', 'wizard': 'Wizard', 'sorcerer': 'Sorcerer', 'bard': 'Bard', 'warlock': 'Warlock', 'rogue': 'Rogue', 'druid': 'Druid', 'barbarian': 'Barbarian', 'dm': 'DM' };



const queue = {};
const play = function(msg) {
	if (queue[msg.guild.id] === undefined) return msg.channel.send(`Add some songs to the queue first with ${prefix}add`);
	if (!msg.guild.voiceConnection) return commands.join(msg).then(() => commands.play(msg));
	if (queue[msg.guild.id].playing) return msg.channel.send('Already Playing');
	let dispatcher;
	queue[msg.guild.id].playing = true;

	console.log(queue);
	(function playing(song) {
		console.log(song);
		if (song === undefined) {
			return msg.channel.send('Queue is empty').then(() => {
				queue[msg.guild.id].playing = false;
				msg.member.voiceChannel.leave();
			});
		}
		msg.channel.send(`Playing: **${song.title}** as requested by: **${song.requester}**`);
		dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes: 2, volume: 0.6 });
		const collector = msg.channel.createCollector(m => m);
		collector.on('message', m => {
			if (m.content.startsWith(prefix + 'pause')) {
				msg.channel.send('paused').then(() => { dispatcher.pause(); });
			}
			else if (m.content.startsWith(prefix + 'resume')) {
				msg.channel.send('resumed').then(() => { dispatcher.resume(); });
			}
			else if (m.content.startsWith(prefix + 'skip')) {
				msg.channel.send('skipped').then(() => { dispatcher.end(); });
			}
			else if (m.content.startsWith('volume+')) {
				if (Math.round(dispatcher.volume * 50) >= 100) return msg.channel.send(`Volume: ${Math.round(dispatcher.volume * 50)}%`);
				dispatcher.setVolume(Math.min((dispatcher.volume * 50 + (2 * (m.content.split('+').length - 1))) / 50, 2));
				msg.channel.send(`Volume: ${Math.round(dispatcher.volume * 50)}%`);
			}
			else if (m.content.startsWith('volume-')) {
				if (Math.round(dispatcher.volume * 50) <= 0) return msg.channel.send(`Volume: ${Math.round(dispatcher.volume * 50)}%`);
				dispatcher.setVolume(Math.max((dispatcher.volume * 50 - (2 * (m.content.split('-').length - 1))) / 50, 0));
				msg.channel.send(`Volume: ${Math.round(dispatcher.volume * 50)}%`);
			}
			else if (m.content.startsWith(prefix + 'time')) {
				msg.channel.send(`time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000) / 1000) < 10 ? '0' + Math.floor((dispatcher.time % 60000) / 1000) : Math.floor((dispatcher.time % 60000) / 1000)}`);
			}
		});
		dispatcher.on('end', () => {
			collector.stop();
			playing(queue[msg.guild.id].songs.shift());
		});
		dispatcher.on('error', (err) => {
			return msg.channel.send('error: ' + err).then(() => {
				collector.stop();
				playing(queue[msg.guild.id].songs.shift());
			});
		});
	})(queue[msg.guild.id].songs.shift());
};
const commands = {
	'play': (msg) => {
		play(msg);
	},
	'join': (msg) => {
		return new Promise((resolve, reject) => {
			const voiceChannel = msg.member.voiceChannel;
			if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('I couldn\'t connect to your voice channel...');
			voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
			play(msg);
		});
	},

	'queue': (msg) => {
		if (queue[msg.guild.id] === undefined) return msg.channel.send(`Add some songs to the queue first with ${prefix}add`);
		const tosend = [];
		queue[msg.guild.id].songs.forEach((song, i) => { tosend.push(`${i + 1}. ${song.title} - Requested by: ${song.requester}`); });
		msg.channel.send(`__**${msg.guild.name}'s Music Queue:**__ Currently **${tosend.length}** songs queued ${(tosend.length > 15 ? '*[Only next 15 shown]*' : '')}\n\`\`\`${tosend.slice(0, 15).join('\n')}\`\`\``);
	},
	'helpmusic': (msg) => {
		const tosend = ['```xl', prefix + 'join : "Join Voice channel of msg sender"', prefix + 'add : "Add a valid youtube link to the queue"', prefix + 'queue : "Shows the current queue, up to 15 songs shown."', prefix + 'play : "Play the music queue if already joined to a voice channel"', '', 'the following commands only function while the play command is running:'.toUpperCase(), prefix + 'pause : "pauses the music"', prefix + 'resume : "resumes the music"', prefix + 'skip : "skips the playing song"', prefix + 'time : "Shows the playtime of the song."', 'volume+(+++) : "increases volume by 2%/+"', 'volume-(---) : "decreases volume by 2%/-"', '```'];
		msg.channel.send(tosend.join('\n'));
	},
	'reboot': (msg) => {
		if (msg.author.id == adminID) process.exit();
		// Requires a node module like Forever to work.
	},
};
//* ********************Music Bot


// //////////////////// List of Marvel Movies
const NEXT_MARVEL = [
    { when: new Date(2019, 2, 8), name: 'Captain Marvel' },
    { when: new Date(2019, 3, 26), name: 'Avengers 4' },
    { when: new Date(2019, 6, 7), name: 'Dark Phoenix' },
    { when: new Date(2019, 6, 5), name: 'Spider-Man: Far From Home' }
];
//* ********************List of Marvel Movies

// //////////////////// Purge Settings
let lastBulk = Date.now();
const cooldown = 20000;
//* ********************Purge Settings


// //////////////////// Help Embed
const instructions = {
	'content': 'This is a bot created by Keaton Sadoski',
	'embed': {
		'title': 'Commands',
		'description': '_',
		'url': 'https://discordapp.com',
		'color': 2865895,

		'footer': {
			'icon_url': 'https://cdn.discordapp.com/embed/avatars/0.png',
		},


		'author': {
			'name': 'Keabot',
			'url': 'https://discordapp.com',
			'icon_url': 'https://cdn.discordapp.com/embed/avatars/0.png',
		},
		'fields': [
			{
				'name': 'highnoon @[username]',
				'value': 'Starts a vote to kick a user from the server. Needs at least 3* votes to succeed',
			},
			{
				'name': 'senpai',
				'value': 'Adds the user to the "Degenerates" role',
			},
			{
				'name': 'vincent',
				'value': 'Sends a sexy pic of our boi Jared Fogle',
			},
			{
				'name': 'purge [integer]',
				'value': 'Deletes [integer] messages from that text channel\'s history with 2* votes. Limited to 25*',
			},
			{
				'name': 'level',
				'value': 'Informs the user of their level',
			},
			{
				'name': 'help',
				'value': 'Displays this message',
			},
			{
				'name': 'leaderboard',
				'value': 'Displays the current top 10',
			},
			{
				'name': 'helpmusic',
				'value': 'Displays the help message for the music player',
			},
			{
				'name': 'google',
				'value': 'Displays a few results related to what followed the command',
            },
            {
                'name': 'marvel',
                'value': 'Lists a few of the upcoming Marvel movies as well as their *current* release date',
            },
			{
				'name': '--NOTES--',
				'value': '*This number is subject to change.\nFeel free to suggest new features for the bot. ',
			}
		],
	},
};
//* ********************Help Embed


// ///^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^/////////
// ///////////////////////////////BOILER CODE///////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////


/* Startup */
console.log(`The current day is ${(new Date()).getDate()} of ${(new Date()).getMonth() + 1}`);
client.on('ready', () => {

	console.log('Ready!');

});


/* Records the messages*/
client.on('message', message=>{
	if (message.author.bot || util.isNull(message.guild)) return;

	console.log(`${message.author.username} sent in the ${message.channel.name} channel of the ${message.guild.name} server:`);
	console.log(message.content);
	console.log(message.createdAt);
	console.log('\n');


	const now = new Date();
	const chatLog = (now.getMonth() + 1) + '_' + message.guild.name;

    sql.run(`INSERT INTO "${chatLog}" VALUES (?, ?, ?, ?, ?, ?, ?)`, message.author.username, message.guild.name, message.channel.name, now.getDate(), now.getHours(), now.getMinutes(), message.content)
        .catch(() => {
            sql.run(`CREATE TABLE IF NOT EXISTS "${chatLog}" (sender TEXT, server TEXT, textChannel TEXT, day INTEGER, hour INTEGER, minute INTEGER, content TEXT)`).then(() => {
                sql.run(`INSERT INTO "${chatLog}" VALUES (?, ?, ?, ?, ?, ?, ?)`, message.author.username, message.guild.name, message.channel.name, now.getDate(), now.getHours(), now.getMinutes(), message.content);
            });
        });
    
});


/* ******Command Parser****** */
client.on('message', message => {


	// Looks for the prefix, ignores bots, and ignores DMs
	if (!message.content.startsWith(prefix) || message.author.bot || util.isNull(message.guild)) return;

	const args = message.content.toLowerCase().slice(prefix.length).split(' ');
	const command = args.shift().toLowerCase();
	// Command Parsing
	if (command === 'time') {
		const time = new Date();
		message.reply(time.getDate() + '_' + (time.getMonth() + 1) + '__' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds());
	}

	
	if (command === 'highnoon') {
		const victim = message.mentions.users.array();
		console.log(victim);
		if (victim.length === 0) return message.reply('You must choose a victim!');

		message.channel.send(`:ballot_box:  ${message.author.username} started a vote to purge ${victim}! React to my next message to vote on it. :ballot_box: `);
		const filter = (reaction) => reaction.emoji.name === '✅';
		message.channel.send(victim)
			.then(function(voteMessage) {
				voteMessage.react('✅');
				const collector = voteMessage.createReactionCollector(filter, { time: 10000 });
				collector.on('collect', r => console.log(`Collected ${r.emoji.name}`));
				collector.on('end', collected => {
					console.log(`Collected ${collected.size} items`);
					console.log(collected.first().count);
					message.channel.send(`We collected ${collected.first().count - 1} vote(s) to kick ${victim}`);
					if (collected.first().count < 4) {message.channel.send(`There were not enough votes. You needed ${4 - collected.first().count} more.`);}
					else {
						message.channel.send(`Dread it. Run from it. Destiny arrives all the same. ${victim} does not feel so good!`);
						message.mentions.members.first().kick();
					}
				});


			});


	

    }
   
    

    
        
    
    
	if (command == 'invite') {
		message.channel.createInvite().then(invite => {
			message.channel.send(invite.url);
		});
	}
	if (command === 'id') {
		message.reply(message.author.id);
	}

    //A homebrew function that I guess could be expanded to what you want. Currently sends a random picture of one of my friends to the chat
	if (command === 'vincent') {
		const num = (Math.floor(Math.random() * 29) + 1);
		const randFile = 'G:/Keaton/Discord/Vincent/' + num + '.jpg';
		const vinc = function() {
			message.channel.send({ files: [{
				attachment: randFile,
				name: 'file.jpg',
			}] });
		};

		vinc();

	}

	if (command === 'purge') {
		const numDel = Number(args[0]);
		// console.log("The boolean to delete is " + isNaN(numDel));
		if(isNaN(numDel)) return message.channel.send('Input a number');
		if(!args[0]) return message.channel.send('You need to enter a number of messages to delete');
		if(args[0] > 25) return message.channel.send('That is way too many messages!');
		console.log(`Time is ${Date.now()}`);
		if(Date.now() - lastBulk < cooldown) return message.channel.send('It\'s too soon for that');
		message.channel.send(`:ballot_box:  ${message.author.username} started a vote to purge ${args[0]} message(s) from the recent chat! React to my next message to vote on it. :ballot_box: `);
		const filter = (reaction) => reaction.emoji.name === '✅';
		message.channel.send('Delete Messages?')
			.then(function(voteMessage) {
				voteMessage.react('✅');
				const collector = voteMessage.createReactionCollector(filter, { time: 10000 });
				collector.on('collect', r => console.log(`Collected ${r.emoji.name}`));
				collector.on('end', collected => {
					console.log(`Collected ${collected.size} items`);
					console.log(collected.first().count);
					message.channel.send(`We collected ${collected.first().count - 1} vote(s) to purge`);
					if (collected.first().count < 3) {message.channel.send(`There were not enough votes. You needed ${3 - collected.first().count} more.`);}
					else {

						message.channel.bulkDelete(numDel + 4);
						message.channel.send('Down the drain they go!');
						lastBulk = Date.now();
					}
				});
			});

	}
    //Part of the point system. Displays current level. Progress bar is a little broken bc of ascii sizing
	if (command === 'level') {
		sql.get(`SELECT * FROM scores WHERE userId = ${message.author.id} AND server = ${message.guild.id}`).then(row => {
			if (!row) return message.reply('Your current level is 0');
            message.reply(`Your current level is ${row.level}`);
            var progressBar = '[';
            var difference = Math.pow(2 * (row.level + 1), 2) - Math.pow(2 * (row.level), 2);
            var current = row.points - Math.pow(2 * (row.level), 2);
            var status = Math.floor(50 * current / difference);
            console.log(Math.pow(2 * (row.level + 1), 2), Math.pow(2 * (row.level), 2), difference, current, status);
            for (k = 0; k < status; k++) {
                progressBar = progressBar + '=';
            }
            k = 0;
            for (k = 0; k < 50 - status; k++) {
                progressBar = progressBar + '-';
            }
            progressBar = progressBar + ']';
            message.channel.send(progressBar);
        });
       
	}

	if (command === 'levelup') {
		message.reply('Ugh');
		sql.get(`SELECT * FROM scores WHERE userId = ${message.author.id} AND server = ${message.guild.id}`).then(row => {
			sql.run(`UPDATE scores SET points = ${row.points + 5} WHERE userId = ${message.author.id} AND server = ${message.guild.id}`);
		});
	}

	if (command === 'help') {
		message.author.send(instructions);
	}
    // Adds a song after a selection is made by the requester
	if (command === 'add') {
		searcher.search(args.join(' '), { 'type': 'video' }).then(function(result) {
			console.log(result.currentPage[0].url);
			const resultEmbed = new Discord.RichEmbed;
			let j;
			for (j = 0; j < 5; j++) {
				console.log(result.currentPage[j]);
				if(typeof result.currentPage[j] != 'undefined') resultEmbed.addField(`${j + 1}`, result.currentPage[j].title);
			}
			resultEmbed.addField('6', 'None of these work!');
			message.channel.send(resultEmbed);
			const filter2 = (m) => (m.author === message.author && (m.content > 0 && m.content < 7));
			const selection = new Discord.MessageCollector(message.channel, filter2, { maxMatches: 1 });
			selection.on('end', collected => {


				const selected = parseInt(collected.first().content);
				if (selected == 6) {
					message.channel.send('Oops! Sorry!');
					return;
				}
				const newURL = result.currentPage[selected - 1].url;
				if (newURL == '' || newURL === undefined) return message.channel.send('The url for this video is either broken or missing. Let Keaton know');

				yt.getInfo(newURL, (err, info) => {
					if (err) return message.channel.send('Invalid YouTube Link: ' + err);
					if (!queue.hasOwnProperty(message.guild.id)) queue[message.guild.id] = {}, queue[message.guild.id].playing = false, queue[message.guild.id].songs = [];
					queue[message.guild.id].songs.push({ url: newURL, title: info.title, requester: message.author.username });
					message.channel.send(`added **${info.title}** to the queue`);
					commands.play(message);
				});

			});
		});
	}
    // A pretty narrow implementation of a self-assigning role command. Only works with the roles object but could be expanded to work with -any- role they want
    if (command === 'role') {
        member = message.member
        if (roles.hasOwnProperty(args[0])) {
            channelRoles = message.channel.guild.roles;
            specRole = channelRoles.find(val => val.name === roles[args[0]]);
            member.addRole(specRole);
        }
        else {
            message.channel.send('Try that again with a real role');
        }
    }

    if (command === 'unrole') {
        member = message.member
        if (roles.hasOwnProperty(args[0])) {
            channelRoles = message.channel.guild.roles;
            specRole = channelRoles.find(val => val.name === roles[args[0]]);
            member.removeRole(specRole);
        }
        else {
            message.channel.send('Try that again with a real role');
        }
    }

	if (commands.hasOwnProperty(command)) commands[command](message);

	if (command === 'leaderboard') {
		const embedBoard = new Discord.RichEmbed();
		sql.all(`SELECT username, points, level FROM scores WHERE server = ${message.guild.id} ORDER BY points DESC`).then((scores) => {

			// console.log(scores);
			let i;
			for (i = 0; i < Math.min(5, scores.length); i++) {
				embedBoard.addField(`${i + 1}.`, scores[i].username + ' with level ' + scores[i].level);
			}
			message.channel.send(embedBoard);

		});
	}
    // Self explanatory
	if (command === 'marvel') {

		NEXT_MARVEL.forEach(function(movie) {
			message.channel.send(`${movie.name} comes out ${movie.when.toString().slice(0, 15)}.`);

		});
	}

	

	


});

/* *************KeyWord Detection ********** */
client.on('message', message => {
	const content = message.content;
	
    //Inside joke. Not necessary
	if (content.indexOf('money heist') != -1) {
		message.channel.send('What\'s that?');
	}
	
});


/* *************Image Saver********** */
//This is a part of the complete message log system. This way you know what people sent even if they deleted it
client.on('message', message => {
	if(message.attachments.first() == null || message.author.bot) return;
	if(message.channel.id === '473657746043043880' || message.channel.id === '390334492369485824' || message.channel.id === '473655313216831488') return;
	const this_url = message.attachments.first().proxyURL;
	const DOWNLOAD_DIR = 'G:/Keaton/Discord/Images/';

	// Function to download file using HTTP.get
	const download_file_httpget = function(file_url) {
		const options = {
			hostname: url.parse(file_url).host,
			protocol: 'http:',
			port: 80,
			path: url.parse(file_url).pathname,
		};
		const currentTime = new Date();
		const file_name = `${message.author.username}_${currentTime.getMonth() + 1}_${currentTime.getDate()}_${currentTime.getSeconds()}` + file_url.slice(file_url.length - 4);

		const file = fs.createWriteStream(DOWNLOAD_DIR + file_name);

		http.get(options, function(res) {

			const { statusCode } = res;
			const contentType = res.headers['content-type'];
			console.log(`Received ${contentType}`);
			let error;
			if (statusCode !== 200) {
				error = new Error('Request Failed.\n' +
                                `Status Code: ${statusCode}`);
			}

			if (error) {
				console.error(error.message);
				// consume response data to free up memory
				res.resume();
				return;
			}

			console.log('Successfully found image');
			res.on('data', (data) => {
				file.write(data);
				console.log('Image Data');
			});
			res.on('end', () => {
				file.end();
				console.log('Image finished downloading');
			});


		});
	};
	download_file_httpget(this_url);
});


/* Point System */
client.on('message', message => {
	if (message.author.bot || util.isNull(message.guild)) return;
	// Ignore bots and DMs.
	if (message.channel.type === 'dm') return;
	// Ignore DM channels.
	sql.get(`SELECT * FROM scores WHERE userId = ${message.author.id} AND server = ${message.guild.id}`).then(row => {
		if (!row) {
			// Can't find the row.
			sql.run(`INSERT INTO scores (userId, points, level, username, server) VALUES (${message.author.id}, 1, 0, ?, ?)`, message.author.username, message.guild.id);
			console.log("Cant find the row");
		}
		else {
			// Can find the row.
			sql.run(`UPDATE scores SET points = ${row.points + 1} WHERE userId = ${message.author.id} AND server = ${message.guild.id}`);
			const curLevel = Math.floor(0.5 * Math.sqrt(row.points + 1));
			if (curLevel > row.level) {
				row.level = curLevel;
				sql.run(`UPDATE scores SET points = ${row.points + 1}, level = ${row.level} WHERE userId = ${message.author.id}`);
                if (message.guild.id != 551872410379354134) {
                    message.reply(`You've leveled up to level **${curLevel}**!`);
                }
			}
			// console.log("I found the row");
			// console.log(`The points are ${row.points}`);
		}
	}).catch(() => {
		console.log('Catch error');
		sql.run('CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER, level INTEGER, username TEXT, server TEXT)').then(() => {
			sql.run(`INSERT INTO scores (userId, points, level, username, server) VALUES (${message.author.id}, 1, 0, ?, ?)`, message.author.username, message.guild.id);
		});
	});
});


client.login(token);
/* Error Handling and Exit */
client.on('error', error => {
	console.error(error);
});
process.on('unhandledRejection', err => console.error(`Uncaught Promise Rejection: \n${err.stack}`));
process.on('uncaughtException', err => console.error(`There was an error here: ${err.stack}`));

process.on('SIGINT', () => {
	console.log('Closing the bot!');
	process.exit();

});