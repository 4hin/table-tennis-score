(() => {
// import Vue from 'vue'
// import Vue2TouchEvents from 'vue2-touch-events'

// Vue.use(vueTouchEvents)
	class User {
		constructor() {
			this.score = 0;
			this.gameCount = 0;
		}
		reset() {
			this.score = 0;
		}
	}

	let games = [
		5,
		11,
		21
	];
	class Util {
		static getGameState(user1, user2, threshold) {
			if (user1.score >= threshold || user2.score >= threshold) {
				if (Math.abs(user2.score - user1.score) < 2) {
					return 0;
				} else {
					return (user1.score > user2.score) ? 1 : -1;
				}
			} else {
				return 0;
			}
		}
	}

	class Speech {
		static speak(str, isCancel = false) {
			if (isCancel) {
				Speech.cancel();
			}
			let a = new SpeechSynthesisUtterance(str);
			speechSynthesis.speak(a);
		}
		static cancel() {
			if (speechSynthesis.speaking) {
				speechSynthesis.cancel();
			}
		}
	}
	var tapCount = 0;
	var timer = null;
	let vue = new Vue({
		el: '#container',
		data: {
			gaming: false,
			modes: games,
			mode: 10,
			mute: false,
			user1: new User(),
			user2: new User()
		},
		computed: {
			message: function() {
				switch (Util.getGameState(this.user1, this.user2, this.mode)) {
				case 1:
					return "試合終了";
				case -1:
					return "試合終了";
				default:
					return "";
				}
			},
			isGame: function() {
				return this.gaming;
			}
		},
		methods: {
			set: function() {
				this.gaming = true;
			},
			touchstart(e, user) {
				if (!this.gaming) {
					e.preventDefault();
					return;
				}
				if (tapCount == 0) {
					++tapCount;

					timer = setTimeout(() => {
						tapCount = 0;

						user.score++;
						let str = `${this.user1.score}対${this.user2.score}`;

						switch (Util.getGameState(this.user1, this.user2, this.mode)) {
						case 1:
						case -1:
							str += "\n試合終了";
							break;
						default:
						}
						if (!this.mute) {
							Speech.speak(str);
						}

					}, 350);
				} else {
					e.preventDefault();
					tapCount = 0;
					if (timer != null) {
						clearTimeout(timer);
						timer = null;
					}

					if (user.score > 0) {
						user.score--;
					}
				}
			},
			toggleMute: function() {
				this.mute = !this.mute;
			},
			reset: function() {
				Speech.cancel();

				this.user1.reset();
				this.user2.reset();
				this.gaming = false;
			}
		},
		created: function() {
			this.mode = this.modes[1];
		}
	});

	// var tapCount = 0;
	// document.querySelector('button').addEventListener('touchstart', function(e) {
	// 	if (!tapCount) {
	// 		++tapCount;
	// 		setTimeout(function() {
	// 			tapCount = 0;
	// 		}, 350);
	// 	} else {
	// 		e.preventDefault();
	// 		tapCount = 0;
	// 		console.log('double tapped');
	// 	}
	// });
})();
