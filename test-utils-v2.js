'use strict';

/***
 * Exported functions to be used in the testing scripts.
 */
module.exports = {
  uploadImageBody,
  genNewUser,
  genNewUserReply,
  genNewHouse,
  selectUser,
  selectUserSkewed,
  decideNextAction,
  selectHouse,
  selectRental,
  selectQuestion,
  random20,
  random50,
  random70,
  random80,
  random90,
  genNewHouseReply,
  //genNewUserReply2
  storeUserList,
  getRandomLocation,
  selectRandomHouseUserSkewed,
  selectRandomRentalHouseSkewed,
  getRandomCost,
  storeUserHousesList,
  selectRandomHouse,
  setRandomText
}

const { faker } = require('@faker-js/faker');
const fs = require('fs')

//sometimes we will need to fetch userid given nickname and vice versa
/*
const usersNickToId = new Map();
const usersIdToNick = new Map();
const nickPass = new Map();
*/
const usersList = [];
const userHouses = [];
const userRentals = [];

// const userHouses = new Map();

var imagesIds = []
var images = []

//stores user ids (not nicknames)
var users = []
var housesIds = []


const locations = ["Lisbon","Porto","Madeira","Azores","Algarve","Braga","Coimbra","Evora","Aveiro","Leiria"]

/*
// All endpoints starting with the following prefixes will be aggregated in the same for the statistics
var statsPrefix = [ ["/rest/media/","GET"],
			["/rest/media","POST"],
			["/rest/user", "POST"],
			["/rest/house", "POST"]
	]

// Function used to compress statistics
global.myProcessEndpoint = function( str, method) {
	var i = 0;
	for( i = 0; i < statsPrefix.length; i++) {
		if( str.startsWith( statsPrefix[i][0]) && method == statsPrefix[i][1])
			return method + ":" + statsPrefix[i][0];
	}
	return method + ":" + str;
}*/

// Auxiliary function to select an element from an array
Array.prototype.sample = function(){
	   return this[Math.floor(Math.random()*this.length)]
}

// Auxiliary function to select an element from an array
Array.prototype.sampleSkewed = function(){
	return this[randomSkewed(this.length)]
}

// Returns a random date
function randomDate() {
	let n = random(13);
	if( n == 0)
		return "12-2023";
	if( n < 10)
		return " " + n.toString()+ "-2024";
	else
		return n.toString()+ "-2024";
}


// Returns a random value, from 0 to val
function random( val){
	return Math.floor(Math.random() * val)
}

// Returns a random value, from 0 to val
function randomSkewed( val){
	let beta = Math.pow(Math.sin(Math.random()*Math.PI/2),2)
	let beta_left = (beta < 0.5) ? 2*beta : 2*(1-beta);
	return Math.floor(beta_left * val)
}

// Loads data about images from disk
function loadData() {
	var i
	var basefile
	if( fs.existsSync( '/images')) 
		basefile = '/images/house.'
	else
		basefile =  'images/house.'	
	for( i = 1; i <= 40 ; i++) {
		var img  = fs.readFileSync(basefile + i + '.jpg')
		images.push( img)
	}
	var str;
	if( fs.existsSync('users.data')) {
		str = fs.readFileSync('users.data','utf8')
		users = JSON.parse(str)
	} 
}

loadData();

/**
 * Sets the body to an image, when using images.
 */
function uploadImageBody(requestParams, context, ee, next) {
	requestParams.body = images.sample()
	return next()
}

/**
 * Process reply of the download of an image. 
 * Update the next image to read.
 */
function processUploadReply(requestParams, response, context, ee, next) {
	if( typeof response.body !== 'undefined' && response.body.length > 0) {
		imagesIds.push(response.body)
	}
    return next()
}

/**
 * Select an image to download.
 */
function selectImageToDownload(context, events, done) {
	if( imagesIds.length > 0) {
		context.vars.imageId = imagesIds.sample()
	} else {
		delete context.vars.imageId
	}
	return done()
}

