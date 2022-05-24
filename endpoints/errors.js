const colors = require("colors");

const errors = {
  warn(text, ident) {
    const ident_str = "in [" + ident + "]";
    console.log("[warn]".bold.brightYellow, ident_str.dim, ":", text);
    return 1;
  },
  error(text, ident) {
    const ident_str = "in [" + ident + "]";
    console.log("[error]".bold.brightRed, ident_str.dim, ":", text);
    console.log(
      "[error]".bold.brightRed,
      "Critical error encountered, exiting now..."
    );
    process.exit(1);
  },
};

module.exports = errors;
