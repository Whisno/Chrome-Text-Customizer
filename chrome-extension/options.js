/* global chrome:false */

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
        matches: [],
        replacements: []
    }, function(options) {
        if (options.matches.length !== options.replacements.length) {
            console.error('[Chrome Text Customizer] : matches and replacements are not of the same length.');
            options.matches = [];
            options.replacements = [];
        }
        var $table = $('#rules tbody');
        $table.empty();

        for (var i=0; i<options.matches.length; i++) {
            var match = options.matches[i];
            var replacement = options.replacements[i];
            appendLine(typeof(match), match, typeof(replacement), replacement)
        }
        if (options.matches.length === 0)
            appendLine();
    });
}

function saveOptions() {
    var matches = [];
    var replacements = [];
    var $lines = $('#rules tbody tr');
    $lines.each(function(i) {
        var $line = $(this);
        var match, replacement;

        if ($line.find('.match_type').val() === 'string')
            match = $line.find('.match_value').val();
        else if ($line.find('.match_type').val() === 'regexp')
            match = new RegExp($line.find('.match_value').val());
        else
            throw new Error('Oh noes !');

        if ($line.find('.replacement_type').val() === 'string')
            replacement = $line.find('.replacement_value').val();
        else if ($line.find('.replacement_type').val() === 'function')
            replacement = new Function('node', 'match', $line.find('.replacement_value').val());
        else
            throw new Error('Oh noes !');

        if (validateRule(match, replacement)) {
            matches.push(match);
            replacements.push(replacement);
        } else {
            window.alert("Oops ! Rule #"+(i+1)+" ("+match+" -> "+replacement+") is invalid.")
        }
    });
    chrome.storage.sync.set({
        matches: matches,
        replacements: replacements
    }, function() {
        anyValueModified = false;
        loadOptions();
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
        $new_line.find('.match_type').val(match_type);
        if (match_value !== undefined) {
            if (match_type === 'string')
                $new_line.find('.match_value').val(match_value);
            else
                $new_line.find('.match_value').val(match_value.toString());
        }
    }
    if (replacement_type !== undefined) {
        $new_line.find('.replacement_type').val(replacement_type);
        if (replacement_value !== undefined) {
            if (replacement_type === 'string')
                $new_line.find('.replacement_value').val(replacement_value);
            else
                $new_line.find('.replacement_value').val(replacement_value.toString());
        }
    }
    $('#rules tbody').append($new_line);
}

function validateRule(match, replacement) {
    return true;
    //return match !== "";
}
