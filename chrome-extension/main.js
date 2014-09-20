chrome.runtime.sendMessage({cmd: "getRules"}, function(response) {
    var matches = response.matches;
    var replacements = response.replacements;
    
    if (matches === undefined || replacements === undefined) 
        console.error("[Chrome Text Customizer] Error : matches/replacements are undefined. There might be a communication problem with the background page.")
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
