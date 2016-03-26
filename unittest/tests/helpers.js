share.lpad = function(value, padding) {
  var zeroes = "0";
  for (var i = 1; 1 < padding ? i <= padding : i >= padding; 1 < padding ? i++ : i--) {
    zeroes += "0";
  }
  return (zeroes + value).slice(padding * -1);
};

share.once = function(cb) {
  return function() {
    if (!(cb.once != null)) {
      cb.once = true;
      return cb();
    }
  };
};

share.dialectOf = function(lang) {
  var ref;
  if ((typeof lang !== "undefined" && lang !== null) && (ref = "-", lang.indexOf(ref) >= 0)) {
    return lang.replace(/-.*/, "");
  }
  return null;
};

share.now = function() {
  return new Date().getTime();
};
