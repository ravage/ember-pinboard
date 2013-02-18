/*global App:true*/
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

  // just to make it quick
  // TODO: make Handlebars helper
  dateFormat: function(date) {
    var format = [date.getDate(), date.getMonth() + 1, date.getYear() + 1900].join('/');

    format += ' @ ';
    format += [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');

    return format;
  }
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
  // Calling the Notes store like this doesn't look good
  clear: function() {
    App.Notes.clear();
  },

  // handles note creation sent from modal view
  createNote: function() {
    var note = App.Note.create({
      message: this.get('note'),
      date: App.dateFormat(new Date())
    });
     
    App.Notes.addObject(note);

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
    var note = this.get('model');
    App.Notes.removeObject(note);
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

// Models

// TODO: LocalStorageAdapter and ember-data
App.Note = Ember.Object.extend();

App.Notes = [];

App.Notes.pushObject(App.Note.create({ message: "Note #1", date: App.dateFormat(new Date()) }));
App.Notes.pushObject(App.Note.create({ message: "Note #2", date: App.dateFormat(new Date()) }));
App.Notes.pushObject(App.Note.create({ message: "Note #3", date: App.dateFormat(new Date()) }));