/**
 * Select an image to download.
 */
function selectUser(context, events, done) {
	if( userIds.length > 0) {
		context.vars.userId = userIds.sample()
	} else {
		delete context.vars.userId
	}
	return done()
}

function getRandomLocation(context, events, done){
	context.vars.location = locations.sample()
	return done()
}

function setRandomText(context, events, done){
	context.vars.randText = `${faker.lorem.paragraph()}`
	return done();

}

/**
 * Generate data for a new user using Faker
 */
/*
function genNewUser(context, events, done) {
	const first = `${faker.person.firstName()}`
	const last = `${faker.person.lastName()}`
	context.vars.userid = first + "." + last
	context.vars.name = first + " " + last
	context.vars.pwd = `${faker.internet.password()}`
	return done()
}*/
function genNewUser(context, events, done) {
	console.log("User list size: " + usersList.length)

	console.log("hi hi hi")
	const first = `${faker.person.firstName()}`
	const last = `${faker.person.lastName()}`
	//userid is the nickname
	context.vars.nickname = first + "." + last + "." + `${faker.number.int(1000000)}`
	context.vars.email = `${faker.internet.email()}` + "@" + first + ".com"
	context.vars.name = first + " " + last
	context.vars.pwd = `${faker.internet.password()}`
	return done()
}


/**
 * Process reply for of new users to store the id on file
 */
/*
function genNewUserReply(requestParams, response, context, ee, next) {
	if( response.statusCode >= 200 && response.statusCode < 300 && response.body.length > 0)  {
		let u = JSON.parse( response.body)
		users.push(u)
		fs.writeFileSync('users.data', JSON.stringify(users));
	}
    return next()
}*/
function genNewUserReply(requestParams, response, context, ee, next) {
	console.log("we out user reply")
	if( response.statusCode >= 200 && response.statusCode < 300 && response.body.length > 0)  {
		//let u = JSON.parse( response.body)
		console.log("we in user reply")
		//context.vars.userid is the nickname

		let resp = response.body.split(" - ", 7);
		let id = resp[1];

		//so we have the link between id and nickname
		usersList.push({id: id, nickname: context.vars.nickname, pass: context.vars.pwd});
		/*
		usersIdToNick.set(id, context.vars.userid);
		usersNickToId.set(context.vars.userid, id);
		//here we store the password for that nickname
		nickPass.set(context.vars.userid, context.vars.pwd)
		*/

		//context.vars.usernick = context.vars.userid;
		//context.vars.actualuserid = response.body.split(" - ", 7)[1];

		/*
		usersList.forEach((user) => {
			console.log(`user - ${user.id} | ${user.nickname} | ${user.pass}`);
		});*/
		

		//fs.writeFileSync('users.data', JSON.stringify(usersList.forEach((u) => {(u.id).toString()})));
	}
    return next()
}



function genNewHouseReply(requestParams, response, context, ee, next) {
	console.log("we out house reply")
	//console.log("hello world");
	//console.log("response body:" + response.body);
	if( response.statusCode >= 200 && response.statusCode < 300 && response.body.length > 0)  {
		//let u = JSON.parse( response.body)
		console.log("we in house reply")
		//console.log("good quality hello world")
		let resp = response.body.split(" - ", 7)
		let id = resp[1]
		//console.log("house id:" + id);

		context.vars.houseIdExtracted = id;

		userHouses.push({houseId: id, ownerId: context.vars.userId, houseName: context.vars.houseName});

		//console.log("house id vars:" + context.vars.houseIdExtracted);
		//users.push(id)
		//fs.writeFileSync('users.data', JSON.stringify(users));
		//users.push(u)
		//fs.writeFileSync('users.data', JSON.stringify(users));
	}
    return next()
}

/**
 * Generate data for a new house using Faker
 */
