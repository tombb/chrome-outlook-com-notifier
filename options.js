YUI().use('event-base','node-style', 'array-extras', function (Y) {

	var title = chrome.extension.getBackgroundPage().NOTIFIER.get('title');

	Y.on('domready', function () {
		//
		// Adjust title and page heading
		//
		document.title = 'Options for ' + title;
		Y.one('h1').setHTML('Settings for ' + title);

		//
		// Notifications
		//	
		Y.all('input[name="base_notifier_desktop_notifications"]')
			.each(function (el) {
				if (Y.Lang.isValue(localStorage.base_notifier_desktop_notifications)) {
					if (localStorage.base_notifier_desktop_notifications === el.get('value')) {
						el.set('checked', true);
					} else {
						el.set('checked', false);
					}
				}
				el.on('click', function (e) {
					localStorage.base_notifier_desktop_notifications = e.target.get('value');
				});
			});

	});
});