document.addEventListener('DOMContentLoaded', function() {
    var anyValueModified = false;
    $("#body input, #body select").change(function() {
        anyValueModified = true;
    });
    $("#btnSave").click(function() {
        saveOptions();
    });
    $("#btnClose").click(function() {
        closeWindow();
    });
    loadOptions();
}, false);

function loadOptions() {
    chrome.storage.sync.get({
        matches: [],
        replacements: []
    }, function(options) {
        if (options.matches.length !== options.replacements.length) {
            console.error("[Chrome Text Customizer] : pattern and replacement are not of the same length.");
            options.matches = [];
            options.replacements = [];
        }
        var $table = $('tbody');
        $table.empty();
        var $line = $("<tr><td class='match'><select class='match_type'><option name='string' selected='selected'>string</option><option name='regexp'>regexp</option></select><textarea class='match_value'></textarea></td><td class='replacement'><select class='replacement_type'><option name='string' selected='selected'>string</option><option name='function'>function</option></select><textarea class='replacement_value'></textarea></td></tr>");

        for (var i=0; i<options.matches.length; i++) {
            var match = options.matches[i];
            var replacement = options.replacements[i];
            $new_line = $line.clone();
            $new_line.find(".match_type").val(typeof(match));
            $new_line.find(".match_value").val(match);
            $new_line.find(".replacement_type").val(typeof(replacement));
            $new_line.find(".replacement_value").val(replacement);
            $table.append($new_line);
        }
        $table.append($line.clone());
    });
}

function saveOptions() {
    var matches = [];
    var replacements = [];
    var $lines = $('tbody tr');
    $lines.each(function() {
        var $line = $(this);
        if ($line.find(".match_type").val() === 'string')
            matches.push($line.find(".match_value").val());
        else if ($line.find(".match_type").val() === 'regexp')
            matches.push(new Regexp($line.find(".match_value").val()));
        else
            throw new Error("Oh noes !");

        if ($line.find(".replacement_type").val() === 'string')
            replacements.push($line.find(".replacement_value").val());
        else if ($line.find(".replacement_type").val() === 'function')
            replacements.push(new Function($line.find(".replacement_value").val()));
        else
            throw new Error("Oh noes !");
    });
    chrome.storage.sync.set({
        matches: matches,
        replacements: replacements
    }, function() {
        anyValueModified = false;
        window.alert("M'kay !");
        loadOptions();
    });
}

function closeWindow() {
    if (anyValueModified && confirm("Save changed values?"))
        saveOptions();
    
    chrome.tabs.getSelected(undefined, function(tab) {
     chrome.tabs.remove(tab.id);
    });
}