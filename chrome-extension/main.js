chrome.storage.sync.get({
    matches: [],
    replacements: [],
}, function(options) {
    
    if (options.matches.length === 0)
        return;

    var parsedRules = parseRules(options.matches, options.replacements);
    var matches = parsedRules.matches;
    var replacements = parsedRules.replacements;

    findAndReplace(document.getElementsByTagName('body')[0], matches, replacements);

    document.body.addEventListener ("DOMNodeInserted", function(e) {
        findAndReplace(e.target, matches, replacements);
    }, false);

    var DOMCharacterDataModified_handled = false; // Avoid infinite loops
    document.body.addEventListener ("DOMCharacterDataModified", function(e) {
        if (! DOMCharacterDataModified_handled) {
            findAndReplace(e.target, matches, replacements);
            DOMCharacterDataModified_handled = true;
        } else {
            DOMCharacterDataModified_handled = false;
        }
    }, false);
});
