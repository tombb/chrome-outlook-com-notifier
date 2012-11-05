YUI().use('event-base','node-style', 'array-extras', function (Y) {

	Y.on('domready', function () {
		//
		// Show a welcome message if we're here for the first time 
		//
		if (!localStorage.base_notifier_desktop_notifications) {
			Y.one('h1').setHTML('Welcome to Base Notifier');
		}

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