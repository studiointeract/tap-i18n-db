var test_collections = share.test_collections;
var translations_editing_tests_collection = share.translations_editing_tests_collection;
var idle_time = 2000;
var once = share.once;



Tinytest.add('tap-i18n-db - translations editing - insertTranslations - valid test', function(test) {
  var _id;
  return test.equal(translations_editing_tests_collection.findOne(_id = translations_editing_tests_collection.insertTranslations({a: 1, b: 5}, {aa: {c: 3}, en: {b: 2, d: 4}}), {transform: null}), {a: 1, b: 2, d: 4, i18n: {aa: {c: 3}}, _id: _id});
});

Tinytest.add('tap-i18n-db - translations editing - insertTranslations - no translations', function(test) {
  var _id;
  return test.equal(translations_editing_tests_collection.findOne(_id = translations_editing_tests_collection.insertTranslations({a: 1, b: 2}), {transform: null}), {a: 1, b: 2, _id: _id});
});

Tinytest.addAsync('tap-i18n-db - translations editing - insertTranslations - unsupported lang', function(test, onComplete) {
  var result;
  return result = translations_editing_tests_collection.insertTranslations({a: 1, b: 2}, {ru: {c: 3}}, function(err, id) {
              test.isFalse(id);
              test.instanceOf(err, Meteor.Error);
              test.equal(err.reason, "Not supported language: ru");
              test.isNull(result);
              return onComplete();
  });
});

Tinytest.addAsync('tap-i18n-db - translations editing - insertLanguage - language: collection\'s base language', function(test, onComplete) {
  return translations_editing_tests_collection.insertLanguage({a: 1, b: 5}, {b: 2, d: 4}, "en", function(err, id) {
              test.equal(translations_editing_tests_collection.findOne(id, {transform: null}), {a: 1, b: 2, d: 4, _id: id});
              return onComplete();
  });
});

Tinytest.add('tap-i18n-db - translations editing - insertLanguage - language: not collection\'s base language', function(test) {
              var _id;
              return test.equal(translations_editing_tests_collection.findOne(_id = translations_editing_tests_collection.insertLanguage({a: 1, b: 5}, {b: 2, d: 4}, "aa"), {transform: null}), {a: 1, b: 5, i18n: {aa: {b: 2, d: 4}}, _id: _id});
});

Tinytest.addAsync('tap-i18n-db - translations editing - insertLanguage - language: not supported language', function(test, onComplete) {
  var result;
  return result = translations_editing_tests_collection.insertLanguage({a: 1, b: 5}, {b: 2, d: 4}, "ru", function(err, id) {
              test.isFalse(id);
              test.instanceOf(err, Meteor.Error);
              test.equal(err.reason, "Not supported language: ru");
              test.isNull(result);
              return onComplete();
  });
});

Tinytest.addAsync('tap-i18n-db - translations editing - insertLanguage - language: not specified', function(test, onComplete) {
  var result;
  return result = translations_editing_tests_collection.insertLanguage({a: 1, b: 5}, {b: 2, d: 4}, function(err, id) {
              test.isFalse(id);
              test.instanceOf(err, Meteor.Error);
              test.equal(err.reason, "Missing language_tag");
              test.isNull(result);
              return onComplete();
  });
});

Tinytest.addAsync('tap-i18n-db - translations editing - updateTranslations - valid update', function(test, onComplete) {
  var _id = translations_editing_tests_collection.insertTranslations({a: 5, b: 6}, {aa: {x: 4, y: 5}, "aa-AA": {l: 1, m: 2}});
  var result = translations_editing_tests_collection.updateTranslations(_id, {en: {a: 1}, aa: {x: 1}});
  result = translations_editing_tests_collection.updateTranslations(_id, {en: {b: 2, c: 3}, aa: {y: 2, z: 3}, "aa-AA": {n: 3}});
  test.equal(result, 1, "Correct number of affected documents");
  test.equal(translations_editing_tests_collection.findOne(_id, {transform: null}), {a: 1, b: 2, c: 3, i18n: {aa: {x: 1, y: 2, z: 3}, "aa-AA": {l: 1, m: 2, n: 3}}, _id: _id});
  return onComplete();
});

