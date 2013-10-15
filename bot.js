var tiles = [
	['A',1,9], ['B',4,2], ['C',4,2], ['D',2,5], ['E',1,13], ['F',4,2], ['G',3,3], ['H',3,4], ['I',1,8], ['J',10,1], ['K',5,1], ['L',2,4], ['M',4,2],
	['N',2,5], ['O',1,8], ['P',4,2], ['Q',10,1], ['R',1,6], ['S',1,5], ['T',1,7], ['U',1,4], ['V',5,2], ['W',4,2], ['X',8,1], ['Y',3,2], ['Z',10,1]
];

var words = [];


function canSpell(word, handTiles, pattern)
{
	//if (word.length>handTiles.length) return false;
	var usedTiles=[];
	for (var l=0;l<word.length;l++)
	{
		var matchedLetter = false;
		if (pattern.substring(l,l+1)==' ')	//if the space is not empty, see if we have a tile
		{
			for (var t=0;t<handTiles.length;t++)
			{
				if (!arrayContains(usedTiles,t))
				{
					if (word.substring(l,l+1).toUpperCase()==handTiles[t][0])
					{
						matchedLetter = true;
						usedTiles.push(t);
					}
				}
			}
		} else {
			if (pattern.substring(l,l+1).toUpperCase()==word.substring(l,l+1).toUpperCase()) matchedLetter = true; //See if the space is already filled with the letter we need
		}
		if (matchedLetter==false) return false;
	}
	if (usedTiles.length==0) return false; 										//This word was already on the board.
	if (pattern.length>word.length && pattern[word.length]!=' ') return false;	//There are extra letters that are connected on the board
	return true;
}

function arrayContains(array, value)
{
	for (var i=0;i<array.length;i++) 
	{
		if (array[i]==value) return true;
	}
	return false;
}

function loadWords()
{
	//http://www.gutenberg.org/ebooks/3201
	$.get( "words.txt", function( data ) {
		words = data.split('\r\n');
		console.log(words.length);
	});
}

function getTileByLetter(letter)
{
	for (var i=0;i<tiles.length;i++)
	{
		if (tiles[i][0]==letter) return tiles[i];
	}
	return null;
}

function generateEmptyBoard()
{
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
	result=new Array(spaces.length);
	for (var y=0;y<spaces.length;y++)
	{
		result[y] = new Array(spaces[y].length);
		for (x=0;x<spaces[y].length;x++)
		{
			result[y][x] = [spaces[y][x],'']; //Add empty letter
		}
	}
	return result;
}

function getWordScore(tiles, board)
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

function compareByScore(a,b)
{
	if (a.score > b.score) return -1;
	if (a.score < b.score) return 1;
	return 0;
}


function getSuggestions(handTiles, board)
{
	var possiblePlacements = getPossiblePlacements(handTiles, board);
	for (var i=0;i<possiblePlacements.length;i++) scorePlacement(possiblePlacements[i], board);

	//Remove invalid words
	for (var i=possiblePlacements.length-1; i>=0; i--) if (possiblePlacements[i].score==-1) possiblePlacements.splice(i,1)
	possiblePlacements.sort(compareByScore);
	return possiblePlacements;
}

function scorePlacement(placement, board)
{
	var primaryWord = getWord(placement.letters[0].x, placement.letters[0].y, placement.letters[placement.letters.length-1].x, placement.letters[placement.letters.length-1].y, placement.vertical, placement.letters, board);
	if (primaryWord.score<=0) return;

	placement.words = [primaryWord];
	
	var totalScore = primaryWord.score;
	for (var i=0; i<placement.letters.length; i++)
	{
		var secondaryWord = getWord(placement.letters[i].x, placement.letters[i].y, placement.letters[i].x, placement.letters[i].y, !placement.vertical, placement.letters, board);
		if (secondaryWord.score == -1) return;
		totalScore += secondaryWord.score;
		placement.words[placement.words.length] = secondaryWord;
	}
	placement.score = totalScore;
}

function getWord(startX, startY, endX, endY, vertical, placedLetters, board)
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
				result.tiles[result.tiles.length] = {existing: true, x:startX, y:i, tile:getTileByLetter(boardLetter)};
			} else {
				result.tiles[result.tiles.length] = {existing: false, x:startX, y:i, tile:getTileByLetter(getPlacedLetter(placedLetters, startX, i).letter)};
			}
		}
	} else {
		while(startX>0 && board[startY][startX-1][1] != '' ) startX = startX - 1;
		while(endX<board[startY].length-2 && board[startY][endX+1][1] != '' ) endX = endX + 1;
		for (var i=startX; i<=endX; i++) {
			var boardLetter = board[startY][i][1];
			if (boardLetter!='') {
				result.tiles[result.tiles.length] = {existing: true, x:i, y:startY, tile:getTileByLetter(boardLetter)};
			} else {
				result.tiles[result.tiles.length] = {existing: false, x:i, y:startY, tile:getTileByLetter(getPlacedLetter(placedLetters, i, startY).letter)};
			}
		}
	}


	if (result.tiles.length<2) return result; //If it's not at least a 2 letter word, it doesn't count

	//determine the word
	for (var i=0;i<result.tiles.length;i++) result.word += result.tiles[i].tile[0];

	var match = false;
	for (var i=0;i<words.length;i++)
	{
		if (words[i].toUpperCase()==result.word.toUpperCase()) match = true;
	}
	if (!match) { result.score = -1; return result; }

	result.score = getWordScore(result.tiles, board);
	return result;
}

function getPlacedLetter(placedLetters, x, y )
{
	var result = null;
	for (var i=0; i<placedLetters.length; i++)
	{
		if (placedLetters[i].x == x && placedLetters[i].y == y) result = placedLetters[i];
	}
	return result;
}


function getPossiblePlacements(handTiles, board)
{
	var placements = [];

	for (var y=0; y<board.length; y++)
	{
		for (var x=0; x<board[y].length; x++)
		{
			var startPos = board[y][x][0]=='S'; 	//Is this the starting space.
			var hPattern = getHorizontalPattern(board, x, y);
			var words = getPossibleWords(handTiles, hPattern, startPos);
			for (var i=0;i<words.length;i++) placements[placements.length] = getPlacement(x,y,words[i],hPattern,false);

			var vPattern = getVerticalPattern(board, x, y);
			words = getPossibleWords(handTiles, vPattern, startPos);
			for (var i=0;i<words.length;i++) placements[placements.length] = getPlacement(x,y,words[i],vPattern,true);
		}
	}

	return placements;
}


function getPlacement(x,y,word,pattern,vertical)
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
			placeLetter.letter = word.substring(i,i+1).toUpperCase();
			result.letters[result.letters.length] = placeLetter;
		}
	}
	return result;
}


function getHorizontalPattern(board, x, y)
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

function getVerticalPattern(board, x, y)
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


function getPossibleWords(handTiles, pattern, startPos)
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
			if (minLen==1 || words[i].substring(minLen-1,minLen).toUpperCase() == firstConnectingLetter)		//don't check if the first connecting letter doesn't match
			{
				if (canSpell(words[i], handTiles, pattern)) result[result.length] = words[i];
			}
		}
	}
	return result;
}

$(function(){
	loadWords();
});