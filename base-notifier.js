//
// Export
//
var BaseNotifier;

YUI.add('base-notifier', function (Y) {

	/**
	 * @constructor
	 */ 
	BaseNotifier = function () {
		BaseNotifier.superclass.constructor.apply(this, arguments);
	};

	BaseNotifier.NAME = "BaseNotifier";

	//
	// Attributes
	//
	BaseNotifier.ATTRS = {
		
		/**
		 * The title of your extension
		 */ 
		title : {
			value : null
		},

		/**
		 * The URL of the app
		 */ 
		url : {
			value : null
		},
		
		/**
		 * Known domains for the app. Domains here must be listed under
		 * permissions in your manifest.json.
		 */
		domains : {
			value : [
				'your.domain.com',
				'another.domain.com'
			]
		},

		/**
		 * Text to display to the user
		 */
		text : {
			value : {
				success     : 'You have {num} new items.',
				notLoggedIn : 'You are currently not signed in. Click to sign in.',
				notificationTitle : 'New item!'
			}
		},

		/**
		 * Icon to display while the user is logged in
		 */ 
		icons : {
			value : {
				loggedIn : 'browser-action-icon-active.png',
				notLoggedIn : 'browser-action-icon-inactive.png',
				notification : 'app.png'
			}
		},

		/**
		 * The font color of the icon while logged in
		 */ 
		loggedInColor : {
			value : [246,101,2,200]
		},

		/**
		 * The font color of the icon while logged out
		 */ 
		notLoggedInColor : {
			value : [105,105,105,200]
		},

		/**
		 * The user's desktop notifications preference. True means they want 
		 * desktop notifications - False means they don't.
		 */ 
		notificationPreference : {
			getter : function () {
				if (Y.Lang.isValue(localStorage.base_notifier_desktop_notifications)) {
					return localStorage.base_notifier_desktop_notifications === '1';
				}
				return true;
			}
		}
	};

	Y.extend(BaseNotifier, Y.Base, {
		/**
		 * Number to notify about (e.g. unread emails, new tickets etc).
		 * When this number increases, we'll send a desktop notification
		 * and update the icon.
		 * @type Int|Null
		 */ 
		_number : null,

		/**
		 * Number of failed attempts to sign in to our app
		 * the last successful one.
		 * @type Int
		 */ 
		_numFailedConnections : 0,

		/**
		 * Timer object (returned by Y.later) for the periodic checks.
		 * (Call cancel on this to stop the checks)
		 * @type Object
		 */ 
		_timer : null,

		/**
		 * Whether or not the user is logged in to the app.
		 * @type Boolean
		 */ 
		_loggedIn: false,

		/**
		 * Initializes the notifier. Starts periodic checks and subscribes
		 * the necessary event listeners
		 */ 
		initializer : function () {

			var me = this;

			this.drawIcon("?");

			//
			// First attempt to get number of unread emails (and show them in the
			// icon).
			//
			this.fetchNumber();

			//
			// From now on check for new emails every minute
			//
			this._timer = Y.later(60000, this, this.fetchNumber, {}, true);

			//
			// Open application when the icon is clicked
			//
			chrome.browserAction.onClicked.addListener(function () {
				me.openApp();
			});

			//
			// Page reloads within the app
			//
			chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
				if (changeInfo.status === 'complete') {
					if (Y.Array.find(me.get('domains'), function (e) {
						return tab.url.match(new RegExp('https?:\\/\\/([^.]*\\.)?' + e));
					})) {
						me.onAppReload(tabId, changeInfo, tab);
					}
				}
			});
			
			//
			// Listen for messages from the content script
			//
			chrome.extension.onMessage.addListener(
				function(request, sender, sendResponse) {
					if (Y.Lang.isValue(request.number)) {
						me.drawNumberAndNotify(request.number || 0, request.notify);
						try {
							me._timer.cancel();
						} catch (e) {
						}
					}
					if (request.unload) {
						me._timer = Y.later(60000, me, me.fetchNumber, {}, true);
					}
				}
			);
		},

		/**
		 * Callback function fired when one of the tabs/pages of the
		 * app is updated/reloaded. Injects a content script that
		 * notifies the extension of changes in the number of items.
		 * @param {Int} tabId Id of the tab that's changed
		 * @param {Obj} changeInfo Information about the change
		 * @param {Chrome Extension Tab} Tab instance
		 */
		onAppReload : function (tabId, changeInfo, tab) {
			this._timer.cancel();
			this._timer = Y.later(60000, this, this.fetchNumber, {}, true);
			var nodeToNumber = this.getNumberFromNode.toString();
			chrome.tabs.executeScript(tabId, {
				file: "yui-min.js",
				runAt: "document_start"
			});
			chrome.tabs.executeScript(tabId, {
				code: "(function () {" +
					"var iId = setInterval(function () { " + 
					"  if (YUI && top == self) {" +
					"    clearInterval(iId);" +
					"    YUI().use(['base-base', 'node-base', 'event-base'], function (Y) {" +
					"      var f = " + nodeToNumber + ";" +
					"      var tLastActive = (new Date).getTime()/1000;" +
					"      var tLastMsg, n, oldT, oldN;" +
					"      Y.one(document).on(['click', 'keydown', 'mouseover'], function () {" +
					"        tLastActive = (new Date).getTime()/1000;" +
					"      }); " +
					"      setInterval(function () {" +
					"        oldN = n; " +
					"        n = f(Y.one('document'));" +
					"        t = (new Date).getTime()/1000;" +
					"        if ((oldN !== n) || (t - tLastMsg > 10)) {" +
					"            chrome.extension.sendMessage(" +
					"              { number: n, notify: t-tLastActive > 20 }," +
					"              function(response) { }" +
					"            ); " +
					"        }" +
					"      }, 2000); " +
					"      Y.on('unload', function () {" +
					"         chrome.extension.sendMessage(" +
					"             {unload: true }," +
					"             function(response) { }" +
					"         ); " +
					"      });" +
					"    });" +
					"  }" +
					"}, 200); })();",
					runAt: "document_end"
			});
		},
		/**
		 * Draws the browserAction icon for this extension.
		 * @param {String} txt 
		 */ 
		drawIcon : function (txt) {
			var 
				canvas = document.getElementById('iconCanvas'),
				context = canvas.getContext('2d'),
				imageObj = new Image(),
				iconURL = this._loggedIn ? this.get('icons').loggedIn : this.get('icons').notLoggedIn,
				badgeColor = this._loggedIn ? this.get('loggedInColor') : this.get('notLoggedInColor');
				
			context.clearRect(0, 0, canvas.width, canvas.height);
			imageObj.onload = function() {
				context.drawImage(imageObj, 0, 0, 19, 19);
				var imageData = context.getImageData(0, 0, 19, 19);
				chrome.browserAction.setIcon({
					imageData: imageData
				});
				chrome.browserAction.setBadgeBackgroundColor({ color: badgeColor });
				if (txt) {
					chrome.browserAction.setBadgeText({ text: txt });
				} else {
					chrome.browserAction.setBadgeText({ text: '' });
				}
			};
			imageObj.src = iconURL;
		},

		/**
		 * Fetches the number to be displayed in the extension icon using
		 * an XHR request. Updates the icon and launches a notification if
		 * needed / applicable.
		 * @returns {Void}
		 */ 
		fetchNumber : function (xhr) {
			if (this.get('url')) {
				if (Y.Lang.isNull(this._number)) {
					this.drawIcon("...");
				}
				Y.io(this.get('url'), { 
					on: {
						success: this.onFetchNumberSuccess,
						failure: this.onFetchNumberFailure
					}, 
					context : this
				});
			}
		},

		/**
		 * Success callback for fetchNumber()
		 * @param {Int} id YUI IO transaction ID
		 * @param {Object} reponse YUI IO response object
		 */ 
		onFetchNumberSuccess : function (id, response) {
			var 
				tmpNode = Y.Node.create(response.responseText),
				newNumber = this.getNumberFromNode(tmpNode);

			if (!this.drawNumberAndNotify(newNumber, true)) {
				this.onFetchNumberFailure(id, response);
			}
			
			//
			// Clean up
			//
			tmpNode.destroy(true);
		},

		/**
		 * Success callback for fetchNumber()
		 * @param {Int} newNumber The new number of items to display
		 * @param {Boolean} doNotify Whether or not to create a desktop notification 
		 * @returns Boolean
		 */ 
		drawNumberAndNotify : function (newNumber, doNotify) {
			if (!Y.Lang.isNull(newNumber)) {
				this._loggedIn = true;
				if (Y.Lang.isNull(this._number)) {
				} else if (this._number < newNumber) {
					if (doNotify) {
						this._number = newNumber;
						this.notify();
					}
				}
				this._number = newNumber;
				this.drawIcon(
					newNumber === 0 ? '' : newNumber.toString()
				);
				chrome.browserAction.setTitle({
					title: Y.Lang.sub(
						this.get('text').success,
						{ num : (newNumber.toString() || '0') }
					)
				});
				return true;
			}
			return false;
		},

		/**
		 * Get the number (to display in the icon and notify about) from a DOM node.
		 * The node is created from response text received by an XHR request on
		 * the app url. 
		 * @parm {tmpNode}
		 */ 
		getNumberFromNode : function (tmpNode) {
			console.error('getNumberFromNode() must be overridden in your sub class');

			//
			// e.g:
			// return tmpNode.one('.some .selector').get('text');
			//

		},

		/**
		 * Failure callback for fetchNumber()
		 * @param {Int} id YUI IO transaction ID
		 * @param {Object} reponse YUI IO response object
		 */ 
		onFetchNumberFailure : function (id, response) {
			this._loggedIn = false;
			this._numFailedConnections += 1;
			if (this._numFailedConnections > 3) {
				this._timer.cancel();
			}
			this.drawIcon("?");
			chrome.browserAction.setTitle({
				title: Y.Lang.sub(this.get('text').notLoggedIn, {})
			});
		},

		/**
		 * Shows a desktop notification to notify the user of new email.
		 */ 
		notify : function () {
			var me = this;
			if (this.get('notificationPreference')) {
				if (this.notification) {
					this.notification.cancel();
				}
				this.notification = webkitNotifications.createNotification(
					this.get('icons').notification,  // icon url - can be relative
					this.get('text').notificationTitle,  // notification title
					Y.Lang.sub(this.get('text').success, { num : me._number.toString() })
				);
				this.notification.onclick = function () {
					me.openApp(); 
					this.cancel();
				};
				this.notification.show();
			}
		},

		/**
		 * Opens the web app in new tab unless it's opened already in the
		 * currently selected tab.
		 */ 
		openApp : function () {
			var 
				me = this,
				active = false,
				dLen = me.get('domains').length;

			Y.Array.map(
				me.get('domains'), 
				function (e) {
					var pattern = "*://*." + e + "/*";
					chrome.tabs.query({
						url : pattern
					}, function (tabs) {
						dLen = dLen-1;
						var 
							tabsLen = tabs.length,
							i;
						for (i=0; i < tabsLen; i++) {
							if (!tabs[i].active) {
								chrome.tabs.update(tabs[i].id, {active: true});
							}
							chrome.windows.update(tabs[i].windowId, {focused: true});
							active = true;
							break;
						}
						if (!active && (dLen === 0)) {
							active = true;
							chrome.tabs.create({
								url: me.get('url'),
								windowId : chrome.windows.WINDOW_ID_CURRENT
							}, function (tab) {
								chrome.windows.update(tab.windowId, {focused: true});
							});
						}
					});
				}
			);
		}
	});
}, '0.0.1', {
    requires: ['base-base', 'io-base', 'node-base', 'array-extras']
});