Tinytest.addAsync('tap-i18n-db - translations editing - updateTranslations - empty update', function(test, onComplete) {
  var _id = translations_editing_tests_collection.insertTranslations({a: 1}, {aa: {x: 1}});
  var result = translations_editing_tests_collection.updateTranslations(_id);
  test.equal(translations_editing_tests_collection.findOne(_id, {transform: null}), {a: 1, i18n: {aa: {x: 1}}, _id: _id});
  test.equal(result, 1, "Correct number of affected documents");
  return onComplete();
});

Tinytest.addAsync('tap-i18n-db - translations editing - updateTranslations - unsupported lang', function(test, onComplete) {
  var result;
  var _id = translations_editing_tests_collection.insertTranslations({a: 1}, {aa: {x: 1}});
  return result = translations_editing_tests_collection.updateTranslations(_id, {ru: {c: 3}}, function(err, id) {
              test.isFalse(id);
              test.instanceOf(err, Meteor.Error);
              test.equal(err.reason, "Not supported language: ru");
              test.isNull(result);
              return onComplete();
  });
});

Tinytest.addAsync('tap-i18n-db - translations editing - translate - valid update', function(test, onComplete) {
  var _id = translations_editing_tests_collection.insertTranslations({a: 5, b: 2}, {aa: {x: 4, y: 2}});
  var result = translations_editing_tests_collection.translate(_id, {a: 1, c: 3}, "en");
  test.equal(result, 1, "Correct number of affected documents");
  result = translations_editing_tests_collection.translate(_id, {x: 1, z: 3}, "aa", {});
  test.equal(result, 1, "Correct number of affected documents");
  return result = translations_editing_tests_collection.translate(_id, {l: 1, m: 2, n: 3}, "aa-AA", {}, function(err, affected_rows) {
    return Meteor.setTimeout( (function() {
      test.equal(1, affected_rows);
      test.equal(translations_editing_tests_collection.findOne(_id, {transform: null}), {a: 1, b: 2, c: 3, i18n: {aa: {x: 1, y: 2, z: 3}, "aa-AA": {l: 1, m: 2, n: 3}}, _id: _id});
      return onComplete();
    }
    ), 1000
    );
  });
});

Tinytest.add('tap-i18n-db - translations editing - remove translation - valid remove', function(test) {
  var _id = translations_editing_tests_collection.insertTranslations({a: 1, b: 2}, {aa: {x: 1, y: 2}, "aa-AA": {l: 1, m: 2}});
  var result = translations_editing_tests_collection.removeTranslations(_id, ["en.a", "aa.y", "aa-AA"]); // remove some fields and the entire AA-aa lang
  test.equal(result, 1, "Correct number of affected documents");
  result = translations_editing_tests_collection.removeTranslations(_id, [], {}); // remove nothing
  test.equal(result, 1, "Correct number of affected documents");
  return test.equal(translations_editing_tests_collection.findOne(_id, {transform: null}), {b: 2, i18n: {aa: {x: 1}}, _id: _id});
});

Tinytest.addAsync('tap-i18n-db - translations editing - remove translation - attempt to remove base language', function(test, onComplete) {
  var result;
  var _id = translations_editing_tests_collection.insertTranslations({a: 1, b: 2}, {aa: {x: 1, y: 2}, "aa-AA": {l: 1, m: 2}});
  return result = translations_editing_tests_collection.removeTranslations(_id, ["en"], function(err, affected_rows) {
               test.isFalse(affected_rows);
               test.instanceOf(err, Meteor.Error);
               test.equal(err.reason, "Complete removal of collection's base language from a document is not permitted");
               test.isNull(result);

               return onComplete();
  });
});

Tinytest.addAsync('tap-i18n-db - translations editing - remove translation - fields argument is not an array', function(test, onComplete) {
  var result;
  var _id = translations_editing_tests_collection.insertTranslations({a: 1, b: 2}, {aa: {x: 1, y: 2}, "aa-AA": {l: 1, m: 2}});
  return result = translations_editing_tests_collection.removeTranslations(_id, {}, function(err, affected_rows) {
               test.isFalse(affected_rows);
               test.instanceOf(err, Meteor.Error);
               test.isNull(result);

               return onComplete();
  });
});

