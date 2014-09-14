chrome.storage.sync.get({
    matches: [],
    replacements: []
}, function(options) {
    findAndReplace(document.getElementsByTagName('body')[0], options.matches, options.replacements);
});