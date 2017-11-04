var keys = require('./keys.js')
var Twitter = require('twitter')
var Spotify = require('node-spotify-api')
var Request = require('request')
var fs = require('fs')
var readDone = false

var command = process.argv.slice(2)
var defaultSong = 'The Sign Ace of Base'
var defaultMovie = 'Mr Nobody'
var properInput = false
var possibleCommands = ['my-tweets', 'spotify-this-song', 'movie-this', 'do-what-it-says']
//init client keys to communicate with various apis
var twitClient = new Twitter ({
	consumer_key: keys['twitterKeys']['consumer_key'],
	consumer_secret: keys['twitterKeys']['consumer_secret'],
	access_token_key: keys['twitterKeys']['access_token_key'],
	access_token_secret: keys['twitterKeys']['access_token_secret'],
})
var spotClient = new Spotify ({
	id: keys['spotifyKeys']['id'],
	secret: keys['spotifyKeys']['secret']
})

//check user command
if (command.length > 2 || command.length === 0 || possibleCommands.indexOf(command[0]) === -1) {
	console.log('INVALID COMMAND!!!!')
} else {
	properInput = true
}

var getMovie = function(movie) {
	var key = keys['OMDB']['api_key']
	Request('http://www.omdbapi.com/?apikey='+key+'&t='+movie, function (error, response, body) {
		var info = JSON.parse(response.body)
		console.log("Title: "+info.Title)
		console.log('Year: '+info.Year)
		for (var i = 0; i < info.Ratings.length; i++) {
			if (info.Ratings[i].Source === 'Internet Movie Database') {
				console.log('IMDB Rating: '+info.Ratings[i].Value)
			} 
			else if (info.Ratings[i].Source === 'Rotten Tomatoes') {
				console.log('RT Rating: '+info.Ratings[i].Value)
			}
		}
		console.log('Location(s): '+info.Country)
		console.log('Language(s): '+info.Language)
		console.log('Plot: '+info.Plot)
		console.log('Actor(s): '+info.Actors)
	})
}


var getTweets = function() {
	twitClient.get('statuses/user_timeline.json?count=20', function(error, tweets, response) {
		for (var i = 0; i < tweets.length; i++) {
			console.log("TWEETED ON: " + tweets[i]['created_at'] + ":")
			console.log("********** " + tweets[i]['text']) 
		}
	})
}

var getSong = function(song) {
	spotClient.search({ type: 'track', query: song, limit: 1 }, function(err, data) {
		console.log("Title: " + data.tracks.items[0].name)
		console.log("Artist(s): " + data.tracks.items[0].artists[0].name)
		console.log("Album: " + data.tracks.items[0].album.name)
		console.log("Link: " + data.tracks.items[0].external_urls.spotify)
	})
}

var getRand = function() {
	fs.readFile('random.txt', 'utf-8', function(err, data) {
		readDone = true
		command = data.split('"')
		command[0] = command[0].replace(',','')
		if (command.length === 1) {
			command[0] = command[0].replace(/\r?\n|\r/g, '')
			initLIRI(readDone)
		} else if (command.length === 3) {
			command.splice(command.length-1)
			command[0] = command[0].trim()
			initLIRI(readDone)
		} else {
			console.log('INVALID TEXT IN RANDOM.TXT')
		}
	})
}

var initLIRI = function(isRead) {
	if (properInput) {
		commandIndex = possibleCommands.indexOf(command[0])
		if (command.length === 1) {
			if (commandIndex === 0) {
				getTweets()
			}
			else if (commandIndex === 1) {
				getSong(defaultSong)
			}
			else if (commandIndex === 2) {
				getMovie(defaultMovie)
			}
			else if (!isRead) {
				getRand()
			}
		} else {
			if (commandIndex === 1) {
				if (!isRead) {
					var userSong = command[1].split('').join('')
					getSong(userSong)
				} else {
					getSong(command[1])
				}
			}
			else if (commandIndex === 2) {
				if (!isRead) {
					var userMovie = command[1].split('').join('')
					getMovie(userMovie)
				} else {
					getMovie(command[1])
				}
			}
		}
	}
}

initLIRI(readDone)