Tinytest.addAsync('tap-i18n-db - translations editing - remove language - valid remove', function(test, onComplete) {
  var _id = translations_editing_tests_collection.insertTranslations({a: 1, b: 2, c: 3}, {aa: {x: 1, y: 2}, "aa-AA": {l: 1, m: 2}});
  var result = translations_editing_tests_collection.removeLanguage(_id, ["a", "c"], "en"); // remove some fields - base lang
  test.equal(result, 1, "Correct number of affected documents");
  result = translations_editing_tests_collection.removeLanguage(_id, ["x"], "aa", {}, function(err, affected_rows) { // remove some fields - general lang
    return test.equal(affected_rows, 1, "Correct number of affected documents");
  });
  result = translations_editing_tests_collection.removeLanguage(_id, [], "aa"); // remove nothing - general lang
  test.equal(result, 1, "Correct number of affected documents");
  return result = translations_editing_tests_collection.removeLanguage(_id, null, "aa-AA", function(err, affected_rows) { // remove entire language
    return Meteor.setTimeout((function() {
      test.equal(affected_rows, 1, "Correct number of affected documents");

      test.equal(translations_editing_tests_collection.findOne(_id, {transform: null}), {b: 2, i18n: {aa: {y: 2}}, _id: _id});

      return onComplete();
    })
    );
  });
});

Tinytest.addAsync('tap-i18n-db - translations editing - remove language - attempt to remove base language', function(test, onComplete) {
  var _id = translations_editing_tests_collection.insertTranslations({a: 1, b: 2, c: 3}, {aa: {x: 1, y: 2}, "aa-AA": {l: 1, m: 2}});
  return translations_editing_tests_collection.removeLanguage(_id, null, "en", function(err, affected_rows) {
    return Meteor.setTimeout((function() {
      test.isFalse(affected_rows);
      test.instanceOf(err, Meteor.Error);
      test.equal(err.reason, "Complete removal of collection's base language from a document is not permitted");

      return onComplete();
    })
    );
  });
});

Tinytest.addAsync('tap-i18n-db - translations editing - remove language - fields argument is not an array', function(test, onComplete) {
  var result;
  var _id = translations_editing_tests_collection.insertTranslations({a: 1, b: 2}, {aa: {x: 1, y: 2}, "aa-AA": {l: 1, m: 2}});
  return result = translations_editing_tests_collection.removeLanguage(_id, {}, "aa", function(err, affected_rows) {
              test.isFalse(affected_rows);
              test.instanceOf(err, Meteor.Error);
              test.isNull(result);
              return onComplete();
  });
});

if (Meteor.isServer) {
  Tinytest.add('tap-i18n-db - TAPi18n.i18nFind works only from TAPi18n.publish', function(test) {
    return test.throws((function() { return test_collections.a.i18nFind(); }), "TAPi18n.i18nFind should be called only from TAPi18n.publish functions");
  });
}

