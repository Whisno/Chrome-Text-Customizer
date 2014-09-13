Google Chrome Text Customizer
====

Chrome extension that runs through webpages, applying your find and replace rules. You can define rules in the extension's options page. They simply consist in :

  - Match : either a string or a regular expression
  - Replacement : either a string or a function that receives the text node in which the pattern was found and the result array (as returned by RegExp.prototype.exec())

So you can simply find/replace strings ('keyboard' -> 'leopard' for instance) or take it to another level and use custom functions to apply CSS to substrings, move them through the DOM and so forth. V8 power is all yours and altough it's a great power, it doesn't necessarily comes with a great responsibility ; so have fun.


Credit
===
Thanks to those dudes. Altough there's not much left of the code they wrote in this project, it did help me quite a lot.
  - https://github.com/stuartpb/s-keyboard-leopard-g
  - http://stackoverflow.com/questions/4060056/jquery-find-replace-without-changing-original-text/4060635#4060635
  - http://code.google.com/p/ireader-extension/


Feedback and pull requests highly appreciated !