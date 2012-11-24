//
// Export
//
var AppNotifier;

YUI().use('base-notifier', function (Y) {

	/**
	 * @constructor
	 */ 
	AppNotifier = function () {
		arguments.callee.superclass.constructor.apply(this, arguments);
	};

	AppNotifier.NAME = "AppNotifier";

	//
	// Attributes
	//
	AppNotifier.ATTRS = {

		/**
		 * Title of the extension
		 */ 
		title : {
			value : 'Notifier Extension Starter'
		},

		/**
		 * The URL of the app
		 */ 
		url : {
			value : 'http://www.random.org/integers/?num=1&min=1&max=50&col=1&base=10&format=html&rnd=new'
		},
		
		/**
		 * Known domains for the app. Domains here must also be listed under
		 * permissions in your manifest.json.
		 */ 
		domains : {
			value : [
				'www.random.org'
			]
		},

		/**
		 * The font color of the icon while the user is logged in to the app
		 */ 
		loggedInColor : {
			value : [246,101,2,200]
		}
	};

	Y.extend(AppNotifier, BaseNotifier, {

		/**
		 * Override this function with your own code to get the number of
		 * items from the url specified under ATTRS.
		 * @param {HTMLElement} node (YUI) DOM node representation of the page 
		 * contents of ATTRS.url.
		 */ 
		getNumberFromNode : function (node) {
			return node.one('pre.data').get('text').replace(/[^\d]/,'');
		}
	});
});

