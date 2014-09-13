chrome.storage.sync.get({
    matches: [],
    replacements: []
}, function(options) {
    if (options.matches.length !== options.replacements.length)
        console.error("[Chrome Text Customizer] : pattern and replacement are not of the same length.");
    else
        findText(document.getElementsByTagName('body')[0], options.matches, options.replacements);
});