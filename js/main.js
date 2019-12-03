(() => {
// import Vue from 'vue'
// import Vue2TouchEvents from 'vue2-touch-events'

	// Vue.use(vueTouchEvents)

	const LANG_JP = 'ja-JP';
	const LANG_US = 'en-US';
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
		// static speak(str, lang = LANG_JP, isCancel = false) {
		// 	if (isCancel) {
		// 		Speech.cancel();
		// 	}
		// 	let a = new SpeechSynthesisUtterance(str);
		// 	a.lang = lang;
		// 	speechSynthesis.speak(a);
		// }
		static speak(str, voice, isCancel = false) {
			if (isCancel) {
				Speech.cancel();
			}
			let a = new SpeechSynthesisUtterance(str);
			console.log(voice);
			a.voice = voice;
			speechSynthesis.speak(a);
		}
		static cancel() {
			if (speechSynthesis.speaking) {
				speechSynthesis.cancel();
			}
		}
		static getVoices() {
			return speechSynthesis.getVoices().filter(voice => {
				return voice.lang == LANG_JP || voice.lang == LANG_US;
			});
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
			langs: [LANG_JP, LANG_US],
			lang: LANG_JP,
			mute: false,
			voices: [],
			name: '',
			// lang: LANG_US,

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
				window.hoge = e;
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
							// str += (this.lang == LANG_JP) ? "\n試合終了" : "\n game set";
							str += "\n game set";
							break;
						default:
							if (user.score == this.mode-1) {
								if (this.user1.score == this.user2.score) {
									str += "\ndeuce";
								} else if (user == this.user1 && this.user1.score > this.user2.score
										   || user == this.user2 && this.user1.score < this.user2.score) {
									str += "\nmatch point";
								}
							}
						}
						if (!this.mute) {
							let voice = this.voices.filter((arg) => arg.name == this.name)[0];
							// Speech.speak(str, this.lang, true);
							Speech.speak(str, voice, true);
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
	window.speechSynthesis.onvoiceschanged = function() {
		vue.voices = Speech.getVoices();
		vue.name = vue.voices[0].name;
	};

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
