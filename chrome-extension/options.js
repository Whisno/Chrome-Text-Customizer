var anyValueModified = false;
var $line = $("\
<div class='rule'>\
    <button class='delete_line'><span class='glyphicon glyphicon-remove'></span></button>\
    <div class='match'>\
        <select class='type match_type'>\
            <option value='string' selected='selected'>Text</option>\
            <option value='regexp'>RegExp</option>\
        </select>\
        <div class='regexp_options'>\
            <label for='regexp_options_g'>Global <input type='checkbox' id='regexp_options_g' name='regexp_options_g' /></label>\
            <label for='regexp_options_i'>Case insensitive <input type='checkbox' id='regexp_options_i' name='regexp_options_i' /></label>\
            <label for='regexp_options_m'>Multiline <input type='checkbox' id='regexp_options_m' name='regexp_options_m' /></label>\
        </div><br/>\
        <textarea class='value match_value' placeholder='Match'></textarea>\
    </div>\
    <span class='glyphicon glyphicon-arrow-right'></span>\
    <div class='replacement'>\
        <select class='type replacement_type'>\
            <option value='string' selected='selected'>Text</option>\
            <option value='function'>Function</option>\
        </select><br/>\
        <textarea class='value replacement_value' placeholder='Replace'></textarea>\
    </div>\
    <div class='clearer'></div>\
</div>");

document.addEventListener('DOMContentLoaded', function() {
    // Event handlers on static content
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
    $('body').on('change', 'input, select, textarea', function() {
        anyValueModified = true;
    });
    $('body').on('change', '.rule select', function() {
        $(this).nextAll("textarea")[0].focus();
    });
    $('body').on('change', '.rule .match_type', function() {
        matchTypeChanged($(this).closest(".rule"));
    });
    $('body').on('focus', '#rules textarea', function() {
        var $this = $(this);
        $this.select();
        $this.mouseup(function() {
            $this.unbind("mouseup");
            return false;
        });
    });
    $('body').on('click', '.delete_line', function() {
        anyValueModified = true;
        $(this).closest('.rule').remove();
        if ($("#rules .rule").length === 0)
            appendLine();
    });

    loadOptions();

}, false);

function loadOptions() {
    chrome.storage.sync.get({
        matches: [],
        replacements: [],
    }, function(options) {
        var $table = $('#rules');
        $table.empty();

        for (var i=0; i<options.matches.length; i++) {
            var match = options.matches[i];
            var replacement = options.replacements[i];
            appendLine(match, replacement)
        }
        if (options.matches.length === 0)
            appendLine();
    });
}

function saveOptions() {
    var matches = [];
    var replacements = [];
    var $lines = $('#rules .rule');

    var no_rule_defined = ($lines.length === 1 &&
        $($lines[0]).find('.match_value').val() === "" &&
        $($lines[0]).find('.replacement_value').val() === "");

    if (! no_rule_defined) {
        $lines.each(function(i) {
            var $line = $(this);
            var matchStr = $line.find('.match_value').val();
            var matchType = $line.find('.match_type').val();
            var matchOptions = "";
            var replacementStr = $line.find('.replacement_value').val();
            var replacementType = $line.find('.replacement_type').val();
            var replacementOptions = "";

            // RegExp options
            if (matchType === "regexp") {
                var reg_g = $line.find("#regexp_options_g").is(':checked');
                var reg_i = $line.find("#regexp_options_i").is(':checked');
                var reg_m = $line.find("#regexp_options_m").is(':checked');
                matchOptions = (reg_g?'g':'')+(reg_i?'i':'')+(reg_m?'m':'');
            }

            var match = {
                string: matchStr,
                type: matchType,
                options: matchOptions
            };
            var replacement = {
                string: replacementStr,
                type: replacementType,
                options: replacementOptions
            };

            if (validateRule(match, replacement)) {
                matches.push(match);
                replacements.push(replacement);
            } else {
                window.alert("Oops ! Rule #"+(i+1)+" ("+match+" -> "+replacement+") is invalid.");
            }
        });
    }
    chrome.storage.sync.set({
        matches: matches,
        replacements: replacements
    }, function() {
        $("#notifications").append("<div class='alert alert-success' style='display: none;'>Rules saved !</div>");
        $("#notifications .alert").slideDown(300).delay(1000).slideUp(300, function() { $(this).remove() });
        anyValueModified = false;
        loadOptions();
    });
}

function appendLine(match, replacement) {
    var $new_line = $line.clone();
    if (match !== undefined) {
        $new_line.find('.match_type').val(match.type);
        $new_line.find('.match_value').val(match.string);
        if (match.type === "regexp") {
            if (match.options.indexOf('g') !== -1)
                $new_line.find('#regexp_options_g').prop('checked', true);
            if (match.options.indexOf('i') !== -1)
                $new_line.find('#regexp_options_i').prop('checked', true);
            if (match.options.indexOf('m') !== -1)
                $new_line.find('#regexp_options_m').prop('checked', true);
        }
    }
    if (replacement !== undefined) {
        $new_line.find('.replacement_type').val(replacement.type);
        $new_line.find('.replacement_value').val(replacement.string);
    }
    $('#rules').append($new_line);
    matchTypeChanged($new_line);
}

function matchTypeChanged($rule) {
    if ($rule.find(".match_type").val() === 'regexp')
        $rule.find(".regexp_options").css("display", "inline-block");
    else
        $rule.find(".regexp_options").css("display", "none");
}

function validateRule(match, replacement) {
    return true;
    //return match !== "";
}

function closeWindow() {
    if (anyValueModified && confirm('Save changed values?'))
        saveOptions();
    window.close();
}
