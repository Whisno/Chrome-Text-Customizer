(function() {

    var matches;
    var replacements;

    // Communication with this background page is done by message passing
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.cmd === "reloadRules") {
            loadRules();
        } else if (request.cmd === "getRules") {
            if (matches === undefined)
                loadRules();
            sendResponse({matches: matches, replacements: replacements});
        }
    });

    // Get match/replace strategies stored as strings and instanciate regexp/functions
    function loadRules() {
        chrome.storage.sync.get({
            matchesTypes: [],
            matchesAsStrings: [],
            replacementsTypes: [],
            replacementsAsStrings: []
        }, function(options) {
            matches = [];
            replacements = [];

            for (var i=0; i<options.matchesTypes.length; i++) {
                if (options.matchesTypes[i] === "string")
                    matches[i] = options.matchesAsStrings[i];
                else if (options.matchesTypes[i] === "regexp")
                    matches[i] = new RegExp(options.matchesAsStrings[i]);
                else
                    abort();

                if (options.replacementsTypes[i] === "string")
                    replacements[i] = options.replacementsAsStrings[i];
                else if (options.replacementsTypes[i] === "function")
                    replacements[i] = new Function('node', 'match', options.replacementsAsStrings[i]);
                else
                    abort();
           }

            function abort() {
                console.error('Oh noes !');
                matches = [];
                replacements = [];
            }
        });
    }
})()