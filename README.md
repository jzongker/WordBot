WordBot
=======

This javascript project demonstrates how to solve word puzzles like Scrabble, Words with Friends or crosswords through
the process of elimination.  It iterates through each space on the board to determine the pattern of empty 
spaces and placed tiles available horizontally and vertically from each starting position.  It then determines every word
that can fit in the space, given the letters in the players hand.  It checks to see if any adjacent words are formed by placing
each of those words and if those adjacent words are valid.  It then totals the points for all of the words formed by each potential
placement and takes into account bonus multiplier spaces.  Finally it presents the user with a list of words that can be played.  When
the user clicks on a given word, it shows where that word would appear on the board.


[Moby Word List](http://www.gutenberg.org/ebooks/3201) provided by Project Gutenberg.
