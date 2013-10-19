describe('WordBot', function() {

	var bot = new WordBot('../words.txt');

	describe('#getTileByLetter', function() {

		context('given a letter', function() {
			var result = bot.getTileByLetter('A');

			it('returns an array that matches from available tiles', function() {
				expect(result).to.eql(['A', 1, 9]);
			});
		});

	});

	// we're using board in other specs below, so we'll put it here
	var board = bot.generateEmptyBoard();

	describe('#generateEmptyBoard', function() {
		it('returns a multi-dimensional array representing a blank 15x15 board', function() {
			expect(board).to.have.length(15);    // height
			expect(board[0]).to.have.length(15); // width
		});

		it('encodes bonus information as the first item in the space array', function() {
			expect(board[0][3]).to.eql(['3W', '']);
		});
	});
	
	describe('#getWordScore', function() {
		context('given the word TIM and no bonuses', function() {
			var tiles = [
				{existing: false, x: 0, y: 0, tile: bot.getTileByLetter('T')},
				{existing: false, x: 1, y: 0, tile: bot.getTileByLetter('I')},
				{existing: false, x: 2, y: 0, tile: bot.getTileByLetter('M')}
			];
			var score = bot.getWordScore(tiles, board);

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
			var score = bot.getWordScore(tiles, board);

			it('returns a score of 42', function() {
				expect(score).to.be(42);
			});
		});
	});

  describe('#canSpell', function() {
    context('given the letters R S T L N E A', function() {
      var tiles = [['R'], ['S'], ['T'], ['L'], ['N'], ['E'], ['A']];

      context('given an empty pattern', function() {
        var pattern = '       ';

        context('given the word ANTLERS', function() {
          var word = 'ANTLERS';

          it('returns true', function() {
            expect(bot.canSpell(word, tiles, pattern)).to.be(true)
          });
        });

        context('given the word ANT', function() {
          var word = 'ANT';

          it('returns true', function() {
            expect(bot.canSpell(word, tiles, pattern)).to.be(true)
          });
        });

        context('given the word ANTLERZ', function() {
          var word = 'ANTLERZ';

          it('returns false', function() {
            expect(bot.canSpell(word, tiles, pattern)).to.be(false)
          });
        });
      });

      context('given the pattern "A______"', function() {
        var pattern = 'A      ';

        context('given the word ANTLERS', function() {
          var word = 'ANTLERS';

          it('returns true', function() {
            expect(bot.canSpell(word, tiles, pattern)).to.be(true)
          });
        });
      });

      context('given the pattern "ANTLERS"', function() {
        var pattern = 'ANTLERS';

        context('given the word ANTLERS', function() {
          var word = 'ANTLERS';

          it('returns false', function() {
            expect(bot.canSpell(word, tiles, pattern)).to.be(false)
          });
        });
      });
    });

    context('given the letters S T L N E A', function() {
      var tiles = [['S'], ['T'], ['L'], ['N'], ['E'], ['A']];

      context('given an empty pattern', function() {
        var pattern = '       ';

        context('given the word ANTLERS', function() {
          var word = 'ANTLERS';

          it('returns false', function() {
            expect(bot.canSpell(word, tiles, pattern)).to.be(false)
          });
        });
      });

      context('given the pattern "_____R_"', function() {
        var pattern = '     R ';

        context('given the word ANTLERS', function() {
          var word = 'ANTLERS';

          it('returns true', function() {
            expect(bot.canSpell(word, tiles, pattern)).to.be(true)
          });
        });
      });

      context('given the pattern "______S"', function() {
        var pattern = '      S';

        context('given the word ANTLER', function() {
          var word = 'ANTLER';

          it('returns false', function() {
            expect(bot.canSpell(word, tiles, pattern)).to.be(false)
          });
        });
      });
    });
  });

});
