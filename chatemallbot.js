
'use strict'
const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController
const tg = new Telegram.Telegram('246385012:AAHjqmkB4PzEAhpufTxtDU1Ny6t_VkJ5AaY')
var word = 'test';
var timerobj;
var http = require('http');
var _ = require('underscore');
var fs = require('fs');
var moment = require('moment');
var chatId = '';
var POKEDEX = JSON.parse(fs.readFileSync('pokemon.txt','utf8'));

//https://www.pokeradar.io/api/v1/submissions?deviceId=489da47062f111e6a071c57b8686fab6&minLatitude=1.3851723602991843&maxLatitude=1.3984721919326875&minLongitude=103.72419834136963&maxLongitude=103.7682294845581&pokemonId=0
//min : 1.283287, 103.813580
//max : 1.284551, 103.820331


//var geoloc = 'minLatitude=1.379938212500962&maxLatitude=1.3989012175086133&minLongitude=103.72072219848633&maxLongitude=103.76964569091797';

var cckloc = 'minLatitude=1.381397&maxLatitude=1.396885&minLongitude=103.739545&maxLongitude=103.753460';
var bmcloc = 'minLatitude=1.283287&maxLatitude=1.284551&minLongitude=103.813580&maxLongitude=103.820331';

var geoloc = cckloc;
var range = 0.005;

var options = {
  host: '50.112.198.230',
  path: '/api/v1/submissions?'+geoloc,
  method:'GET'
};
var rarePokemon = [2,3,4,5,6,8,9,26,31,34,36,38,40,45,51,53,57,59,62,64,65,67,68,71,75,76,78,82,86,87,89,91,93,94,95,97,101,103,106,107,112,113,131,134,135,136,137,140,141,142,143,148,149];
rarePokemon = _.sortBy(rarePokemon, function(num) {return num;});
var commonPokemon = [16,17,19,20,13,14,10,11,21,23,29,32,41,46,48,69,72,79,84,98,129,116,120];
var sentList = [];
// 0.005 degree = 555m

function handleData(response){
	console.log(geoloc + ' - received response at : ' + new Date());
	var str = '';
	//another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
	 
    str += chunk;
  });

  
  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
	var pokeList = JSON.parse(str).data;
	console.log(pokeList.length);
	
	var removedNoise = _.filter(pokeList, function(pokemon){
		//if(_.contains(commonPokemon, pokemon.pokemonId)) return false;		
		if((pokemon.latitude+"").length>8) return false;
		if(pokemon.trainerName == '(Poke Radar Prediction)' && _.contains(rarePokemon, pokemon.pokemonId)  && !_.contains(sentList, pokemon.id)) return true;
		//return true;
	});
	
	console.log(removedNoise.length);
	
	_.each(removedNoise, function(pokemon){		
		sentList.push(pokemon.id);
		var time = moment(new Date(Number(pokemon.created+"000")+(1000 * 60 * 15))).format('hh:mm:ss');		
		var googlelocation = 'https://www.google.com.sg/maps/place/'+pokemon.latitude+','+pokemon.longitude;
		tg.api.sendMessage(chatId,POKEDEX[Number(pokemon.pokemonId)-1].name + " at " +googlelocation+" until "+ time );
	});
		
		
  })
  
};
function catchthemall(){
	try{
		http.request(options, handleData).end();
	}catch(err){
		console.log(err);
	}
}

function setLocation(lat, lon){
	// 0.005 degree = 555m
	
	var lat = Number(lat);
	var longi = Number(lon);
	var minLatitude = lat - range;
	var maxLatitude = lat + range;
	var minLongitude = longi - range;
	var maxLongitude = longi + range;
	geoloc = 'minLatitude='+minLatitude.toFixed(6)+'&maxLatitude='+maxLatitude.toFixed(6)+'&minLongitude='+minLongitude.toFixed(6)+'&maxLongitude='+maxLongitude.toFixed(6);
	
}

//setInterval( catchthemall, 1000*60*3);

class PingController extends TelegramBaseController {
    /**
     * @param {Scope} $
     */
	
    pingHandler($) {
		word = 'abc';		
        $.sendMessage(word);
    }
	startScan($){
		console.log('start');
		chatId = $._chatId;
		if(!timerobj){
			catchthemall();
			timerobj = setInterval(catchthemall, 1000*60);
			$.sendMessage('Scan Started');
		}else{
			$.sendMessage('Already Scaning');
		}
	}
	
	stopScan($){
		clearInterval(timerobj);
		timerobj = null;
		$.sendMessage('Scan stoped');
	}
	setLocation($){
		setLocation($.query.lat, $.query.lon);		
	}
	setFavLocation($){
		console.log($.query.place);
		var favPlace = $.query.place;
		
		switch(favPlace){
			case "cck":
				geoloc = cckloc;
				$.sendMessage('Location set to CCK');
				break;
			case "bmc":
				geoloc = bmcloc;
				$.sendMessage('Location set to BMC');				
				break;
			default:
				$.sendMessage('Duno whats that location name');				
				break;
		}
	}
	printFilterList($){
		var list = [];
		_.each(rarePokemon, function(pokemonId){
			list.push(POKEDEX[pokemonId-1].name);
		});
		$.sendMessage(list.join('\n'));
		
	}
	addPokemonById($){
		var id = Number($.query.id);
		if(_.contains(rarePokemon, id)){
			$.sendMessage(id + ' existed in list');
		}else{
			rarePokemon.push(id);
			rarePokemon = _.sortBy(rarePokemon, function(num) {return num;});
			$.sendMessage(id + ' successfully added');
		}
	}
	deletePokemonById($){
		var id = Number($.query.id);
		var index = rarePokemon.indexOf(id);
		if(index == -1){
			$.sendMessage(id + ' does not exist in list');
		}else{
			rarePokemon.splice(index, 1);			
			$.sendMessage(id + ' successfully deleted');
		}
	}
	setRange($){
		//in metres
		var meter = Number($.query.range);
		var degree = (0.001/111) * meter;
		$.sendMessage(meter + ' m = '+degree+' degree');
		range = degree;
		
	}
    get routes() {
        return {
            '/ping': 'pingHandler',
			'/start': 'startScan',
			'/stop':	'stopScan',
			'/location :lat :lon' : 'setLocation',
			'/fav :place' : 'setFavLocation',
			'/list': 'printFilterList',
			'/add :id': 'addPokemonById',
			'/delete :id' : 'deletePokemonById',
			'/setRange :range' : 'setRange'
        }
    }
}

tg.router
    .when(['/ping','/start','/stop','/location :lat :lon','/fav :place','/list','/add :id','/delete :id','/setRange :range'], new PingController())