function genNewHouse(context, events, done) {
	console.log("bons dias")
	context.vars.houseName = `${faker.lorem.words({ min: 1, max: 3 })}`
	context.vars.location = locations.sample()
	context.vars.description = `${faker.lorem.paragraph()}`
	context.vars.cost = random(500) + 200;
	context.vars.discount = 0.1;
	if( random(20) == 0)
		context.vars.discount = random(5) * 10;
	return done()
}

/**
 * Select user
 */
function selectUser(context, events, done) {
	if( users.length > 0) {
		let user = users.sample()
		context.vars.user = user.id
		context.vars.pwd = user.pwd
	} else {
		delete context.vars.user
		delete context.vars.pwd
	}
	return done()
}

function storeRandomUserRentals(requestParams, response, context, ee, next){
	if( response.statusCode >= 200 && response.statusCode < 300 && response.body.length > 0)  {
		//let u = JSON.parse( response.body)
		let rentals = JSON.parse(response.body)
		rentals.forEach((rawrental) => {
			userRentals.push(rawrental)
		 })
	}
	return next();
}

function storeUserList(requestParams, response, context, ee, next){
	if( response.statusCode >= 200 && response.statusCode < 300 && response.body.length > 0)  {
		//let u = JSON.parse( response.body)
		let user = JSON.parse(response.body)
		users.forEach((rawUser) => {
			usersList.push({id: rawUser.id, nickname: rawUser.nickName, pass: rawUser.hashedPassword})
		 })
		usersList.push(user)
		console.log("end of list processing")
		console.log(usersList)
	}
	return next();
}

function storeUserHousesList(requestParams, response, context, ee, next){
	if( response.statusCode >= 200 && response.statusCode < 300 && response.body.length > 0)  {
		//let u = JSON.parse( response.body)
		let houses = JSON.parse(response.body)
		houses.forEach((rawHouse) => {
			userHouses.push(rawHouse)
		 });
		console.log("end of house processing")
	}
	return next();
}

function selectRandomRentalHouseSkewed(context, events, done){
	//random rental
	randomHouseRentals = []
	userRentals.forEach((rawRental) => {
		if (rawRental.houseId == context.vars.randomUserHouse.id){
			randomHouseRentals.push(rawRental)
		}
	});

	context.vars.randomUserRental = randomHouseRental.sampleSkewed();
}

function selectRandomHouse(context, events, done){
	context.vars.randomSelectedHouse = userHouses.sampleSkewed();
	return done();
}

function selectRandomHouseUserSkewed(context, events, done){
	//random house
	randomUserHouses = []
	console.log("randomuserhouses")
	userHouses.forEach((rawHouse) => {
		if (rawHouse.ownerId == context.vars.skewedUserid){
			randomUserHouses.push(rawHouse)
		}
	});
	if (randomUserHouses.length >= 1){
		context.vars.randomUserHouse = randomUserHouses.sampleSkewed();
	}
	console.log("randomuserhouses length: " + randomUserHouses.length)

	return done();
}


/**
 * Select user
 */
function selectUserSkewed(context, events, done) {
	console.log("skewed");
	/*usersList.forEach((user) => {
		console.log(`user - ${user.id} | ${user.nickname} | ${user.pass}`);
	});*/

	if( usersList.length > 0) {
		//this has the actual id, not nickname
		let user =  usersList.sampleSkewed()

		context.vars.skewedUserid = user.id;
		console.log(user.toString());
		context.vars.skewedLoggedName = user.nickname;
		context.vars.skewedLoggedPassword = user.pass;
		//console.log("user skewed vars: " + context.vars.userid + ";"
		//+ context.vars.loggedName + ";" + context.vars.loggedPassword)
	
	} else {
		delete context.vars.user
		delete context.vars.pwd
	}
	console.log("Just before leaving: " + context.vars.skewedUserid)
	return done()
}

