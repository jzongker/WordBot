describe('WordBot', function() {

	var bot = new WordBot('../words.txt');


  describe('#initWWF', function() {
    bot.initWWF();
    it('returns a multi-dimensional array representing a blank 15x15 board', function() {
      expect(bot.board).to.have.length(15);    // height
      expect(bot.board[0]).to.have.length(15); // width
    });

    it('encodes bonus information as the first item in the space array', function() {
      expect(bot.board[0][3]).to.eql(['3W', '']);
    });
  });


	describe('#getTileByLetter', function() {
		context('given a letter', function() {
			var result = bot.getTileByLetter('A');

			it('returns an array that matches from available tiles', function() {
				expect(result).to.eql(['A', 1, 9]);
			});
		});

	});

	describe('#getWordScore', function() {
		context('given the word TIM and no bonuses', function() {
			var tiles = [
				{existing: false, x: 0, y: 0, tile: bot.getTileByLetter('T')},
				{existing: false, x: 1, y: 0, tile: bot.getTileByLetter('I')},
				{existing: false, x: 2, y: 0, tile: bot.getTileByLetter('M')}
			];
			var score = bot.getWordScore(tiles, bot.board);

			it('returns a score of 6', function() {
				expect(score).to.be(6);
			});
		});
		
		context('given the word JEREMY with a 2L bonus on E and a 2W bonus on M', function() {
			var tiles = [
				{existing: false, x: 1, y: 1, tile: bot.getTileByLetter('J')},
				{existing: false, x: 2, y: 1, tile: bot.getTileByLetter('E')}, // on double letter bonus space
				{existing: false, x: 3, y: 1, tile: bot.getTileByLetter('R')},
				{existing: false, x: 4, y: 1, tile: bot.getTileByLetter('E')},
				{existing: false, x: 5, y: 1, tile: bot.getTileByLetter('M')}, // on double word bonus space
				{existing: false, x: 6, y: 1, tile: bot.getTileByLetter('Y')}
			];
			var score = bot.getWordScore(tiles, bot.board);

			it('returns a score of 42', function() {
				expect(score).to.be(42);
			});
		});
	});

  describe('#canSpell', function() {
    context('given a word using all letters from hand', function() {
      var word = 'ANTLERS';
      var tiles = [['R'], ['S'], ['T'], ['L'], ['N'], ['E'], ['A']];
      var pattern = '       ';

      it('returns true', function() {
        expect(bot.canSpell(word, tiles, pattern)).to.be(true)
      });
    });

    context('given a word using some letters from hand', function() {
      var word = 'ANT';
      var tiles = [['R'], ['S'], ['T'], ['L'], ['N'], ['E'], ['A']];
      var pattern = '       ';

      it('returns true', function() {
        expect(bot.canSpell(word, tiles, pattern)).to.be(true)
      });
    });

    context('given a word with one letter not in hand and not on board', function() {
      var word = 'ANTLERZ';
      var tiles = [['R'], ['S'], ['T'], ['L'], ['N'], ['E'], ['A']];
      var pattern = '       ';

      it('returns false', function() {
        expect(bot.canSpell(word, tiles, pattern)).to.be(false)
      });
    });

    context('given a word matches same as word already on board', function() {
      var word = 'ANTLERS';
      var tiles = [['R'], ['S'], ['T'], ['L'], ['N'], ['E'], ['A']];
      var pattern = 'ANTLERS';

      it('returns false', function() {
        expect(bot.canSpell(word, tiles, pattern)).to.be(false)
      });
    });

    context('given a word using some letters in hand and one letter on board for beginning of word', function() {
      var word = 'ANTLERS';
      var tiles = [['R'], ['S'], ['T'], ['L'], ['N'], ['E'], ['A']];
      var pattern = 'A      ';

      it('returns true', function() {
        expect(bot.canSpell(word, tiles, pattern)).to.be(true)
      });
    });

    context('given a word using some letters in hand and one letter on board for middle of word', function() {
      var word = 'ANTLERS';
      var tiles = [['S'], ['T'], ['L'], ['N'], ['E'], ['A']];
      var pattern = '     R ';

      it('returns true', function() {
        expect(bot.canSpell(word, tiles, pattern)).to.be(true)
      });
    });

    context('given a word using some letters in hand, touching a letter on the board that is not used in the word', function() {
      var word = 'ANTLER';
      var tiles = [['R'], ['S'], ['T'], ['L'], ['N'], ['E'], ['A']];
      var pattern = '      S';

      it('returns false', function() {
        expect(bot.canSpell(word, tiles, pattern)).to.be(false)
      });
    });
  });

});