if (Meteor.isClient) {
  var subscription_b;
  var subscription_c;
  document.title = "UnitTest: tap-i18n-db used in a tap-i18n enabled project";

  var supported_languages = _.keys(TAPi18n.getLanguages());

  var max_document_id = share.max_document_id;

  var get_general_classed_collections = function(class_suffix="") {
    var remap_results = function(results) {
      // remap the results object so the keys will be value of the result's key field
      return _.reduce(_.values(results), (function(a, b) { return a[b.id] = b, a; }), {});
    };

    var collections_docs = [
      remap_results(test_collections[`a${class_suffix}`].find({}, {sort: {"id": 1}}).fetch()),
      remap_results(test_collections[`b${class_suffix}`].find({}, {sort: {"id": 1}}).fetch()),
      remap_results(test_collections[`c${class_suffix}`].find({}, {sort: {"id": 1}}).fetch())
    ];

    var docs = [];

    for (var i = 0; 0 < max_document_id ? i < max_document_id : i > max_document_id; 0 < max_document_id ? i++ : i--) {
      if (i in collections_docs[i % 3]) {
        if ((collections_docs[i % 3][i] != null)) {
          docs.push(collections_docs[i % 3][i]);
        }
      }
    }

    return docs;
  };

  var get_basic_collections_docs = function() {
    return get_general_classed_collections();
  };

  var get_regular_base_language_collections_docs = function() {
    return get_general_classed_collections("_aa");
  };

  var get_dialect_base_language_collections_docs = function() {
    return get_general_classed_collections("_aa-AA");
  };

  var get_all_docs = function() {
    var basic = get_basic_collections_docs();
    var regular_lang = get_regular_base_language_collections_docs();
    var dialect = get_dialect_base_language_collections_docs();
    var all = [].concat(basic, regular_lang, dialect);

    return {basic: basic, regular_lang: regular_lang, dialect: dialect, all: all};
  };

  var subscription_a = subscription_b = subscription_c = null;

  var stop_all_subscriptions = function() {
    var iterable = [subscription_a,  subscription_b,  subscription_c];
    for (var j = 0, i; j < iterable.length; j++) {
      i = iterable[j];
      if ((typeof i !== "undefined" && i !== null)) {
        i.stop();
      }
    }
    return Deps.flush(); // force the cleanup of the minimongo collections
  };

  var subscribe_simple_subscriptions = function() {
    stop_all_subscriptions();

    var a_dfd = new $.Deferred();
    subscription_a = TAPi18n.subscribe("class_a", {onReady() { return a_dfd.resolve(); }), onError(error) { return a_dfd.reject(); })});
    var b_dfd = new $.Deferred();
    subscription_b = TAPi18n.subscribe("class_b", {onReady() { return b_dfd.resolve(); }), onError(error) { return b_dfd.reject(); })});
    var c_dfd = new $.Deferred();
    subscription_c = TAPi18n.subscribe("class_c", {onReady() { return c_dfd.resolve(); }), onError(error) { return c_dfd.reject(); })});

    return [[subscription_a, subscription_b, subscription_c], [a_dfd, b_dfd, c_dfd]];
  };

  var subscribe_complex_subscriptions = function() {
    stop_all_subscriptions();

    var language_to_exclude_from_class_a_and_b =
      supported_languages[(supported_languages.indexOf(TAPi18n.getLanguage()) + 1) % supported_languages.length]

    // class_a - inclusive projection - all properties but language_to_exclude_from_class_a_and_b
    ;var a_dfd = new $.Deferred();
    var projection = {_id: 1, id: 1};

    for (var i = 0, language; i < supported_languages.length; i++) {
      language = supported_languages[i];
      if (language !== language_to_exclude_from_class_a_and_b) {
        projection[`not_translated_to_${language}`] = 1;
      }
    }

    subscription_a = TAPi18n.subscribe("class_a", projection, {onReady() { return a_dfd.resolve(); }), onError(error) { return a_dfd.reject(); })});

    var b_dfd = new $.Deferred();
    projection = {_id: 1}; // _id: 1, just to make a bit more complex, should behave just the same
    projection[`not_translated_to_${language_to_exclude_from_class_a_and_b}`] = 0;
    subscription_b = TAPi18n.subscribe("class_b", projection, {onReady() { return b_dfd.resolve(); }), onError(error) { return b_dfd.reject(); })});

    var c_dfd = new $.Deferred();
    projection = {_id: 1}; // _id: 1, just to make a bit more complex, should behave just the same
    projection[`not_translated_to_${TAPi18n.getLanguage()}`] = 0;
    subscription_c = TAPi18n.subscribe("class_c", projection, {onReady() { return c_dfd.resolve(); }), onError(error) { return c_dfd.reject(); })});

    return [[subscription_a, subscription_b, subscription_c], [a_dfd, b_dfd, c_dfd]];
  };

  var validate_simple_subscriptions_documents = function(test, subscriptions, documents) {
    var current_language = TAPi18n.getLanguage();
    var i18n_supported = (typeof current_language !== "undefined" && current_language !== null);

    var base_language_by_collection_type = {
      basic: test_collections.a._base_language,
      regular_lang: test_collections.a_aa._base_language,
      dialect: test_collections["a_aa-AA"]._base_language
    };

    return (() => {
      var result = [];
      for (var collection_type in base_language_by_collection_type) {
        var collection_base_language = base_language_by_collection_type[collection_type];

        var collection_type_documents = documents[collection_type];

        result.push(_.each(collection_type_documents, function(doc) {
          return (() => {
            var result1 = [];
            for (var i = 0, language_property_not_translated_to; i < supported_languages.length; i++) {
              language_property_not_translated_to = supported_languages[i];
              var should_translate_to = current_language;
              if (should_translate_to === null) {
                should_translate_to = collection_base_language;
              }
              var should_translate_to_dialect_of = share.dialectOf(should_translate_to);

              var property = `not_translated_to_${language_property_not_translated_to}`;
              var value = doc[property];

              if (should_translate_to !== language_property_not_translated_to) {
                var expected_value = `${property}-${should_translate_to}-${doc.id}`;
              } else {
                if (i18n_supported) {
                  if ((typeof should_translate_to_dialect_of !== "undefined" && should_translate_to_dialect_of !== null)) {
                    expected_value = `${property}-${should_translate_to_dialect_of}-${doc.id}`;
                  } else if (collection_base_language !== should_translate_to) {
                    expected_value = `${property}-${collection_base_language}-${doc.id}`;
                  } else {
                    expected_value = undefined;
                  }
                } else {
                  expected_value = undefined;
                }
              }

              result1.push(test.equal(expected_value, value));
            }
            return result1;
          })();
        }));
      }
      return result;
    })();
  };

  var validate_complex_subscriptions_documents = function(test, subscriptions, documents) {
    var current_language = TAPi18n.getLanguage();
    var i18n_supported = (typeof current_language !== "undefined" && current_language !== null);

    var base_language_by_collection_type = {
      basic: test_collections.a._base_language
      //regular_lang: test_collections.a_aa._base_language
      //dialect: test_collections["a_aa-AA"]._base_language
    };

    return (() => {
      var result = [];
      for (var collection_type in base_language_by_collection_type) {
        var collection_base_language = base_language_by_collection_type[collection_type];
        var collection_type_documents = documents[collection_type];

        result.push(_.each(collection_type_documents, function(doc) {
          var language_excluded_from_class_a_and_b =
            supported_languages[(supported_languages.indexOf(current_language) + 1) % supported_languages.length]
          ;var field_excluded_from_doc = null;
          switch (doc.id % 3) {
            case 0: field_excluded_from_doc = language_excluded_from_class_a_and_b; break;
            case 1: field_excluded_from_doc = language_excluded_from_class_a_and_b; break;
            case 2: field_excluded_from_doc = current_language; break;
          }

          return (() => {
            var result1 = [];
            for (var i = 0, language_property_not_translated_to; i < supported_languages.length; i++) {
              language_property_not_translated_to = supported_languages[i];
              var should_translate_to = current_language;
              if (should_translate_to === null) {
                should_translate_to = collection_base_language;
              }
              var should_translate_to_dialect_of = share.dialectOf(should_translate_to);

              var property = `not_translated_to_${language_property_not_translated_to}`;
              var value = doc[property];

              if (language_property_not_translated_to === field_excluded_from_doc) {
                var expected_value = undefined;
              } else if (should_translate_to !== language_property_not_translated_to) {
                expected_value = `${property}-${should_translate_to}-${doc.id}`;
              } else {
                if (i18n_supported) {
                  if ((typeof should_translate_to_dialect_of !== "undefined" && should_translate_to_dialect_of !== null)) {
                    expected_value = `${property}-${should_translate_to_dialect_of}-${doc.id}`;
                  } else if (collection_base_language !== should_translate_to) {
                    expected_value = `${property}-${collection_base_language}-${doc.id}`;
                  } else {
                    expected_value = undefined;
                  }
                } else {
                  expected_value = undefined;
                }
              }

              result1.push(test.equal(expected_value, value, `col_type=${collection_type}, property=${property}`));
            }
            return result1;
          })();
        }));
      }
      return result;
    })();
  };

  var general_tests = function(test, subscriptions, documents) {
    test.equal(documents.all.length, max_document_id * 3, "Expected documents count in collections");

    return test.isTrue((_.reduce((_.map(documents.all, function(doc) { (return !(doc.i18n != null)); })), (function(memo, current) { return memo && current; }), true)), "The subdocument i18n is not part of the documents");
  };

  var null_language_tests = function(test, subscriptions, documents) {
    return;
  };

  Tinytest.addAsync('tap-i18n-db - language: null; simple pub/sub - general tests', function(test, onComplete) {
    var subscriptions = subscribe_simple_subscriptions();

    var test_case = once(function() {
      var documents = get_all_docs();

      general_tests(test, subscriptions, documents);

      null_language_tests(test, subscriptions, documents);

      validate_simple_subscriptions_documents(test, subscriptions, documents);

      return onComplete();
    });

    return Deps.autorun(function() {
      if (subscription_a.ready() && subscription_b.ready() && subscription_c.ready()) {
        return test_case();
      }
    });
  });

  if (!(Package.autopublish != null)) {
    Tinytest.addAsync('tap-i18n-db - language: null; complex pub/sub - general tests', function(test, onComplete) {
      var subscriptions = subscribe_complex_subscriptions();

      var test_case = once(function() {
        var documents = get_all_docs();

        general_tests(test, subscriptions, documents);

        null_language_tests(test, subscriptions, documents);

        validate_complex_subscriptions_documents(test, subscriptions, documents);

        return onComplete();
      });

      return Deps.autorun(function() {
        if (subscription_a.ready() && subscription_b.ready() && subscription_c.ready()) {
          return test_case();
        }
      });
    });
  }

  Tinytest.addAsync('tap-i18n-db - language: en; simple pub/sub - general tests', function(test, onComplete) {
    return TAPi18n.setLanguage("en").done(function() {
        var subscriptions = subscribe_simple_subscriptions();

        return $.when.apply(this, subscriptions[1]).done(function() {
            var documents = get_all_docs();

            general_tests(test, subscriptions, documents);

            validate_simple_subscriptions_documents(test, subscriptions, documents);

            return onComplete();
        });
    });
  });

  if (!(Package.autopublish != null)) {
    Tinytest.addAsync('tap-i18n-db - language: en; complex pub/sub - general tests', function(test, onComplete) {
      return TAPi18n.setLanguage("en").done(function() {
          var subscriptions = subscribe_complex_subscriptions();

          return $.when.apply(this, subscriptions[1]).done(function() {
              var documents = get_all_docs();

              general_tests(test, subscriptions, documents);

              validate_complex_subscriptions_documents(test, subscriptions, documents);

              return onComplete();
          });
      });
    });
  }

  Tinytest.addAsync('tap-i18n-db - language: aa; simple pub/sub - general tests', function(test, onComplete) {
    return TAPi18n.setLanguage("aa").done(function() {
        var subscriptions = subscribe_simple_subscriptions();

        return $.when.apply(this, subscriptions[1]).done(function() {
            var documents = get_all_docs();

            general_tests(test, subscriptions, documents);

            validate_simple_subscriptions_documents(test, subscriptions, documents);

            return onComplete();
        });
    });
  });

  if (!(Package.autopublish != null)) {
    Tinytest.addAsync('tap-i18n-db - language: aa; complex pub/sub - general tests', function(test, onComplete) {
      return TAPi18n.setLanguage("aa").done(function() {
          var subscriptions = subscribe_complex_subscriptions();

          return $.when.apply(this, subscriptions[1]).done(function() {
              var documents = get_all_docs();

              general_tests(test, subscriptions, documents);

              validate_complex_subscriptions_documents(test, subscriptions, documents);

              return onComplete();
          });
      });
    });
  }

  Tinytest.addAsync('tap-i18n-db - language: aa-AA; simple pub/sub - general tests', function(test, onComplete) {
    return TAPi18n.setLanguage("aa-AA").done(function() {
        var subscriptions = subscribe_simple_subscriptions();

        return $.when.apply(this, subscriptions[1]).done(function() {
            var documents = get_all_docs();

            general_tests(test, subscriptions, documents);

            validate_simple_subscriptions_documents(test, subscriptions, documents);

            return onComplete();
        });
    });
  });

  if (!(Package.autopublish != null)) {
    Tinytest.addAsync('tap-i18n-db - language: aa-AA; complex pub/sub - general tests', function(test, onComplete) {
      return TAPi18n.setLanguage("aa-AA").done(function() {
          var subscriptions = subscribe_complex_subscriptions();

          return $.when.apply(this, subscriptions[1]).done(function() {
              var documents = get_all_docs();

              general_tests(test, subscriptions, documents);

              validate_complex_subscriptions_documents(test, subscriptions, documents);

              return onComplete();
          });
      });
    });
  }

  Tinytest.addAsync('tap-i18n-db - subscribing with a not-supported language fails', function(test, onComplete) {
    var dfd = new $.Deferred();
    Meteor.subscribe( "class_a", "gg-GG",
      {onReady() {
        return dfd.reject();
      },
      onError(e) {
        test.equal(400, e.error);
        test.equal("Not supported language", e.reason);
        return dfd.resolve(e);
      }
    });

    return dfd.fail( function() { return test.fail("Subscriptions that should have failed succeeded"); } ).always(function() {
        return onComplete();
    });
  });

  Tinytest.addAsync('tap-i18n-db - reactivity test - simple subscription', function(test, onComplete) {
    var interval_handle;
    TAPi18n.setLanguage(supported_languages[0]);

    var subscriptions = subscribe_simple_subscriptions();

    var last_invalidation = null;
    var documents = null;
    var comp = Deps.autorun(function() {
      documents = get_all_docs();

      return last_invalidation = share.now();
    });

    return interval_handle = Meteor.setInterval( (function() {
      if (last_invalidation + idle_time < share.now()) {
        // comp is idle

        console.log(`Testing simple subscriptions' reactivity: language=${TAPi18n.getLanguage()}`);

        // test
        general_tests(test, subscriptions, documents);

        validate_simple_subscriptions_documents(test, subscriptions, documents);

        var lang_id = supported_languages.indexOf(TAPi18n.getLanguage());
        if (lang_id + 1 < supported_languages.length) {
          // switch language
          return TAPi18n.setLanguage(supported_languages[lang_id + 1]);
        } else {
          // stop
          comp.stop();

          Meteor.clearInterval(interval_handle);

          return onComplete();
        }
      }
    }
    ), idle_time
    );
  });

  if (!(Package.autopublish != null)) {
    Tinytest.addAsync('tap-i18n-db - reactivity test - complex subscription', function(test, onComplete) {
      var interval_handle;
      stop_all_subscriptions();
      TAPi18n.setLanguage(supported_languages[0]);

      var fields_to_exclude = ["not_translated_to_en", "not_translated_to_aa", "not_translated_to_aa-AA"];

      var local_session = new ReactiveDict();
      local_session.set("field_to_exclude", fields_to_exclude[0]);

      local_session.set("projection_type", 0);

      var fields = null;
      var subscriptions = null;
      Deps.autorun(function() {
        var field_to_exclude = local_session.get("field_to_exclude");
        fields = {};
        if (local_session.get("projection_type") === 0) {
          fields[field_to_exclude] = 0;
        } else {
          for (var i = 0, field; i < fields_to_exclude.length; i++) {
            field = fields_to_exclude[i];
            if (field !== field_to_exclude) {
              fields[field] = 1;
            }
          }
          fields["id"] = 1;
        }

        var a_dfd = new $.Deferred();
        subscription_a = TAPi18n.subscribe("class_a", fields, {onReady() { return a_dfd.resolve(); }), onError(error) { return a_dfd.reject(); })});
        var b_dfd = new $.Deferred();
        subscription_b = TAPi18n.subscribe("class_b", fields, {onReady() { return b_dfd.resolve(); }), onError(error) { return b_dfd.reject(); })});
        var c_dfd = new $.Deferred();
        subscription_c = TAPi18n.subscribe("class_c", fields, {onReady() { return c_dfd.resolve(); }), onError(error) { return c_dfd.reject(); })});

        return subscriptions = [[subscription_a, subscription_b, subscription_c], [a_dfd, b_dfd, c_dfd]];
      });

      var last_invalidation = null;
      var documents = null;
      var comp = Deps.autorun(function() {
        documents = get_all_docs();

        return last_invalidation = share.now();
      });

      return interval_handle = Meteor.setInterval( (function() {
        var projection_id;
        var lang_id;
        if (last_invalidation + idle_time < share.now()) {
          // comp is idle

          console.log(`Testing complex subscriptions' reactivity: language=${TAPi18n.getLanguage()}; field_to_exclude=${local_session.get("field_to_exclude")}; projection_type=${local_session.get("projection_type") ? "inclusive" : "exclusive"}; projection=${EJSON.stringify(fields)}`);
        }

        // test
        general_tests(test, subscriptions, documents);

        documents.all.forEach(function(doc) {
           return test.isUndefined(doc[local_session.get("field_to_exclude")]);
        });

        if (local_session.get("projection_type") === 0) {
           return local_session.set("projection_type", 1);
        } else if (local_session.get("projection_type") === 1 && ((projection_id = fields_to_exclude.indexOf(local_session.get("field_to_exclude"))) + 1) < fields_to_exclude.length) {
          local_session.set("projection_type", 0);
          return local_session.set("field_to_exclude", fields_to_exclude[projection_id + 1]);
        } else if ((lang_id = supported_languages.indexOf(TAPi18n.getLanguage())) + 1 < supported_languages.length) {
           // switch language
           TAPi18n.setLanguage(supported_languages[lang_id + 1]);
           local_session.set("projection_type", 0);
           return local_session.set("field_to_exclude", fields_to_exclude[0]);
        } else {
          // stop
          comp.stop();

          Meteor.clearInterval(interval_handle);

          return onComplete();
        }
      }
      ), idle_time
      );
    });
  }
}

