let extend;
if (Meteor.isServer) {
  extend = Npm.require('extend');
}
else {
  extend = $.extend;
}

const transform = function(options) {
  return (doc) => {
    if (options.transform) {
      doc = options.transform(doc);
    }

    if (!options.lang || !doc.i18n) {
      delete doc.i18n;
      return doc
    }

    doc = extend({}, doc); // protect original object.
    if (doc.i18n[options.lang]) {
      extend(doc, doc.i18n[options.lang]);
    }

    delete doc.i18n;

    return doc;
  }
};

const removeTrailingUndefs = function(arr) {
  while ((!_.isEmpty(arr)) && (_.isUndefined(_.last(arr)))) {
    arr.pop();
  }
  return arr;
};

const dialectOf = function(lang) {
  let ref;
  if ((typeof lang !== "undefined" && lang !== null) && (ref = "-", lang.indexOf(ref) >= 0)) {
    return lang.replace(/-.*/, "");
  }
  return null;
};

class TAPi18nCollection extends Mongo.Collection {
  constructor(name, options) {
    super(name, options = {});
    this._base_language = "base_language" in options ? options["base_language"] : globals.fallback_language;
  }

  find(selector = {}, options = {}) {
    if (!options.lang) {
      options.lang = TAPi18n.getLanguage();
    }

    // Allow for null language to return the full document.
    if (options.lang == null) {
      return super.find(selector, options);
    }

    if (options.lang != 'en') {
      let _selector = extend({}, selector);
      selector = {};
      for (let prop in _selector) {
        let orFieldQuery = {$or: [
          { [prop]: _selector[prop] },
          { [`i18n.${options.lang}.${prop}`]: _selector[prop] }
        ]};
        if (_selector.length > 1) {
          selector['$and'] = [];
          selector['$and'].push(orFieldQuery);
        }
        else if (prop != '_id') {
          selector = orFieldQuery;
        }
        else {
          selector = _selector;
        }
      }
    }

    let dialect_of = dialectOf(options.lang);
    let collection_base_language = this._base_language;

    let supported_languages = TAPi18n.conf.supported_languages || Object.keys(TAPi18n.languages_names);
    if ((typeof options.lang !== "undefined" && options.lang !== null) && !(supported_languages.indexOf(options.lang) >= 0)) {
      throw new Meteor.Error(400, `Not supported language "${options.lang}", are you subscribing to the collection "${this._name}" using the TAPi18n.subscribe and not Meteor.subscribe`);
    }

    let original_fields = options.fields || {};
    let i18n_fields = extend({}, original_fields);

    if (!_.isEmpty(i18n_fields)) {
      // determine the projection kind
      // note that we don't need to address the case where {_id: 0}, since _id: 0
      // is not allowed for cursors returned from a publish function
      delete i18n_fields._id;
      let white_list_projection = _.first(_.values(i18n_fields)) === 1;
      if ("_id" in original_fields) {
        i18n_fields["_id"] = original_fields["_id"];
      }

      if (white_list_projection) {
        if (lang !== null) {
          for (let i = 0, lang; i < supported_languages.length; i++) {
            lang = supported_languages[i];
            if (lang !== collection_base_language && ((lang === options.lang) || (lang === dialect_of))) {
              for (let field in original_fields) {
                let ref;
                if (field !== "_id" && !((ref = ".", field.indexOf(ref) >= 0))) {
                  i18n_fields[`i18n.${lang}.${field}`] = 1;
                }
              }
            }
          }
        }
      } else {
        // black list
        if (options.lang === null) {
          i18n_fields.i18n = 0;
        } else {
          for (let j = 0, lang; j < supported_languages.length; j++) {
            lang = supported_languages[j];
            if (lang !== collection_base_language) {
              if (lang !== options.lang && lang !== dialect_of) {
                i18n_fields[`i18n.${lang}`] = 0;
              } else {
                for (let field in original_fields) {
                  let ref1;
                  if (field !== "_id" && !((ref1 = ".", field.indexOf(ref1) >= 0))) {
                    i18n_fields[`i18n.${lang}.${field}`] = 0;
                  }
                }
              }
            }
          }
        }
      }
    } else {
      if (options.lang === null) {
        i18n_fields.i18n = 0;
      } else {
        for (let k = 0, lang; k < supported_languages.length; k++) {
          lang = supported_languages[k];
          if (lang !== collection_base_language && lang !== options.lang && lang !== dialect_of) {
            i18n_fields[`i18n.${lang}`] = 0;
          }
        }
      }
    }

    return super.find(selector, Object.assign({}, options, {
      transform: transform(options),
      fields: i18n_fields
    }));
  }

  findOne(selector, options = {}) {
    return this.find(selector, options).fetch()[0];
  }
}

TAPi18n.Collection = TAPi18nCollection;

TAPi18n.publish = function(name, handler, options) {
  if (name === null) {
    throw new Meteor.Error(500, "TAPi18n.publish doesn't support null publications");
  }

  let i18n_handler = function() {
    let args = extend([], arguments);
    let language = args.pop();
    TAPi18n.setLanguage(language);
    this.language = language;

    // Call the user handler without the language_tag argument
    let cursors = handler.apply(this, args);

    if ((typeof cursors !== "undefined" && cursors !== null)) {
      return cursors;
    }
  };

  // set the actual publish method
  return Meteor.publish.apply(this, [name, i18n_handler, options]);
};

TAPi18n.subscribe = function(name) {
  let params = Array.prototype.slice.call(arguments, 1);
  let callbacks;
  if (params.length) {
    let lastParam = params[params.length - 1];
    if (typeof lastParam === "function") {
      callbacks.onReady = params.pop();
    } else if (lastParam && (typeof lastParam.onReady === "function" || typeof lastParam.onError === "function")) {
      callbacks = params.pop();
    }
  }

  params.push(TAPi18n.getLanguage());
  return Meteor.subscribe.apply(this, removeTrailingUndefs([name, ...params, callbacks]));
};

if (Meteor.isServer) {
  TAPi18n.setLanguage = function(language) {
    this._current_language = language;
  }
  TAPi18n.getLanguage = function(language) {
    return this._current_language;
  }
}
