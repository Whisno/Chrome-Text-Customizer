var anyValueModified = false;
var $line = $("<tr><td><button class='delete_line'>X</button></td><td class='match'><select class='match_type'><option name='string' selected='selected'>string</option><option name='regexp'>regexp</option></select><textarea class='match_value'></textarea></td><td class='replacement'><select class='replacement_type'><option name='string' selected='selected'>string</option><option name='function'>function</option></select><textarea class='replacement_value'></textarea></td></tr>");

document.addEventListener('DOMContentLoaded', function() {
    // Event handlers on static content
    $('input, select').change(function() {
        anyValueModified = true;
    });
    $('#btnSave').click(function() {
        saveOptions();
    });
    $('#btnClose').click(function() {
        closeWindow();
    });
    $('#add_line').click(function() {
        appendLine();
    });
    // Event handlers on dynamic content
    $('body').on('focus', '#rules textarea', function() {
        $(this).select();
    });
    $('body').on('click', '.delete_line', function() {
        $(this).closest('tr').remove();
        if ($("#rules tbody tr").length === 0)
            appendLine();
    });

    loadOptions();

}, false);

function loadOptions() {
    chrome.storage.sync.get({
        matchesTypes: [],
        matchesAsStrings: [],
        replacementsTypes: [],
        replacementsAsStrings: []
    }, function(options) {
        var $table = $('#rules tbody');
        $table.empty();

        for (var i=0; i<options.matchesTypes.length; i++) {
            var matchType = options.matchesTypes[i];
            var match = options.matchesAsStrings[i];
            var replacementType = options.replacementsTypes[i];
            var replacement = options.replacementsAsStrings[i];
            appendLine(matchType, match, replacementType, replacement)
        }
        if (options.matchesTypes.length === 0)
            appendLine();
    });
}

function saveOptions() {
    var matchesTypes = [];
    var matches = [];
    var replacementsTypes = [];
    var replacements = [];
    var $lines = $('#rules tbody tr');

    $lines.each(function(i) {
        var matchType = $(this).find('.match_type').val();
        var match = $(this).find('.match_value').val();
        var replacementType = $(this).find('.replacement_type').val();
        var replacement = $(this).find('.replacement_value').val();

        if (validateRule(matchType, match, replacementType, replacement)) {
            matchesTypes.push(matchType);
            matches.push(match);
            replacementsTypes.push(replacementType);
            replacements.push(replacement);
        } else {
            window.alert("Oops ! Rule #"+(i+1)+" ("+match+" -> "+replacement+") is invalid.");
        }
    });
    chrome.storage.sync.set({
        matchesTypes: matchesTypes,
        matchesAsStrings: matches,
        replacementsTypes: replacementsTypes,
        replacementsAsStrings: replacements
    }, function() {
        anyValueModified = false;
        loadOptions();
        chrome.runtime.sendMessage({cmd: "reloadRules"});
    });
}

function closeWindow() {
    if (anyValueModified && confirm('Save changed values?'))
        saveOptions();
    
    chrome.tabs.getSelected(undefined, function(tab) {
     chrome.tabs.remove(tab.id);
    });
}

function appendLine(match_type, match_value, replacement_type, replacement_value) {
    var $new_line = $line.clone();
    if (match_type !== undefined) {
        $new_line.find('.match_type').val(match_type.toLowerCase());
        if (match_value !== undefined) {
            if (match_type === 'string')
                $new_line.find('.match_value').val(match_value);
            else
                $new_line.find('.match_value').val(match_value.toString());
        }
    }
    if (replacement_type !== undefined) {
        $new_line.find('.replacement_type').val(replacement_type.toLowerCase());
        if (replacement_value !== undefined) {
            if (replacement_type === 'string')
                $new_line.find('.replacement_value').val(replacement_value);
            else
                $new_line.find('.replacement_value').val(replacement_value.toString());
        }
    }
    $('#rules tbody').append($new_line);
}

function validateRule(matchType, match, replacementType, replacement) {
    return true;
    //return match !== "";
}