// Translations editing tests that require env language != null
if (Meteor.isClient) {
  Tinytest.addAsync('tap-i18n-db - translations editing - insertLanguage - language_tag=TAPi18n.getLanguage()', function(test, onComplete) {
    return TAPi18n.setLanguage("aa").done(function() {
        var _id;
        return test.equal(translations_editing_tests_collection.findOne(_id = translations_editing_tests_collection.insertLanguage({a: 1, b: 5}, {b: 2, d: 4}, (function() { return onComplete(); })), {transform: null}, {transform: null}), {a: 1, b: 5, i18n: {aa: {b: 2, d: 4}}, _id: _id});
    });
  });

  Tinytest.addAsync('tap-i18n-db - translations editing - translate - language_tag=TAPi18n.getLanguage()', function(test, onComplete) {
    return TAPi18n.setLanguage("aa").done(function() {
        var _id = translations_editing_tests_collection.insertTranslations({a: 5, b: 2}, {aa: {x: 4, y: 2}});
        var result = translations_editing_tests_collection.translate(_id, {a: 1, c: 3});
        test.equal(result, 1, "Correct number of affected documents");
        result = translations_editing_tests_collection.translate(_id, {x: 1, z: 3}, {});
        test.equal(result, 1, "Correct number of affected documents");
        return result = translations_editing_tests_collection.translate(_id, {l: 1, m: 2}, function(err, affected_rows) {
          return Meteor.setTimeout( (function() {
            test.equal(1, affected_rows);
            test.equal(translations_editing_tests_collection.findOne(_id, {transform: null}), {a: 5, b: 2, i18n: {aa: {a: 1, c: 3, x: 1, y: 2, z: 3, l: 1, m: 2}}, _id: _id});
            return onComplete();
          }
          ), 1000
          );
        });
    });
  });

  Tinytest.addAsync('tap-i18n-db - translations editing - removeLanguage - language_tag=TAPi18n.getLanguage()', function(test, onComplete) {
    return TAPi18n.setLanguage("aa").done(function() {
        var _id = translations_editing_tests_collection.insertTranslations({a: 5, b: 2}, {aa: {u: 1, v: 2, w: 3, x: 4, y: 2, z: 1}});
        var result = translations_editing_tests_collection.removeLanguage(_id, ["x", "y"]);
        test.equal(result, 1, "Correct number of affected documents");
        result = translations_editing_tests_collection.removeLanguage(_id, ["y", "z"], {});
        test.equal(result, 1, "Correct number of affected documents");
        return result = translations_editing_tests_collection.removeLanguage(_id, ["u", "v"], function(err, affected_rows) {
          return Meteor.setTimeout( (function() {
            test.equal(1, affected_rows);
            test.equal(translations_editing_tests_collection.findOne(_id, {transform: null}), {a: 5, b: 2, i18n: {aa: {w: 3}}, _id: _id});
            return onComplete();
          }
          ), 1000
          );
        });
    });
  });

  Tinytest.addAsync('tap-i18n-db - translations editing - removeLanguage - complete remove - language_tag=TAPi18n.getLanguage()', function(test, onComplete) {
    return TAPi18n.setLanguage("aa").done(function() {
        var result;
        var _id = translations_editing_tests_collection.insertTranslations({a: 5, b: 2}, {aa: {u: 1, v: 2, w: 3, x: 4, y: 2, z: 1}});
        return result = translations_editing_tests_collection.removeLanguage(_id, null, function(err, affected_rows) {
          return Meteor.setTimeout( (function() {
            test.equal(1, affected_rows);
            test.equal(translations_editing_tests_collection.findOne(_id, {transform: null}), {a: 5, b: 2, i18n: {}, _id: _id});
            return onComplete();
          }
          ), 1000
          );
        });
    });
  });

  Tinytest.addAsync('tap-i18n-db - translations editing - removeLanguage - attempt complete remove base language - language_tag=TAPi18n.getLanguage()', function(test, onComplete) {
    return TAPi18n.setLanguage("en").done(function() {
        var result;
        var _id = translations_editing_tests_collection.insertTranslations({a: 5, b: 2}, {aa: {u: 1, v: 2, w: 3, x: 4, y: 2, z: 1}});
        return result = translations_editing_tests_collection.removeLanguage(_id, null, function(err, affected_rows) {
          return Meteor.setTimeout( (function() {
            test.isFalse(affected_rows);
            test.instanceOf(err, Meteor.Error);
            test.equal(err.reason, "Complete removal of collection's base language from a document is not permitted");
            return onComplete();
          }
          ), 1000
          );
        });
    });
  });
}
