if (localStorage['base_notifier_desktop_notifications']) {
    localStorage['options__enable_desktop_notifications'] = localStorage['base_notifier_desktop_notifications'];
    delete localStorage['base_notifier_desktop_notifications'];
}

var NOTIFIER = new AppNotifier();
