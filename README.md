# Chrome Text Customizer

Google Chrome extension that runs through webpages when they are loaded, applying your find and replace rules. You can define rules in the extension's options page. They simply consist in :

  - Match : either a string or a regular expression
  - Replacement : either a string or a function that receives arguments (node, match), where 'node' is the DOM node in which there was a match and 'match' the result array (as returned by RegExp.prototype.exec())

So you can simply find/replace strings ('keyboard' -> 'leopard' for instance) or take it to another level and use custom functions to apply CSS to substrings, move them through the DOM and so forth.


## Known issues

- Whole-word replacements don't work with words containing non-ASCII characters, thanks to javascript regexp \b implementation. This is a little tricky to fix since this implementation also doesn't support lookbehind, so at best we can match (non-word character, word, non-word character) and receive from the regexp (non-word character, word). This would require to wrap replacement functions in a function that cleanse the regexp match parameter. Or maybe adapt the regexp : http://stackoverflow.com/a/7376612
