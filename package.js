Package.describe({
  name: 'studiointeract:i18n-db',
  summary: 'Internationalization for Meteor Collections',
  version: '0.5.4',
  git: 'https://github.com/studiointeract/tap-i18n-db'
});

Npm.depends({
  "extend": "3.0.0"
});

Package.on_use(function (api) {
  api.versionsFrom('METEOR@1.2.1');
  api.use([
      "ecmascript",
      "jquery",
      "underscore",
      "meteor",
      "mongo"
   ], ['server', 'client']);

  api.use("autopublish", ['server', 'client'], {weak: true})

  api.use('tap:i18n@1.0.3', ['client', 'server']);
  api.imply('tap:i18n', ['client', 'server']);
  api.imply('session');

  api.add_files('globals.js', ['client', 'server']);
  api.add_files('tap_i18n_db.js', ['client', 'server']);
  api.export('TAPi18n');
});
