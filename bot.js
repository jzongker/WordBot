/*
Call stacks of public functions

constructor
	loadWords

generateEmptyBoard

getSuggestions
	getPossiblePlacements
		getHorizontalPattern
		getVerticalPattern
		getPossibleWords
			canSpell
	scorePlacement
		getWord
			getTileByLetter
			getWordScore

getTileByLetter
*/


function WordBot(listUrl)
{
	this.words = [];
	this.listUrl = listUrl || 'words.txt';
	this.loadWords();
}


// ** PUBLIC FUNCTIONS **


//The main method that returns a list of recommended plays
WordBot.prototype.getSuggestions = function(handTiles, board)
{
	var possiblePlacements = this.getPossiblePlacements(handTiles, board);
	for (var i=0;i<possiblePlacements.length;i++) this.scorePlacement(possiblePlacements[i], board);

	//Remove invalid words
	for (var i=possiblePlacements.length-1; i>=0; i--) if (possiblePlacements[i].score==-1) possiblePlacements.splice(i,1)
	possiblePlacements.sort(this.compareByScore);
	return possiblePlacements;
}

//Returns a like object of [letter,points,occurances] when given a letter.
WordBot.prototype.getTileByLetter = function(letter)
{
	for (var i=0;i<this.tiles.length;i++)
	{
		if (this.tiles[i][0]==letter) return this.tiles[i];
	}
	return null;
}





// ** INTERNAL FUNCTIONS **

//Determines if a word can be spelled given a pattern of placed letters and spaces and tiles in the players hand.
WordBot.prototype.canSpell = function(word, handTiles, pattern)
{
	if (word.length>pattern.length) return false;
	var usedTiles=[];

	for (var l=0;l<word.length;l++)
	{
		var matchedLetter = false;
		if (pattern.substring(l,l+1)==' ')	//if the space is not empty, see if we have a tile
		{
			for (var t=0;t<handTiles.length;t++)
			{
				//if (!this.arrayContains(usedTiles,t))
				if ($.inArray(t,usedTiles)==-1)
				{
					if (word.substring(l,l+1)==handTiles[t][0])
					{
						matchedLetter = true;
						usedTiles.push(t);
					}
				}
			}
		} else {
			if (pattern.substring(l,l+1)==word.substring(l,l+1)) matchedLetter = true; //See if the space is already filled with the letter we need
		}
		if (matchedLetter==false) return false;
	}
	if (usedTiles.length==0) return false; 										//This word was already on the board.
	if (pattern.length>word.length && pattern[word.length]!=' ') return false;	//There are extra letters that are connected on the board
	return true;
}

//Reads the word list text file and splits it into a javascript array.
WordBot.prototype.loadWords = function()
{
	$.get( this.listUrl, function( data ) {
		words = data.split('\r\n');
		if (words.length==1) words = data.split('\n');  //Github Pages strips out the CR.
		console.log(words.length);
	});
}


WordBot.prototype.initBoard = function(spaces)
{
	this.board=[];
	for (var y=0;y<spaces.length;y++)
	{
		this.board[y] = new Array(spaces[y].length);
		for (x=0;x<spaces[y].length;x++) this.board[y][x] = [spaces[y][x],'']; //Add empty letter
	}
}

