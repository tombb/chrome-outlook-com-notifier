(function () {

    var
        Y,
        timeLastActive,
        newNumber,
        previousNumber,
        getNumberFromNode;

    function isEnvironmentReady() {
        return YUI && AppNotifier;
    }

    function isTopWindow() {
        return top === self;
    }

    function getTimeInSeconds() {
        return (new Date).getTime()/1000;
    }

    function setTimeLastActive() {
        timeLastActive = getTimeInSeconds();
    }

    function requestBadgeUpdateAndNotification(count) {
        previousNumber = newNumber;
        newNumber = count;
        timeSinceLastActive = getTimeInSeconds()- timeLastActive;

        if ((previousNumber !== newNumber)) {
            chrome.extension.sendMessage(
               { number: newNumber, notify: timeSinceLastActive > 5 },
               function(response) { }
            );
        }
    }

    function notifyExtenstionOfPageUnload() {
        chrome.extension.sendMessage(
            {unload: true },
            function(response) { }
        );
    };

    function onEnvironmentReady(callback) {
        var iId = setInterval(function () {
            if (isEnvironmentReady()) {
                clearInterval(iId);
                callback();
            }
        }, 200);
    };

    onEnvironmentReady(function() {
        if (isTopWindow()) {
            getNumberFromNode = AppNotifier.prototype.getNumberFromNode;

            YUI().use(['base-base', 'node-base', 'event-base'], function (Y) {
                setTimeLastActive();

                Y.one(document).on(['click', 'keydown', 'mouseover'], setTimeLastActive);
                Y.on('unload', notifyExtenstionOfPageUnload);

                setInterval(function() {
                    requestBadgeUpdateAndNotification(
                        getNumberFromNode(Y.one(document))
                    );
                }, 2000);
            });
        }
    });
})();
