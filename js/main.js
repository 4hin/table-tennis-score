(() => {
	const LANG_JP = 'ja-JP';
	const LANG_US = 'en-US';
	const uttr = new SpeechSynthesisUtterance();
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
		static speak(str, voiceName, isCancel = false) {
			if (isCancel) {
				Speech.cancel();
			}

			uttr.text = str;
			uttr.voice = speechSynthesis.getVoices().filter(voice => {
				return voice.name == voiceName;
			})[0];
			speechSynthesis.speak(uttr);
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
		static getLang(name) {
			let lang = speechSynthesis.getVoices().filter(voice => {
				return voice.name == name;
			});
			return (lang.length > 0) ? lang[0] : "";
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
			click(e, user) {
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
						let isJP = Speech.getLang(this.name) == LANG_JP;
						let separator = (isJP) ? "、" : " ";
						let str = `${this.user1.score}${separator}${this.user2.score}`;
						if (!this.mute) {
							Speech.speak(str, this.name, true);
						}

						var str1 = "";
						switch (Util.getGameState(this.user1, this.user2, this.mode)) {
						case 1:
						case -1:
							str1 = "game set";
							break;
						default:
							if (user.score == this.mode-1) {
								if (this.user1.score == this.user2.score) {
									str1 = (isJP) ? "デュース" : "deuce";
								} else if (user == this.user1 && this.user1.score > this.user2.score
										   || user == this.user2 && this.user1.score < this.user2.score) {
									str1 = "match point";
								}
							}
						}
						if (!this.mute) {
							Speech.speak(str1, this.name, false);
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
	vue.voices = Speech.getVoices();
	if (vue.voices.length > 0) {
		vue.name = vue.voices[0].name;
	}
	window.speechSynthesis.onvoiceschanged = function() {
		vue.voices = Speech.getVoices();
		vue.name = vue.voices[0].name;
	};
})();