//Creates a new empty board in the WWF style
WordBot.prototype.initWWF = function()
{
	this.tiles = [
		['A',1,9], ['B',4,2], ['C',4,2], ['D',2,5], ['E',1,13], ['F',4,2], ['G',3,3], ['H',3,4], ['I',1,8], ['J',10,1], ['K',5,1], ['L',2,4], ['M',4,2],
		['N',2,5], ['O',1,8], ['P',4,2], ['Q',10,1], ['R',1,6], ['S',1,5], ['T',1,7], ['U',1,4], ['V',5,2], ['W',4,2], ['X',8,1], ['Y',3,2], ['Z',10,1]
	];

	var spaces = [
		['','','','3W','','','3L','','3L','','','3W','','',''],
		['','','2L','','','2W','','','','2W','','','2L','',''],
		['','2L','','','2L','','','','','','2L','','','2L',''],
		['3W','','','3L','','','','2W','','','','2L','','','2W'],
		['','','2L','','','','2L','','2L','','','','2L','',''],
		['','2W','','','','3L','','','','3L','','','','2W',''],
		['3L','','','','2L','','','','','','2L','','','','3L'],
		['','','','2W','','','','S','','','','2W','','',''],
		['3L','','','','2L','','','','','','2L','','','','3L'],
		['','2W','','','','3L','','','','3L','','','','2W',''],
		['','','2L','','','','2L','','2L','','','','2L','',''],
		['3W','','','3L','','','','2W','','','','2L','','','2W'],
		['','2L','','','2L','','','','','','2L','','','2L',''],
		['','','2L','','','2W','','','','2W','','','2L','',''],
		['','','','3W','','','3L','','3L','','','3W','','','']
	];
	this.initBoard(spaces);
}

//Creates a new empty board in the Scrabble style
WordBot.prototype.initScrabble = function()
{
	this.tiles = [
		['A',1,9], ['B',3,2], ['C',3,2], ['D',2,4], ['E',1,12], ['F',4,2], ['G',2,3], ['H',4,2], ['I',1,9], ['J',8,1], ['K',5,1], ['L',1,4], ['M',3,2],
		['N',1,6], ['O',1,8], ['P',3,2], ['Q',10,1], ['R',1,6], ['S',1,4], ['T',1,6], ['U',1,4], ['V',4,2], ['W',4,2], ['X',8,1], ['Y',4,2], ['Z',10,1]
	];

	var spaces = [
		['3W','','','2L','','','','3W','','','','2L','','','3W'],
		['','2W','','','','3L','','','','3L','','','','2W',''],
		['','','2W','','','','2L','','2L','','','','2W','',''],
		['2L','','','2W','','','','2L','','','','2W','','','2L'],
		['','','','','2W','','','','','','2W','','','',''],
		['','3L','','','','3L','','','','3L','','','','3L',''],
		['','','2L','','','','2L','','2L','','','','2L','',''],
		['3W','','','2L','','','','S','','','','2L','','','3W'],
		['','','2L','','','','2L','','2L','','','','2L','',''],
		['','3L','','','','3L','','','','3L','','','','3L',''],
		['','','','','2W','','','','','','2W','','','',''],
		['2L','','','2W','','','','2L','','','','2W','','','2L'],
		['','','2W','','','','2L','','2L','','','','2W','',''],
		['','2W','','','','3L','','','','3L','','','','2W',''],
		['3W','','','2L','','','','3W','','','','2L','','','3W']
	];
	this.initBoard(spaces);
}


//Counts the placed letter places and bonuses to return the score from a single word created by a play.
WordBot.prototype.getWordScore = function(tiles, board)
{
	var result = 0;
	var wordMultiplier = 1;
	for (var l=0;l<tiles.length;l++)
	{
		tile = tiles[l];
		var points = tile.tile[1];
		var bonus = board[tile.y][tile.x][0];
		if (!tile.existing)
		{
			if (bonus=='2L') points = points * 2;
			if (bonus=='3L') points = points * 3;
			if (bonus=='2W') wordMultiplier = wordMultiplier * 2;
			if (bonus=='3W') wordMultiplier = wordMultiplier * 3;
		}
		result += points;
	}
	result = result * wordMultiplier;
	return result;
}

//A custom sort method to sort the potential plays object by highest score
WordBot.prototype.compareByScore = function(a,b)
{
	if (a.score > b.score) return -1;
	if (a.score < b.score) return 1;
	return 0;
}

