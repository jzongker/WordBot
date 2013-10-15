var suggestions = [];

function drawBoard(spaces)
{
	html = '<table>\n';
	for (var y=0;y<spaces.length;y++)
	{
		html += '<tr>'
		for (x=0;x<spaces[y].length;x++)
		{
			space = spaces[y][x];
			spaceHtml = '<td><input value="' + space[1] + '" id="s' + y.toString() + '_' + x.toString() + '"';
			if (space[0]!='') spaceHtml += ' class="T' + space[0] + '"';
			spaceHtml += ' /></td>'
			html += spaceHtml;
		}
		html += '</tr>\n'
	}
	html +='</table>'
	$('#boardHolder').html(html);
}

function readBoard()
{
	result = [];
	var rows = $('#boardHolder table tr');
	for (var y=0;y<rows.length;y++)
	{
		result[y] = [];
		for (x=0;x<rows[y].children.length;x++)
		{
			var space = $('#s' + y.toString() + '_' + x.toString());
			var cssClass = space.attr('class');
			if (typeof cssClass != 'undefined') cssClass = cssClass.replace(/^T/,'')
			result[y][x] = [cssClass,space.val()];
		}
	}
	return result;
}

function readHand()
{
	var handTiles = [7];
	for (var i=0;i<7;i++)
	{
		var letter = $('#h' + (i+1)).val().toUpperCase();
		handTiles[i] = getTileByLetter(letter);
	}
	return handTiles;
}

function showSuggestion(idx)
{
	var board = readBoard();
	for (var y=0; y<board.length; y++)
	{
		for (var x=0; x<board[y].length; x++)
		{
			var id = '#s' + y + '_' + x;
			$(id).attr('placeholder','');
		}
	}

	if (suggestions.length>idx)
	{
		var suggestion = suggestions[idx];
		for (var i=0;i<suggestion.letters.length;i++)
		{
			var id = '#s' + suggestion.letters[i].y + '_' + suggestion.letters[i].x;
			$(id).attr('placeholder',suggestion.letters[i].letter);
		}
	}
}

function updateSuggestions()
{
	suggestions = getSuggestions(readHand(), readBoard());
	result = "<h3>Suggestions</h3>"
	for (var i=0;i<10 && i<suggestions.length; i++) result += '<a href="javascript:showSuggestion(' + i.toString() + ');">' + suggestions[i].words[0].word + ' - ' + suggestions[i].score + '</a><br/>';
	$('#suggestionsHolder').html(result);
	showSuggestion(0);
}

$(function(){
	drawBoard(generateEmptyBoard());
});