function getRandomUser(context, events, done){
	context.vars.userid = users.sampleSkewed().id;
	return done()
}

function getRandomCost(context, events, done){
	context.vars.cost = random(500) + 200;
	return done()
}


/**
 * Select house from a list of houses
 * assuming: user context.vars.user; houses context.vars.housesLst
 */
function selectHouse(context, events, done) {
	delete context.vars.value;
	if( typeof context.vars.user !== 'undefined' && typeof context.vars.housesLst !== 'undefined' && 
			context.vars.housesLst.constructor == Array && context.vars.housesLst.length > 0) {
		let house = context.vars.housesLst.sample()
		context.vars.houseId = house.id;
		context.vars.owner = house.owner;
	} else
		delete context.vars.houseId
	return done()
}

/**
 * Select rental from a list of rentals
 * assuming: user context.vars.user; rentals context.vars.rentalsLst
 */
function selectRental(context, events, done) {
	delete context.vars.value;
	if( typeof context.vars.user !== 'undefined' && typeof context.vars.rentalsLst !== 'undefined' && 
			context.vars.rentalsLst.constructor == Array && context.vars.rentalsLst.length > 0) {
		let rental = context.vars.rentalsLst.sample()
		context.vars.rentalId = rental.id;
		context.vars.owner = rental.owner;
		context.vars.houseId = rental.house;
	} else
		delete context.vars.rentalId
	return done()
}

/**
 * Select question from a list of question
 * assuming: user context.vars.user; questions context.vars.questionLst
 */
function selectQuestion(context, events, done) {
	delete context.vars.value;
	if( typeof context.vars.user !== 'undefined' && typeof context.vars.questionLst !== 'undefined' && 
			context.vars.questionLst.constructor == Array && context.vars.questionLst.length > 0) {
		let question = context.vars.questionLst.sample()
		context.vars.questionId = question.id;
		context.vars.owner = question.owner;
		context.vars.houseId = question.house;
		context.vars.reply = `${faker.lorem.paragraph()}`;
	} else
		delete context.vars.questionId
	return done()
}


/**
 * Decide next action
 * 0 -> browse popular
 * 1 -> browse recent
 */
function decideNextAction(context, events, done) {
	delete context.vars.auctionId;
	let rnd = Math.random()
	if( rnd < 0.1) {
		context.vars.nextAction = 0; // select discount
		context.vars.housesLst = context.vars.housesDiscountLst;
	} else {
		context.vars.nextAction = 1; // select location 
		context.vars.location = locations.sample();
		context.vars.initDate = randomDate();
		context.vars.endDate = context.vars.date;
	}
	if( rnd < 0.3)
		context.vars.afterNextAction = 0; // browsing
	else if( rnd < 0.4)
		context.vars.afterNextAction = 1; // check questions
	else if( rnd < 0.45) {
		context.vars.afterNextAction = 2; // post questions
		context.vars.text = `${faker.lorem.paragraph()}`;
	} else if( rnd < 0.60)
		context.vars.afterNextAction = 3; // reserve
	else
		context.vars.afterNextAction = 4; // do nothing
	return done()
}


/**
 * Return true with probability 20% 
 */
function random20(context, next) {
  const continueLooping = Math.random() < 0.2
  return next(continueLooping);
}

/**
 * Return true with probability 50% 
 */
function random50(context, next) {
  const continueLooping = Math.random() < 0.5
  return next(continueLooping);
}

/**
 * Return true with probability 70% 
 */
function random70(context, next) {
  const continueLooping = Math.random() < 0.7
  return next(continueLooping);
}

/**
 * Return true with probability 70% 
 */
function random80(context, next) {
  const continueLooping = Math.random() < 0.8
  return next(continueLooping);
}

/**
 * Return true with probability 70% 
 */
function random90(context, next) {
  const continueLooping = Math.random() < 0.9
  return next(continueLooping);
}