//Calculates the total score of all of the words generated by a potential play.
WordBot.prototype.scorePlacement = function(placement, board)
{
	var primaryWord = this.getWord(placement.letters[0].x, placement.letters[0].y, placement.letters[placement.letters.length-1].x, placement.letters[placement.letters.length-1].y, placement.vertical, placement.letters, board);
	if (primaryWord.score<=0) return;

	placement.words = [primaryWord];
	
	var totalScore = primaryWord.score;
	for (var i=0; i<placement.letters.length; i++)
	{
		var secondaryWord = this.getWord(placement.letters[i].x, placement.letters[i].y, placement.letters[i].x, placement.letters[i].y, !placement.vertical, placement.letters, board);
		if (secondaryWord.score == -1) return;
		totalScore += secondaryWord.score;
		placement.words[placement.words.length] = secondaryWord;
	}
	placement.score = totalScore;
}

//Determines which word (if any) was formed either horizontally or vertically by the letter(s) just placed.
//Returns a score of 0 if no word is formed, -1 if an invalid word is formed and the score of the word for a valid word formed.
WordBot.prototype.getWord = function(startX, startY, endX, endY, vertical, placedLetters, board)
{
	var result = {};
	result.tiles = [];
	result.word = '';
	result.score = 0;

	//see what letters connect to these placed tiles
	if (vertical)
	{
		while(startY>0 && board[startY-1][startX][1] != '' ) startY = startY - 1;
		while(endY<board.length-2 && board[endY+1][startX][1] != '' ) endY = endY + 1;
		for (var i=startY; i<=endY; i++) {
			var boardLetter = board[i][startX][1];
			if (boardLetter!='') {
				result.tiles[result.tiles.length] = {existing: true, x:startX, y:i, tile:this.getTileByLetter(boardLetter)};
			} else {
				result.tiles[result.tiles.length] = {existing: false, x:startX, y:i, tile:this.getTileByLetter(this.getPlacedLetter(placedLetters, startX, i).letter)};
			}
		}
	} else {
		while(startX>0 && board[startY][startX-1][1] != '' ) startX = startX - 1;
		while(endX<board[startY].length-2 && board[startY][endX+1][1] != '' ) endX = endX + 1;
		for (var i=startX; i<=endX; i++) {
			var boardLetter = board[startY][i][1];
			if (boardLetter!='') {
				result.tiles[result.tiles.length] = {existing: true, x:i, y:startY, tile:this.getTileByLetter(boardLetter)};
			} else {
				result.tiles[result.tiles.length] = {existing: false, x:i, y:startY, tile:this.getTileByLetter(this.getPlacedLetter(placedLetters, i, startY).letter)};
			}
		}
	}

	if (result.tiles.length<2) return result; //If it's not at least a 2 letter word, it doesn't count

	//determine the word
	for (var i=0;i<result.tiles.length;i++) result.word += result.tiles[i].tile[0];
	//var match = $.inArray(result.word.toUpperCase(), words) > -1
	var match = this.binaryIndexOf(result.word, words) > -1
	if (!match) { result.score = -1; return result; } 		//Invalid word.  Set score to -1.
	result.score = this.getWordScore(result.tiles, board);
	return result;
}

//Determines which letter was placed at a given position.
WordBot.prototype.getPlacedLetter = function(placedLetters, x, y )
{
	var result = null;
	for (var i=0; i<placedLetters.length; i++)
	{
		if (placedLetters[i].x == x && placedLetters[i].y == y) result = placedLetters[i];
	}
	return result;
}

//Returns a list of every word that can be formed at this position given the tiles in the hand and on the board.
//Does not consider if any additional invalid words would be formed in the process.
WordBot.prototype.getPossiblePlacements = function(handTiles, board)
{
	var placements = [];

	for (var y=0; y<board.length; y++)
	{
		for (var x=0; x<board[y].length; x++)
		{
			var startPos = board[y][x][0]=='S'; 	//Is this the starting space.
			var hPattern = this.getHorizontalPattern(board, x, y);
			var words = this.getPossibleWords(handTiles, hPattern, startPos);
			for (var i=0;i<words.length;i++) placements[placements.length] = this.getPlacement(x,y,words[i],hPattern,false);

			var vPattern = this.getVerticalPattern(board, x, y);
			words = this.getPossibleWords(handTiles, vPattern, startPos);
			for (var i=0;i<words.length;i++) placements[placements.length] = this.getPlacement(x,y,words[i],vPattern,true);
		}
	}
	return placements;
}

