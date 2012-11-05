//
// Export
//
var ExampleNotifier;

YUI().use('base-notifier', function (Y) {

	/**
	 * @constructor
	 */ 
	ExampleNotifier = function () {
		arguments.callee.superclass.constructor.apply(this, arguments);
	};

	ExampleNotifier.NAME = "ExampleNotifier";

	//
	// Attributes
	//
	ExampleNotifier.ATTRS = {

		/**
		 * The URL of the app
		 */ 
		url : {
			value : 'https://url.to.yourapp.com'
		},
		
		/**
		 * Known domains for the app. Domains here must also be listed under
		 * permissions in your manifest.json.
		 */ 
		domains : {
			value : [
				'domain.of.your.app.com',
				'anotherdomain.of.your.app.com'
			]
		},

		/**
		 * The font color of the icon while the user is logged in to the app
		 */ 
		loggedInColor : {
			value : [246,101,2,200]
		}
	};

	Y.extend(ExampleNotifier, BaseNotifier, {

		/**
		 * Override this function with your own code to get the number of
		 * items from the url specified under ATTRS.
		 * @param {HTMLElement} node (YUI) DOM node representation of the page 
		 * contents of ATTRS.url.
		 */ 
		getNumberFromNode : function (node) {
			// e.g:
			// return node.one('.some .selector').get('text');
		}
	});
});

