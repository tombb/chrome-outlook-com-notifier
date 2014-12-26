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
         * The title of the extentsion
         */
        title : {
            value : 'Outlook.com Notifier'
        },

        /**
         * The URL of the app
         */
        url : {
            value : 'https://mail.live.com'
        },

        /**
         * Known domains for the app. Domains here must also be listed under
         * permissions in your manifest.json.
         */
        domains : {
            value : [
                'signout.live.com',
                'login.live.com',
                'mail.live.com',
            ]
        },

        /**
         * Text to display to the user
         */
        text : {
            value : {
                success     : 'You have {num} unread emails in your Outlook.com inbox.',
                notLoggedIn : 'You are currently not signed in to Outlook.com. Click to sign in.',
                notificationTitle : 'New email!'
            }
        },

        /**
         * The background color of the icon text while the user is logged in to the app
         */
        loggedInColor : {
            value : [0,43,150,255]
        }


    };

    Y.extend(AppNotifier, BaseNotifier, {

        /**
         * Override this function with your own code to get the number of
         * items from the url specified under ATTRS.
         * @param {HTMLElement} node (YUI) DOM node representation of the page
         * contents of ATTRS.url.
         * @returns Integer or null
         */
        getNumberFromNode : function (node) {
            var cNode;
            if (node) {
                cNode = node.one('.count');
                if (cNode) {
                    return parseInt(cNode.get('text'), 10) || 0;
                }
            }
            return null;
        }
    });
});