//Once we know a word can be spelled at a given place, this determines the tiles needed to do so.
WordBot.prototype.getPlacement = function(x,y,word,pattern,vertical)
{
	var result = []
	result.letters = [];
	result.vertical = vertical;
	result.score = -1;
	for (var i=0;i<word.length;i++)
	{
		if (pattern.substring(i,i+1) ==' ')
		{
			var placeLetter = {}
			if (vertical) { placeLetter.x = x; placeLetter.y = y + i;}
			else { placeLetter.x = x + i; placeLetter.y = y; }
			placeLetter.letter = word.substring(i,i+1);
			result.letters[result.letters.length] = placeLetter;
		}
	}
	return result;
}

//Returns a list of placed letters and empty spaces available horizontally on the board from the given position.
WordBot.prototype.getHorizontalPattern = function(board, x, y)
{
	line = board[y];
	var pattern = '';
	for (var i=x; i<line.length; i++ )
	{
		var letter = board[y][i][1];
		if (letter=='') letter = ' ';
		pattern += letter;
	}
	return pattern;
}

//Returns a list of placed letters and empty spaces available vertically on the board from the given position.
WordBot.prototype.getVerticalPattern = function(board, x, y)
{
	var pattern = '';
	for (var i=y; i<board.length; i++ )
	{
		var letter = board[i][x][1];
		if (letter=='') letter = ' ';
		pattern += letter;
	}
	return pattern;
}

//Given a horizontal or vertical pattern and the tiles in the plays hand, this method determines every possible word that could be placed here.
//The start position indicates this space can be used for the first play of the game.
WordBot.prototype.getPossibleWords = function(handTiles, pattern, startPos)
{
	if (pattern.replace(/\s/g,'') == '' && !startPos) return [];						//Make sure there's a connecting letter
	
	var maxLen = pattern.length;
	var minLen = maxLen;
	for (var i=maxLen-1;i>=0;i--) { if (pattern.substring(i,i+1)!=' ') minLen = i; }
	minLen = minLen + 1; 																//make it 1 based instead of 0 based
	if (minLen > handTiles.length) {
		if (startPos) minLen = 1;
		else return [];									 								//we do not have enough tiles to connect to a word
	}
	var firstConnectingLetter = pattern.substring(minLen-1,minLen);
	result = []
	for (var i=0;i<words.length;i++)
	{
		if (words[i].length>=minLen)													//don't check if it's not long enough
		{
			if (minLen==1 || words[i].substring(minLen-1,minLen) == firstConnectingLetter)		//don't check if the first connecting letter doesn't match
			{
				if (this.canSpell(words[i], handTiles, pattern)) result[result.length] = words[i];
			}
		}
	}
	return result;
}


//Replacement for $.inArray().  Uses binary searching on the presorted array instead to improve performance.
//Taken from example at http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/
WordBot.prototype.binaryIndexOf = function(searchValue, searchArray) {
  'use strict';

  var minIndex = 0;
  var maxIndex = searchArray.length - 1;
  var currentIndex;
  var currentElement;

  while (minIndex <= maxIndex) {
      currentIndex = (minIndex + maxIndex) / 2 | 0;
      currentElement = searchArray[currentIndex];

      if (currentElement < searchValue) {
          minIndex = currentIndex + 1;
      }
      else if (currentElement > searchValue) {
          maxIndex = currentIndex - 1;
      }
      else {
          return currentIndex;
      }
  }

  return -1;
}
