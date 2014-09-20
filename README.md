# Chrome Text Customizer

Google Chrome extension that runs through webpages, applying your find and replace rules. You can define rules in the extension's options page. They simply consist in :

  - Match : either a string or a regular expression
  - Replacement : either a string or a function that receives arguments (node, match), where 'node' is the DOM node in which there was a match and 'match' the result array (as returned by RegExp.prototype.exec())

So you can simply find/replace strings ('keyboard' -> 'leopard' for instance) or take it to another level and use custom functions to apply CSS to substrings, move them through the DOM and so forth.


## Credit

Thanks to these people for inspiration and code examples :

- https://github.com/stuartpb/s-keyboard-leopard-g
- http://stackoverflow.com/a/4060635
- http://stackoverflow.com/a/15710692
