/*global App:true, Handlebars:true, moment:true*/
/*jshint strict:false*/

/*
 * EmberJS application initialization.
 *
 * May define properties, methods and listen to events.
 *
 */
window.App = Ember.Application.create({
  name: 'Pinboard',

  VERSION: 0.1,

  ready: function() {
    console.log([this.name, 'loaded!'].join(' '));
  },

  store: {}
});

// Routes

/*
 * Define routes for the application.
 *
 * By defining `notes` pointing to `/` we are telling Ember to go
 * ApplicationRoute -> NotesRoute
 *
 * Since there is a nested route (even if not being used, reminder only) we get
 * ApplicationRoute -> NotesRoute -> NotesIndexRoute
 *
 */
App.Router.map(function() {
  this.resource('notes', { path: '/' }, function() {
    this.route('new');
  });
});

/*
 * When the route hits setup the associated controller `NotesIndexController`
 * model.
 *
 */
App.NotesIndexRoute = Ember.Route.extend({
  model: function() {
    return App.Notes;
  },

  setupController: function() {
    this.controllerFor('notes').set('model', App.Notes);
  }
});

/*
 * `needs: ['notes']` indicates this controller depends on `NotesController`.
 *
 * `NotesController` can be reached by issuing `this.get('controllers.notes')`
 *
 * `itemController` wraps each rendered item in the defined controller,
 * `NoteController`
 *
 */
App.NotesIndexController = Ember.ArrayController.extend({
  needs: ['notes'],

  itemController: 'note'
});

/*
 * Handles everything regarding notes.
 *
 * Don't know if this is the way to go, but doesn't look too bad.
 *
 */
App.NotesController = Ember.ArrayController.extend({

  // handles (Add Notes) modal view creation and sets its context
  add: function() {
    App.NoteModalView.create({
      controller: this
    }).append();
  },

  // handles (Clear Notes) notes removal
  // by setting up this controller model it can act as a collection
  clear: function() {
    this.get('model').clear();
  },

  // handles note creation sent from modal view
  // by setting up this controller model we can call `addObject`
  createNote: function() {
    var note = Ember.Object.create({
      message: this.get('note'),
      date: new Date()
    });

    this.addObject(note);

    this.set('note', '');
  }
});

/*
 * every rendered note will be wrapped in this controller context.
 *
 * only used for self removal in this case, but could be usefull later on.
 *
 */
App.NoteController = Ember.ObjectController.extend({
  remove: function() {
    var note = this.get('model'),
    collection = this.get('target').get('model');

    collection.removeObject(note);
    console.log(this.get('store'));
  }
});

// Views

/*
 * the only view that looks necessary, but have some doubts regarding
 * implementation.
 *
 * Callback and element manipulation is necessary and this seemed the right
 * place to do it.
 *
 */
App.NoteModalView = Ember.View.extend({
  // which template to hook
  templateName: 'new-note',

  // act after element is in the DOM
  didInsertElement: function() {
    var self = this, dispose, modal, focus;

    modal = this.$('#new-note');

    // destroy after modal animation completes
    dispose = function() {
      self.destroy();
    };

    // focus textarea after modal opens
    focus = function() {
      modal.find('textarea').focus();
    };

    // focus textarea after `Add` button click
    //
    // should clean up this event on dispose or it gets done?
    modal.find('button').on('click', function() {
      focus();
    });

    // laubch the modal
    modal.reveal({
      closed: dispose,
      opened: focus
    });
  }
});


// Helpers
Ember.Handlebars.registerBoundHelper('date', function(date, options) {
  console.log(options.hash.format);
  return moment(date).format(options.hash.format || 'L');
});


// Models

// TODO: LocalStorageAdapter and ember-data
App.Note = Ember.Object.extend();
App.Notes = [];

App.Notes.pushObject(App.Note.create({ message: "Note #1", date: new Date() }));
App.Notes.pushObject(App.Note.create({ message: "Note #2", date: new Date() }));
App.Notes.pushObject(App.Note.create({ message: "Note #3", date: new Date() }));
