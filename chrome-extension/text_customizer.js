function findAndReplace(element, patterns, replacements) {

    function traverseDOMGetMatches(element, patterns, replacements) {   
        for (var child_i = 0; child_i < element.childNodes.length; child_i++) {
            var child = element.childNodes[child_i];
            // Recursively explore element nodes
            if (child.nodeType === 1) {
                var tag = child.tagName.toLowerCase();
                if (tag !== 'script' && tag !== 'style' && tag !== 'textarea')
                    traverseDOMGetMatches(child, patterns, replacements);
            // Process text nodes
            } else if (child.nodeType === 3) {
                for (var replacement_i = 0; replacement_i < patterns.length; replacement_i++) {
                    var pattern = patterns[replacement_i];
                    var replacement = replacements[replacement_i];
                    var matches = [];

                    // If replacement is a string, simply use replace() on child.nodeValue
                    if (typeof replacement === 'string') {
                        if (typeof pattern === 'string')
                            pattern = new RegExp(pattern, 'g');
                        child.nodeValue = child.nodeValue.replace(pattern, replacement);
                    
                    // Otherwise retreive matches and pass them to replacement function
                    } else {
                        // Find matches
                        if (typeof pattern === 'string') {
                            var ix = 0;
                            while ((ix = child.data.indexOf(pattern, ix)) !== -1) {
                                matches.push({index: ix, '0': pattern});
                                ix += pattern.length;
                            }
                        } else {
                            var match;
                            while ((match = pattern.exec(child.data) !== null))
                                matches.push(match);
                        }
                        // Apply replacements
                        for (var i = 0; i< matches.length; i++)
                            replacement.call(window, child, matches[i]);
                    }
                }
            }
        }
    }
}