// Get match/replace strategies stored as strings
chrome.storage.sync.get({
    matchesTypes: [],
    matchesAsStrings: [],
    replacementsTypes: [],
    replacementsAsStrings: []
}, function(options) {
    
    // Instanciate regexp/functions
    var matches = [];
    var replacements = [];
    for (var i=0; i<options.matchesTypes.length; i++) {
        if (options.matchesTypes[i] === "string")
            matches[i] = options.matchesAsStrings[i];
        else if (options.matchesTypes[i] === "regexp")
            matches[i] = new RegExp(options.matchesAsStrings[i]);

        if (options.replacementsTypes[i] === "string")
            replacements[i] = options.replacementsAsStrings[i];
        else if (options.replacementsTypes[i] === "function")
            replacements[i] = new Function('node', 'match', options.replacementsAsStrings[i]);
    }

    if (! matches) // undefined == false ; [] == false
        return;

    findAndReplace(document.getElementsByTagName('body')[0], matches, replacements);

    document.body.addEventListener ("DOMNodeInserted", function(e) {
        findAndReplace(e.target, matches, replacements);
    }, false);

    var CTC_DOMCharacterDataModified_handled = false; // Avoid infinite loops
    document.body.addEventListener ("DOMCharacterDataModified", function(e) {
        if (! CTC_DOMCharacterDataModified_handled) {
            findAndReplace(e.target, matches, replacements);
            CTC_DOMCharacterDataModified_handled = true;
        } else {
            CTC_DOMCharacterDataModified_handled = false;
        }
    }, false);
});