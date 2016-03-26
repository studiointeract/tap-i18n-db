var test_collections = share.test_collections =
  {a: new TAPi18n.Collection("a"), // ids in a collection will only be those that % 3 = 0
  b: new TAPi18n.Collection("b"), // ids in a collection will only be those that % 3 = 1
  c: new TAPi18n.Collection("c"), // ids in a collection will only be those that % 3 = 2

  a_aa: new TAPi18n.Collection("a_aa", {base_language: "aa"}),
  b_aa: new TAPi18n.Collection("b_aa", {base_language: "aa"}),
  c_aa: new TAPi18n.Collection("c_aa", {base_language: "aa"})
  };

test_collections["a_aa-AA"] = new TAPi18n.Collection("a_aa-AA", {base_language: "aa-AA"});
test_collections["b_aa-AA"] = new TAPi18n.Collection("b_aa-AA", {base_language: "aa-AA"});
test_collections["c_aa-AA"] = new TAPi18n.Collection("c_aa-AA", {base_language: "aa-AA"});

var translations_editing_tests_collection = new TAPi18n.Collection("trans_editing");

translations_editing_tests_collection.allow({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

if (Meteor.isServer) {
  Meteor.publish("trans_editing", function() { return translations_editing_tests_collection.find({}); });
} else {
  Meteor.subscribe("trans_editing");
}

share.translations_editing_tests_collection = translations_editing_tests_collection;

for (var col in test_collections) {
  test_collections[col].allow({
    insert() { return true; },
    update() { return true; },
    remove() { return true; }
  });
}


var collection_classes_map = {
  a: 0,
  b: 1,
  c: 2
};

var languages = share.supported_languages = ["en", "aa", "aa-AA"];
var max_document_id = share.max_document_id = 30;

if (Meteor.isClient) {
  window.test_collections = test_collections;
  window.translations_editing_tests_collection = translations_editing_tests_collection;
}

var init_collections = function() {
  // clear all test collections
  for (var collection in test_collections) {
    test_collections[collection].remove({});
  }

  var properties_to_translate = ["not_translated_to_en", "not_translated_to_aa", "not_translated_to_aa-AA"];
  return (() => {
    var result = [];
    for (var i = 0; 0 < max_document_id ? i < max_document_id : i > max_document_id; 0 < max_document_id ? i++ : i--) {
      result.push((() => {
        var result1 = [];
        for (var collection_name in test_collections) {
          collection = test_collections[collection_name];
          var base_language = collection_name.replace(/(.*_|.*)/, "") || "en";
          var collection_class = collection_name.replace(/_.*/, "");

          if (i % 3 !== collection_classes_map[collection_class]) {
            continue;
          }

          var doc = {_id: `${share.lpad(i, 4)}`, id: i, i18n: {}};

          // init languages subdocuments
          for (var j = 0, language_tag; j < languages.length; j++) {
            language_tag = languages[j];
            if (language_tag !== base_language) {
              doc.i18n[language_tag] = {};
            }
          }

          for (var k = 0, language_tag; k < languages.length; k++) {
            language_tag = languages[k];
            for (var i1 = 0, property; i1 < properties_to_translate.length; i1++) {
              property = properties_to_translate[i1];
              var not_translated_to = property.replace("not_translated_to_", "");
              var value = `${property}-${language_tag}-${i}`;
              if (language_tag !== not_translated_to) {
                if (language_tag === base_language) {
                  var set_on = doc;
                } else {
                  set_on = doc.i18n[language_tag];
                }

                set_on[property] = value;
              }
            }
          }

          result1.push(collection.insert(doc));
        }
        return result1;
      })());
    }
    return result;
  })();
};

// Server inits
if (Meteor.isServer) {
  // init collections
  init_collections();

  var iterable = ["a", "b", "c"];
  for (var i = 0, _class; i < iterable.length; i++) {
    _class = iterable[i];
    (function(_class) {
      return TAPi18n.publish(`class_${_class}`, function(fields=null) {
        // connect to the 3 types of class
        var cursors = [];

        if (!(typeof fields !== "undefined" && fields !== null)) {
          cursors = cursors.concat(test_collections[`${_class}`].i18nFind());
          cursors = cursors.concat(test_collections[`${_class}_aa`].i18nFind());
          cursors = cursors.concat(test_collections[`${_class}_aa-AA`].i18nFind());
        } else {
          cursors = cursors.concat(test_collections[`${_class}`].i18nFind({}, {fields: fields}));
          cursors = cursors.concat(test_collections[`${_class}_aa`].i18nFind({}, {fields: fields}));
          cursors = cursors.concat(test_collections[`${_class}_aa-AA`].i18nFind({}, {fields: fields}));
        }

        return cursors;
      });
    })(_class);
  }
}
