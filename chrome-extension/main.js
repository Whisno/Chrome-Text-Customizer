chrome.storage.sync.get({
    matches: [],
    replacements: []
}, function(options) {
    findAndReplace(document.getElementsByTagName('body')[0], options.matches, options.replacements);

    document.body.addEventListener ("DOMNodeInserted", function(e) {
        findAndReplace(e.target, options.matches, options.replacements);
    }, false);

    var CTC_DOMCharacterDataModified_handled = false; // Avoid infinite loops
    document.body.addEventListener ("DOMCharacterDataModified", function(e) {
        if (!CTC_DOMCharacterDataModified_handled) {
            findAndReplace(e.target, options.matches, options.replacements);
            CTC_DOMCharacterDataModified_handled = true;
        } else {
            CTC_DOMCharacterDataModified_handled = false;
        }
    }, false);
});