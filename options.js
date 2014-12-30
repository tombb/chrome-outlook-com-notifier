YUI().use('event-base','node-style', 'array-extras', function (Y) {

    var title = chrome.extension.getBackgroundPage().NOTIFIER.get('title');

    function initializeBoooleanOption(fieldName, legacyFieldName) {
        var fieldName = 'options__' + fieldName;
        var value = localStorage[fieldName];

        Y.all('input[name="' + fieldName + '"]')
            .each(function (el) {
                if (Y.Lang.isValue(value)) {
                    if (value === el.get('value')) {
                        el.set('checked', true);
                    } else {
                        el.set('checked', false);
                    }
                }
                el.on('click', function (e) {
                    localStorage[fieldName] = e.target.get('value');
                });
            });
    }

    Y.on('domready', function () {

        document.title = 'Options for ' + title;
        Y.one('h1').setHTML('Settings for ' + title);

        initializeBoooleanOption('enable_desktop_notifications');
        initializeBoooleanOption('enable_notification_sound');
    });
});
