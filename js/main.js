/**
* ABC Simple
*/

/*
Requires:
	* jQuery
	* Underscore
	* Underscore.string
	* Modernizr
	* component.js
	* uniform.js
Author(s):
	* Gareth Davies @GarethDavies_Me
Notes:
	* 
*/

;(function($, window, document, undefined) {

	'use strict';

	var abc = {

		verticalLimit: 4,
		horizontalLimit: 26,
		currentColumn: 1,
		requestedColumn: undefined,
		windowWidth: $(window).width(),
		menuXPos: 0,
		menuHeight: 44,
		transitionLength: 300,
		
		ui: {
			columnsContainer: $('#js-columns'),
			columns: $('.column'),
			toggleButton: $('.menu-toggle'),
			toggleIcon: $('.menu-toggle img'),
			menu: $('.menu'),
			menuUl: $('.menu ul'),
			menuContainer: $('.menu-container'),
			player: $('#audio-player')
		},

		init: function() {

			this.loadJSON();
			this.initToggleSwipe();

			this.playLetter();

		},

		loadJSON: function() {

			var that = this;

			$.getJSON('json/abc.json', function(data) {

				that.data = data;

				that.initContent();

				that.initMenu();

			});

		},

		initContent: function() {

			var that = this;

			$.each(this.data , function(i, letter) {

				var itemString = '';

				itemString += '<div class="column" data-column="' + i + '" data-audio="' + letter.audio + '">';
				itemString += '<div class="cell" data-cell="1">';
				itemString += '<div class="inner">';
				itemString += '<h1><span>' + letter.uppercase + '</span><span>' + letter.lowercase + '</span></h1>';
				itemString += '</div>';
				itemString += '</div>';

				$.each(letter.words, function(j, word) {

					itemString += '<div class="cell" data-cell="' + (j + 2) + '">';
					itemString += '<div class="word" data-audio="' + word.audio + '" data-section-total="' + word.sections.length + '" data-section-count="1">';

					$.each(word.sections, function(k, blend) {

						itemString += '<div class="word-section" data-audio="' + blend.audio + '" data-section="' + (k + 1) + '">';
						// itemString += '<span class="word-section-letter">';
						itemString += blend.section;
						// itemString += '</span>';
						itemString += '</div>';

					});

					itemString += '</div>';
					itemString += '</div>';

				});

				itemString += '</div>';

				that.ui.columnsContainer.append(itemString);

			});

			this.initSwipe();

		},

		initMenu: function() {

			var
			that = this,
			menuString = '',
			$menuButtons;

			$.each(this.data, function(i, value) {

				var index = +i;

				if (index === 1 || index === 9 || index === 17 || index === 25) {

					menuString += '<ul>';

				}

				menuString += '<li><a href="#" data-column="' + i + '">' + value.uppercase + '' + value.lowercase + '</a></li>';

				if (index === 8 || index === 16 || index === 24 || index === 26) {

					menuString += '</ul>';

				}

			});

			that.ui.menu.append(menuString);

			this.adjustMenu();

			this.initMenuSwipe();

			this.eventListeners();

		},

		adjustMenu: function() {

			var
			targetWidth = this.windowWidth / 8,
			$menuButtons = this.ui.menu.find('a');

			this.ui.menu.find('li').css('width', targetWidth);

			this.menuHeight = $menuButtons.first().outerWidth();

			$menuButtons.css('height', this.menuHeight);

			this.ui.menu.css('height', this.menuHeight);

			this.ui.menuContainer.css('bottom', -this.menuHeight);

		},

		eventListeners: function() {

			var that = this;

			this.ui.toggleButton.on('click tap', function(e) {

				that.onToggleClick(e);

				e.preventDefault();

			});

			$('.menu a').on('click tap', function(e) {

				that.onMenuClick(e);

				e.preventDefault();

			});

			$('.word-section').on('click tap', function(e) {

				var
				$target = $(e.currentTarget),
				targetId = +$target.attr('data-section'),
				$parent = $target.parent(),
				sectionCount = +$parent.attr('data-section-count'),
				sectionTotal = +$parent.attr('data-section-total');

				// console.info($target.text());

				//
				if (targetId !== sectionCount) return false;

				//
				$parent.attr('data-section-count', sectionCount + 1);

				//
				$target.css('color', 'rgba(255,255,255,1)');

				//
				that.ui.player.attr('src', 'mp3/' + $target.data('audio'));
				that.ui.player[0].play();

				// Finished?
				if (sectionCount === sectionTotal) {

					// TODO: finished so play word after a second or so
					setTimeout(function() {

						console.info('done!');

						that.ui.player.attr('src', 'mp3/' + $parent.data('audio'));
						that.ui.player[0].play();

					}, 1500);

					setTimeout(function() {

						// Return back to beginning
						$parent.children().removeAttr('style');

						$parent.attr('data-section-count', 1);

					}, 8000);

				}

				e.preventDefault();

			});
			
			$(window).resize($.throttle(500, function() {

				that.windowWidth = $(window).width();

				that.adjustMenu();

				that.closeMenu();

			}));

		},

		initSwipe: function() {

			var that = this;

			$('.cell').swipe({

				swipe: function(e) {

					if (that.ui.menuContainer.hasClass('menu-container--open')) {

						that.closeMenu();

					}

				},

		        swipeLeft: function(e) {

					// console.log('left');

					var colIndex = this.parent().data('column');

					if (colIndex >= that.horizontalLimit) return false;

					that.currentColumn = colIndex + 1;

					this.parent().siblings('.column').removeAttr('style');

					that.ui.columnsContainer.css('transform', 'translateX(-' + colIndex * 100 + '%)');

					that.playLetter();
		        
		        },

		        swipeUp: function(e) {

					// console.log('up');

					var index = this.data('cell');

					if (index >= that.verticalLimit) return false;

					this.parent().css('transform', 'translateY(-' + index * 100 + '%)');
		        
		        },

		        swipeDown: function(e) {

					// console.log('down');

					var index = this.data('cell');

					if (index === 1) return false;

					this.parent().css('transform', 'translateY(-' + (index - 2) * 100 + '%)');
		        
		        },

		        swipeRight: function(e) {

					// console.log('right');

					var colIndex = this.parent().data('column');

					if (colIndex === 1) return false;

					that.currentColumn = colIndex - 1;

					this.parent().siblings('.column').removeAttr('style');

					that.ui.columnsContainer.css('transform', 'translateX(-' + (colIndex - 2) * 100 + '%)');

					that.playLetter();
		        
		        },
		        
				threshold: 100

			});

		},

		playLetter: function() {

			var that = this;

			setTimeout(function() {

				console.info($('[data-column="' + that.currentColumn + '"]', that.ui.columnsContainer).data('audio'));

				that.ui.player.attr('src', 'mp3/' + $('[data-column="' + that.currentColumn + '"]', that.ui.columnsContainer).data('audio'));
				that.ui.player[0].play();

			}, this.transitionLength * 2);

		},

		initMenuSwipe: function() {

			var that = this;

			this.ui.menu.swipe({

		        swipeLeft: function(e) {

		        	// console.info(that.menuXPos);

		        	if (that.menuXPos + that.windowWidth >= that.ui.menu.width()) return false;
		        
		        	that.ui.menu.css('transform', 'translateX(-' + (that.windowWidth + that.menuXPos) + 'px)');

		        	that.menuXPos = that.windowWidth + that.menuXPos;

		        },

		        swipeDown: function(e) {

		        	that.closeMenu();
		        
		        },

		        swipeRight: function(e) {

		        	if (that.menuXPos === 0) return false;

		        	that.ui.menu.css('transform', 'translateX(-' + (that.menuXPos - that.windowWidth) + 'px)');

		        	that.menuXPos = that.menuXPos - that.windowWidth;
		        
		        },
		        
				threshold: 10,
				excludedElements: 'button, input, select, textarea, .noSwipe'

			});

		},

		initToggleSwipe: function() {

			var that = this;

			this.ui.toggleButton.swipe({

				swipeDown: function(e) {

		        	that.closeMenu();
		        
		        },

		        swipeUp: function(e) {

		        	that.openMenu();
		        
		        },
		        
				threshold: 1,
				excludedElements: 'button, input, select, textarea, .noSwipe'

			});

		},

		onToggleClick: function(e) {

			if (this.ui.menuContainer.hasClass('menu-container--open')) {

				this.closeMenu();

			}
			else {

				this.openMenu();

			}

		},

		closeMenu: function() {

			this.ui.menuContainer.css('transform', 'translateY(0px)');

			this.ui.menuContainer.removeClass('menu-container--open');

			this.ui.toggleIcon.css('transform', 'rotate(0deg)');

		},

		openMenu: function() {

			this.ui.menuContainer.css('transform', 'translateY(-' + this.menuHeight + 'px)');

			this.ui.menuContainer.addClass('menu-container--open');

			this.ui.toggleIcon.css('transform', 'rotate(180deg)');
			
		},

		onMenuClick: function(e) {

			var
			$button = $(e.currentTarget),
			chosenColumn = $button.data('column');

			// console.info('current: ' + this.currentColumn);
			// console.info('chosen: ' + chosenColumn);

			if (this.currentColumn === chosenColumn) return false;

			this.ui.columns.removeAttr('style');

			this.ui.columnsContainer.css('transform', 'translateX(-' + (chosenColumn -1) * 100 + '%)');

			this.currentColumn = chosenColumn;

			if (this.ui.menuContainer.hasClass('menu-container--open')) {

				this.closeMenu();

			}

			this.playLetter();
			
		}

	};

	//
	abc.init();

})(jQuery, window, document);