function findAndReplace(element, patterns, replacements) {
    var matches = traverseDOMToGetMatches(element, patterns, []);
    for (var i = matches.length-1; i >= 0; i--) {
        try {
            replacements[matches[i][0]](matches[i][1], matches[i][2]);
        } catch(e) {
            console.error("Chrome Text Customizer : "+e.name+" - "+e.message);
        }
    }
}

// Returns an array of matches, each match containing 3 items :
// - the index of the replacement function to use
// - the node in which the match was found
// - the match as returned by regexp.exec()
function traverseDOMToGetMatches(element, patterns, matches_array) {   
    for (var child_i = 0; child_i < element.childNodes.length; child_i++) {
        var child = element.childNodes[child_i];
        // Element node : keep traversing
        if (child.nodeType === 1) {
            var tag = child.tagName.toLowerCase();
            if (tag !== 'script' && tag !== 'style' && tag !== 'textarea')
                matches_array.concat(traverseDOMToGetMatches(child, patterns, matches_array));
        // Text node : return matches
        } else if (child.nodeType === 3) {
            for (var match_i = 0; match_i < patterns.length; match_i++) {
                var match;
                if (patterns[match_i].global)
                    while ((match = patterns[match_i].exec(child.data)) !== null)
                        matches_array.push([match_i, child, match]);
                else
                    if ((match = patterns[match_i].exec(child.data)) !== null)
                        matches_array.push([match_i, child, match]);
            }
        }
    }
    return matches_array;
}

// Returns all matches as regexps and all replacements as functions
function parseRules(matches, replacements) {
    var ret_matches = [];
    var ret_replacements = [];
    for (var i=0; i<matches.length; i++) {

        // Match
        if (matches[i].type === "string") {
            var options = 'g' + matches[i].options.indexOf('i') !== -1 ? 'i' : '';
            ret_matches.push(new RegExp(matches[i].string, options));
        }
        else if (matches[i].type === "regexp") {
            ret_matches.push(new RegExp(matches[i].string, matches[i].options));
        }

        // Replacement
        if (replacements[i].type === "string") {
            var preserve_case = replacements[i].options.indexOf('p') !== -1;
            var replace_captured_groups = replacements[i].options.indexOf('g') !== -1;
            ret_replacements.push(replaceSubstring.bind(this, replacements[i].string, preserve_case, replace_captured_groups));
        }
        else if (replacements[i].type === "function") {
            ret_replacements.push(new Function('node', 'match', replacements[i].string));
        }
    }
    return {
        matches: ret_matches,
        replacements: ret_replacements
    };
}

// Following functions are used as templates to create replacement functions through currying

function replaceSubstring(replacement_str, preserve_case, replace_captured_groups, node, match) {
    if (replace_captured_groups) {
        var i = 1;
        var rep_str_match = null;
        while ((rep_str_match = new RegExp("\\\\"+i).exec(replacement_str)) !== null && match[i] !== undefined) {
            replacement_str = replacement_str.substr(0, rep_str_match.index) + match[i] + replacement_str.substr(rep_str_match.index + rep_str_match[0].length);
            i++;
        }
    }
    if (preserve_case) {
        replacement_str = replacement_str.toLowerCase();
        if (match[0] === match[0].toUpperCase())
            replacement_str = replacement_str.toUpperCase();
        if (match[0][0] === match[0][0].toUpperCase())
            replacement_str = replacement_str[0].toUpperCase() + replacement_str.substr(1);
    }
    var text_node = document.createTextNode(replacement_str);
    node.splitText(match.index + match[0].length);
    var match_node = node.splitText(match.index);
    node.parentNode.replaceChild(text_node, match_node);
}
