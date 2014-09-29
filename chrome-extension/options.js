var $line = $("\
<div class='rule'>\
    <button class='delete_line'><span class='glyphicon glyphicon-remove'></span></button>\
    <div class='match'>\
        <select class='type match_type'>\
            <option value='string' selected='selected'>Text</option>\
            <option value='regexp'>RegExp</option>\
        </select>\
        <div class='options string_options'>\
            <label class='has_tooltip' title='<b>Case Insensitive</b> : overlook charachters case (ex. A = a)' for='text_match_options_i'>\
                I <input checked='checked' type='checkbox' id='text_match_options_i' name='text_match_options_i' /></label>\
            <label class='has_tooltip' title='<b>Whole Word</b> : only match single words (words surrounded by white characters or punctuation)' for='text_match_options_w'>\
                W <input checked='checked' type='checkbox' id='text_match_options_w' name='text_match_options_w' /></label>\
        </div>\
        <div class='options regexp_options'>\
            <label class='has_tooltip' title='<b>Global</b> : A global regexp will match all patterns in a given string whereas a non-global pattern will stop after the first match' for='regexp_options_g'>\
                G <input checked='checked' type='checkbox' id='regexp_options_g' name='regexp_options_g' /></label>\
            <label class='has_tooltip' title='<b>Case Insensitive</b> : overlook charachters case (ex. A = a)' for='regexp_options_i'>\
                I <input type='checkbox' id='regexp_options_i' name='regexp_options_i' /></label>\
            <!--<label class='has_tooltip' title='<b>Multiline</b> : use ^ to match the begining of a line and $ to match the end of a line.' for='regexp_options_m'>\
                M <input type='checkbox' id='regexp_options_m' name='regexp_options_m' /></label>-->\
        </div>\
        <span data-toggle='modal' data-target='#modal_help_regexp' class='btn_help glyphicon glyphicon-question-sign'></span>\
        <br/>\
        <textarea class='value match_value' placeholder='Match'></textarea>\
    </div>\
    <span class='glyphicon glyphicon-arrow-right'></span>\
    <div class='replacement'>\
        <select class='type replacement_type'>\
            <option value='string' selected='selected'>Text</option>\
            <option value='function'>Function</option>\
        </select>\
        <div class='options string_options'>\
            <label class='has_tooltip' title='<b>Preserve case</b> : Apply the capitalization of the match to the replacement (first letter capitalized / all lowercase / all uppercase)' for='text_rep_options_p'>\
                P <input checked='checked' type='checkbox' id='text_rep_options_p' name='text_rep_options_p' /></label>\
        </div>\
        <div class='options function_options'></div>\
        <span data-toggle='modal' data-target='#modal_help_function' class='btn_help glyphicon glyphicon-question-sign'></span>\
        <br/>\
        <textarea class='value replacement_value' placeholder='Replace'></textarea>\
    </div>\
    <div class='clearer'></div>\
</div>");

var anyValueModified = false;

document.addEventListener('DOMContentLoaded', function() {
    // Event handlers on static content
    $('#btn_save').click(function() {
        saveOptions();
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
    $('body').on('change', '.rule .replacement_type', function() {
        replacementTypeChanged($(this).closest(".rule"));
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
        $('#rules').empty();

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
    var all_rules_valid = true;
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

            // String match options
            if (matchType === "string") {
                var text_i = $line.find("#text_match_options_i").is(':checked');
                var text_w = $line.find("#text_match_options_w").is(':checked');
                matchOptions = (text_i?'i':'')+(text_w?'w':'');
            }
            // RegExp options
            if (matchType === "regexp") {
                var reg_g = $line.find("#regexp_options_g").is(':checked');
                var reg_i = $line.find("#regexp_options_i").is(':checked');
                var reg_m = $line.find("#regexp_options_m").is(':checked');
                matchOptions = (reg_g?'g':'')+(reg_i?'i':'')+(reg_m?'m':'');
            }
            // String replacement options
            if (replacementType === "string") {
                var text_p = $line.find("#text_rep_options_p").is(':checked');
                replacementOptions = (text_p?'p':'');
            }
            // Function options
            if (replacementType === "function") {}

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
                $(this).removeClass("invalid");
            } else {
                all_rules_valid = false;
                $(this).addClass("invalid");
            }
        });
    }
    if (all_rules_valid) {
        chrome.storage.sync.set({
            matches: matches,
            replacements: replacements
        }, function() {
            showNotification("Rules saved !", "success", 1000);
            anyValueModified = false;
            loadOptions();
        });
    } else {
        showNotification("Oops ! There's something wrong with highlighted rules.","danger", 5000);
    }
}

function appendLine(match, replacement) {
    var $new_line = $line.clone();
    if (match !== undefined) {
        $new_line.find('.match_type').val(match.type);
        $new_line.find('.match_value').val(match.string);
        if (match.type === "string") {
            $new_line.find('#text_match_options_i').prop('checked', match.options.indexOf('i') !== -1);
            $new_line.find('#text_match_options_w').prop('checked', match.options.indexOf('w') !== -1);
        }
        if (match.type === "regexp") {
            $new_line.find('#regexp_options_g').prop('checked', match.options.indexOf('g') !== -1);
            $new_line.find('#regexp_options_i').prop('checked', match.options.indexOf('i') !== -1);
            $new_line.find('#regexp_options_m').prop('checked', match.options.indexOf('m') !== -1);
        }
    }
    if (replacement !== undefined) {
        $new_line.find('.replacement_type').val(replacement.type);
        $new_line.find('.replacement_value').val(replacement.string);
        if (replacement.type === "string") {
            $new_line.find('#text_rep_options_p').prop('checked', replacement.options.indexOf('p') !== -1);
        }
    }
    $('#rules').append($new_line);
    $new_line.find(".has_tooltip").tooltip({html: true});
    matchTypeChanged($new_line);
    replacementTypeChanged($new_line);
}

function matchTypeChanged($rule) {
    if ($rule.find(".match_type").val() === 'regexp') {
        $rule.find(".match .string_options").css("display", "none");
        $rule.find(".match .regexp_options").css("display", "inline-block");
        $rule.find("span[data-target='#modal_help_regexp']").show();
    } else {
        $rule.find(".match .string_options").css("display", "inline-block");
        $rule.find(".match .regexp_options").css("display", "none");
        $rule.find("span[data-target='#modal_help_regexp']").hide();
    }
}

function replacementTypeChanged($rule) {
    if ($rule.find(".replacement_type").val() === 'function') {
        $rule.find(".replacement .string_options").css("display", "none");
        $rule.find(".replacement .function_options").css("display", "inline-block");
        $rule.find("span[data-target='#modal_help_function']").show();
    } else {
        $rule.find(".replacement .string_options").css("display", "inline-block");
        $rule.find(".replacement .function_options").css("display", "none");
        $rule.find("span[data-target='#modal_help_function']").hide();
    }

}

function showNotification(string, type, duration) {
    $("#notifications").empty().append("<div class='alert alert-"+type+"' style='display: none;'>"+string+"</div>");
    $("#notifications .alert").slideDown(300).delay(duration).slideUp(300, function() { $(this).remove() });
}

function validateRule(match, replacement) {
    return match.string !== "";
}
