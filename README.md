---
title: Test
layout: default
---

Chrome Base Notifier
====================

This repository provides a base for creating Chrome notifier/checker
extensions, i.e. extensions that notify the user about updates or activity
on their favorite apps or websites. Examples of such extensions are: 
[Gmail Checker](https://chrome.google.com/webstore/detail/google-mail-checker/mihcahmgecmbnbcchbopgniflfhgnkff)
and [Outlook.com Notifier](https://chrome.google.com/webstore/detail/outlookcom-notifier/mkmomflkhdooajekmffpilpoenndjppk).

Write your own notifier/checker extension in a few simple steps:

1. Clone this repo

	<pre>
		git clone https://github.com/tombb/chrome-base-notifier.git
	</pre>

2. Replace the following files by your own images:

   * `app.png` - Image shown on the options page and in desktop notifications
     of your extension
     
   * `browser-action-icon-active.png` - Active browser icon, shown when the
     extension is successfully polling your app or site.
     
   * `browser-action-icon-inactive.png` - Inactive browser icon, shown when
     the extenstion couldn't reach the app or site it's checking for activity.
   
3. Add the domain(s) for which your extension needs permission to manifest.json 
   and example-notifier.js:

   `manifest.json`:

	<pre>
	"permissions": [
		"tabs",
		"*://*.domain.of.your.app.com/"
		],
		</pre>

   `example-notifier.js`:

	<pre>
	domains : {
		value : [
			'the.domain.of.your.app.com',
			'another.domain.of.your.app.com'
		]
	}
	</pre>

4. Set the url attribute in example-notifier.js to the URL you'd like to poll
   for updates/activity:
   
	<pre>
	ExampleNotifier.ATTRS = {
		url : {
			value : 'https://url.to.your.app.com'
		},
	</pre>

5. Change `getNumberFromNode()` in `example-notifier.js` to return a number of new
   or unread items you'd like to notify the user about:

	<pre>
	getNumberFromNode : function (node) {
		// e.g:
		// return node.one('.some .selector').get('text');
	}
	</pre>

6. Change the name of your extension:

	<pre>
		mv example-notifier.js your-app-notifier.js
		sed 's/example-notifier.js/your-app-notifier.js/' *
		sed 's/Base Notifier/Your App Notifier/' *
		sed 's/ExampleNotifier/YourAppNotifier/'
	</pre>

7. Load your extension in Chrome, then debug and improve until you're happy!