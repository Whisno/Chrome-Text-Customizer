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
            var string = matches[i].string;
            if (matches[i].options.indexOf('w') !== -1)
                string = '\b'+string+'\b';
            var options = 'g' + matches[i].options.indexOf('i') !== -1 ? 'i' : '';
            ret_matches.push(new RegExp(string, options));
        }
        else if (matches[i].type === "regexp") {
            ret_matches.push(new RegExp(matches[i].string, matches[i].options));
        }

        // Replacement
        if (replacements[i].type === "string") {
            if (replacements[i].options.indexOf('p') !== -1)
                ret_replacements.push(replaceSubstringPreserveCase.bind(this, replacements[i].string));
            else
                ret_replacements.push(replaceSubstring.bind(this, replacements[i].string));
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

function replaceSubstring(replacement_str, node, match) {
    var text_node = document.createTextNode(replacement_str);
    node.splitText(match.index+match[0].length);
    var match_node = node.splitText(match.index);
    node.parentNode.replaceChild(text_node, match_node);
}

function replaceSubstringPreserveCase(replacement_str, node, match) {
    replacement_str = replacement_str.toLowerCase();
    if (match[0] === match[0].toUpperCase())
        replacement_str = replacement_str.toUpperCase();
    if (match[0][0] === match[0][0].toUpperCase())
        replacement_str[0] = replacement_str[0].toUpperCase();
    var text_node = document.createTextNode(replacement_str);
    node.splitText(match.index+match[0].length);
    var match_node = node.splitText(match.index);
    node.parentNode.replaceChild(text_node, match_node);
}

function wrapInTag(tag_str, node, match) {
    var wrap = document.createElement(tag_str);
    node.splitText(match.index+match[0].length);
    wrap.appendChild(node.splitText(match.index));
    node.parentNode.insertBefore(wrap, node.nextSibling);
}
