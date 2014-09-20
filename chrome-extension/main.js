// Get match/replace strategies stored as strings
chrome.storage.sync.get({
    matches: [],
    replacements: [],
}, function(options) {
    
    // Prepare
    var parsedRules = parseRules(options.matches, options.replacements);
    var matches = parsedRules.matches;
    var replacements = parsedRules.replacements;

    // Decide
    if (! matches)
        return;

    // Do
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

function parseRules(matches, replacements) {
    var ret_matches = [];
    var ret_replacements = [];
    for (var i=0; i<matches.length; i++) {

        // Match
        if (matches[i].type === "string") {
            ret_matches[i] = matches[i].string;
        }
        else if (matches[i].type === "regexp") {
            ret_matches[i] = new RegExp(matches[i].string, matches[i].options || "");
        }

        // Replacement
        if (replacements[i].type === "string") {
            ret_replacements[i] = replacements[i].string;
        }
        else if (replacements[i].type === "function") {
            ret_replacements[i] = new Function('node', 'match', replacements[i]);
        }
    }
    return {
        matches: ret_matches,
        replacements: ret_replacements
    };
}