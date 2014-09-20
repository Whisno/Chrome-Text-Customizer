var anyValueModified = false;
var $line = $("\
<div class='rule'>\
    <button class='delete_line'><span class='glyphicon glyphicon-remove'></span></button>\
    <div class='match'>\
        <select class='match_type'>\
            <option name='string' selected='selected'>string</option>\
            <option name='regexp'>regexp</option>\
        </select><br/>\
        <textarea class='match_value' placeholder='Match'></textarea>\
    </div>\
    <div class='replacement'>\
        <select class='replacement_type'>\
            <option name='string' selected='selected'>string</option>\
            <option name='function'>function</option>\
        </select><br/>\
        <textarea class='replacement_value' placeholder='Replace'></textarea>\
    </div>\
    <div class='clearer'></div>\
</div>");

document.addEventListener('DOMContentLoaded', function() {
    // Event handlers on static content
    $('input, select').change(function() {
        anyValueModified = true;
    });
    $('#btn_save').click(function() {
        saveOptions();
    });
    $('#btn_close').click(function() {
        closeWindow();
    });
    $('#add_line').click(function() {
        appendLine();
    });
    // Event handlers on dynamic content
    $('body').on('focus', '#rules textarea', function() {
        var $this = $(this);
        $this.select();
        $this.mouseup(function() {
            $this.unbind("mouseup");
            return false;
        });
    });
    $('body').on('click', '.delete_line', function() {
        $(this).closest('.rule').remove();
        if ($("#rules .rule").length === 0)
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
        var $table = $('#rules');
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
    var $lines = $('#rules .rule');

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
        $("#notifications").append("<div class='alert alert-success' style='display: none;'>Rules saved !</div>");
        $("#notifications .alert").slideDown(300).delay(1000).slideUp(300, function() { $(this).remove() });
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
    $('#rules').append($new_line);
}

function validateRule(matchType, match, replacementType, replacement) {
    return true;
    //return match !== "";
}
