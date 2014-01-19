(function() {

  this.CF = {
    widgets: {},
    util: {},
    views: {},
    init: function() {
      return $('body').on('click', 'a.close-dialog-link', function(e) {
        e.preventDefault();
        $(this).closest('.ui-dialog').find('.ui-widget-content').dialog('close');
        return false;
      });
    }
  };

}).call(this);
(function() {

  (function() {
    return DrawingBoard.Control.SaveRevision = DrawingBoard.Control.extend({
      name: "saverevision",
      initialize: function(board) {
        var el;
        el = $("<button class='drawing-board-control-saverevision-button' title='Save Revision'><i class='icon-save'></i></button>");
        this.$el.append(el);
        return this.$el.on('click', '.drawing-board-control-saverevision-button', $.proxy(function() {
          var dataURLtoBlob, fd, file;
          dataURLtoBlob = function(dataURL) {
            var array, binary, i;
            binary = atob(dataURL.split(",")[1]);
            array = [];
            i = 0;
            while (i < binary.length) {
              array.push(binary.charCodeAt(i));
              i++;
            }
            return new Blob([new Uint8Array(array)], {
              type: "image/png"
            });
          };
          file = dataURLtoBlob(this.board.getImg());
          window.file = file;
          fd = new FormData();
          fd.append("image", file);
          return $.ajax({
            url: '/revisions?graphic_id=' + $("#drawing-board").data('graphic-id'),
            type: 'POST',
            data: fd,
            processData: false,
            contentType: false,
            success: function(data) {
              return $('#revisions-list-wrapper').append(data.html);
            },
            error: function() {}
          });
        }, this));
      }
    });
  })();

}).call(this);
(function() {

  CF.widgets.audio_player = {
    player: null,
    init: function() {
      return $('body').on('click', '.play-audio', this.show);
    },
    show: function(e) {
      e.preventDefault();
      $('#audio-dialog').dialog({
        title: 'Audio Player',
        modal: true,
        width: 920,
        draggable: false,
        open: function(dialog) {
          $('#audio-dialog').html('<div class="loader"></div>');
          $('.ui-dialog-titlebar-close').replaceWith("<a class='close-dialog-link' href='#'><i class='icon-remove'></i></a>");
          $('.ui-widget-overlay').addClass('darken-overlay');
          CF.widgets.audio_player.getContent(e.currentTarget, dialog);
          return $('#audio-dialog').dialog('option', 'position', 'center');
        },
        close: function() {
          if (CF.widgets.audio_player.player) {
            CF.widgets.audio_player.player.pause();
          }
          return $('.text-info-wrapper').html("");
        }
      });
      return false;
    },
    getContent: function(target, dialog) {
      var $target;
      $target = $(target);
      return $.ajax({
        url: target.href,
        dataType: 'json',
        success: function(data) {
          var infoWrapper;
          window.data = data;
          $('#audio-dialog').html(data.html);
          CF.widgets.audio_player.player = audiojs.createAll({
            imageLocation: '/assets/player-graphics.gif'
          })[0];
          CF.widgets.audio_player.player.play();
          $('.cleditor').cleditor({
            width: '587px'
          });
          infoWrapper = $('#audio-dialog .audio-info-wrapper');
          infoWrapper.find('.name a').attr('href', $target.data('profile-link')).text($target.data('poster'));
          infoWrapper.find('.poster img, form img').attr('src', $target.data('profile-photo'));
          infoWrapper.find('.date-posted .timeago').attr('title', $target.data('date-created'));
          infoWrapper.find('form').attr('action', $target.data('comment-path'));
          infoWrapper.fadeIn(function() {
            return $(this).removeClass('hidden');
          });
          $('.timeago').timeago();
          $('.audio-info-wrapper').slimscroll({
            height: "360px"
          });
          $('#audio-dialog').dialog('option', 'position', 'center');
          return CF.widgets.audio_player.renderComments(target, dialog);
        },
        complete: function() {},
        error: function() {}
      });
    },
    renderComments: function(target, dialog) {
      return $.ajax({
        url: $(target).data('get-comments-url'),
        type: 'GET',
        dataType: 'json',
        success: function(data) {
          var comments, list;
          comments = $(data.html).hide();
          list = $(dialog.target).find('.comments-list');
          list.find('.loader').remove();
          list.append(comments);
          $('.timeago').timeago();
          list.find('ul').fadeIn();
          return $('#audio-dialog').dialog('option', 'position', 'center');
        }
      });
    }
  };

}).call(this);
(function() {

  CF.widgets.graphics = {
    init: function() {
      $('body').on('click', '.media-graphic-link', this.show);
      $('body').on('click', 'a.show-revision', this.showRevision);
      return $('body').on('click', '.view-comments', this.showListScroll);
    },
    show: function(e) {
      e.preventDefault();
      $('#graphics-dialog').dialog({
        title: 'Graphics Editor',
        modal: true,
        width: 1084,
        draggable: false,
        open: function() {
          var dialog;
          dialog = $(this);
          $('#graphics-dialog').html('<div class="loader"></div>');
          $('.ui-dialog-titlebar-close').replaceWith("<a class='close-dialog-link' href='#'><i class='icon-remove'></i></a>");
          $('.ui-widget-overlay').addClass('darken-overlay');
          CF.widgets.graphics.getContent(e.currentTarget, dialog);
          $('#graphics-dialog').dialog('option', 'position', 'center');
          return $('body').addClass('stop-scrolling');
        },
        close: function() {
          return $('body').removeClass('stop-scrolling');
        }
      });
      return false;
    },
    getContent: function(target, dialog) {
      var $target;
      $target = $(target);
      return $.ajax({
        url: target.href,
        dataType: 'json',
        success: function(data) {
          var board, infoWrapper;
          window.data = data;
          $('#graphics-dialog').html(data.html);
          CF.widgets.graphics.showListScroll();
          board = new DrawingBoard.Board('drawing-board', {
            color: '#333',
            background: $('#drawing-board').data('image'),
            webStorage: false,
            controls: [
              'Color', 'Size', {
                Navigation: {
                  reset: true
                }
              }, 'Download', 'SaveRevision', 'DrawingMode'
            ]
          });
          infoWrapper = $('#graphics-dialog .text-info-wrapper');
          infoWrapper.find('.name a').attr('href', $target.data('profile-link')).text($target.data('poster'));
          infoWrapper.find('.poster img, form img').attr('src', $target.data('profile-photo'));
          infoWrapper.find('.date-posted .timeago').attr('title', $target.data('date-created'));
          infoWrapper.find('form').attr('action', $target.data('comment-path'));
          infoWrapper.fadeIn(function() {
            return $(this).removeClass('hidden');
          });
          $('.timeago').timeago();
          $('.text-info-wrapper').slimscroll({
            height: "420px"
          });
          CF.widgets.graphics.renderComments(target, dialog);
          return $('#graphics-dialog').dialog('option', 'position', 'center');
        },
        complete: function() {},
        error: function() {}
      });
    },
    renderComments: function(target, dialog) {
      return $(dialog).find('.comments-list').each(function() {
        var $list;
        $list = $(this);
        return $.ajax({
          url: $(this).data('get-comments-url'),
          type: 'GET',
          dataType: 'json',
          success: function(data) {
            var comments;
            comments = $(data.html).hide();
            $list.find('.loader').remove();
            $list.append(comments);
            $('.timeago').timeago();
            return $list.find('ul').fadeIn();
          }
        });
      });
    },
    showRevision: function(e) {
      var $this;
      e.preventDefault();
      $this = $(this);
      $this.closest('ul').find('> li').removeClass('current');
      $this.closest('li').addClass('current');
      $.ajax({
        url: $this.data('fetch-revision-url'),
        type: 'GET',
        dataType: 'json',
        beforeSend: function() {
          if ($this.data('fetching')) {
            return false;
          } else {
            return $this.data('fetching', true);
          }
        },
        success: function(data) {
          var board;
          console.log("data", data);
          window.data = data;
          $('#drawing-board-wrapper').html(data.html);
          return board = new DrawingBoard.Board('drawing-board', {
            color: '#333',
            background: $('#drawing-board').data('image'),
            webStorage: false,
            controls: [
              'Color', 'Size', {
                Navigation: {
                  reset: true
                }
              }, 'Download', 'SaveRevision', 'DrawingMode'
            ]
          });
        },
        complete: function() {
          return $this.removeData('fetching');
        },
        error: function() {}
      });
      return false;
    },
    showListScroll: function() {
      var $list;
      $list = $('#revisions-list-wrapper');
      if ($list.height() > 480) {
        return $list.slimscroll({
          height: "450px"
        });
      }
    }
  };

}).call(this);
(function() {

  CF.widgets.comments = {
    init: function() {
      $('body').on('ajax:before', '.comment-form', this.beforeCommentPost);
      $('body').on('ajax:success', '.comment-form', this.successCommentPost);
      $('body').on('ajax:complete', '.comment-form', this.completeCommentPost);
      return $('body').on('click', '.view-comments', this.toggleCommentBox);
    },
    beforeCommentPost: function(e) {
      var $this;
      $this = $(this);
      if ($this.data('sending')) {
        return false;
      } else {
        return $this.data('sending', true);
      }
    },
    successCommentPost: function(e, data) {
      var commentsBox;
      commentsBox = $(this).closest('.comments-box');
      if (commentsBox.find('.comments-list ul').length) {
        commentsBox.find('.comments-list ul').append(data.html);
        $('abbr.timeago').timeago();
      } else {
        commentsBox.find('.comments-list').append("<ul></ul>");
        commentsBox.find('.comments-list ul').append(data.html);
      }
      return commentsBox.find('textarea').val('');
    },
    completeCommentPost: function() {
      return $(this).removeData('sending');
    },
    toggleCommentBox: function(e) {
      var $box, $link;
      e.preventDefault();
      $link = $(this);
      $box = $link.parent().find('.comments-box');
      $box.toggleClass('hidden');
      if ($box.hasClass('hidden')) {
        $link.html('<i class="icon-pencil"></i>View Comments');
      } else {
        $link.html('<i class="icon-pencil"></i>Hide Comments');
      }
      return false;
    }
  };

}).call(this);
(function() {

  CF.widgets.text_editor = {
    init: function() {
      return $('body').on('click', '.view-text-editor', this.show);
    },
    show: function(e) {
      e.preventDefault();
      $('#text-editor-dialog').dialog({
        title: 'Text Editor',
        modal: true,
        width: 1084,
        height: 500,
        draggable: false,
        open: function(dialog) {
          $('#text-editor-dialog').html('<div class="loader"></div>');
          $('.ui-dialog-titlebar-close').replaceWith("<a class='close-dialog-link' href='#'><i class='icon-remove'></i></a>");
          $('.ui-widget-overlay').addClass('darken-overlay');
          CF.widgets.text_editor.getContent(e.currentTarget, dialog);
          return $('#text-editor-dialog').dialog('option', 'position', 'center');
        },
        close: function() {}
      });
      return false;
    },
    getContent: function(target, dialog) {
      var $target;
      $target = $(target);
      return $.ajax({
        url: target.href,
        dataType: 'json',
        success: function(data) {
          var infoWrapper;
          window.data = data;
          $('#text-editor-dialog').html(data.html);
          $('.cleditor').cleditor({
            width: '587px'
          });
          infoWrapper = $('#text-editor-dialog .text-info-wrapper');
          infoWrapper.find('.name a').attr('href', $target.data('profile-link')).text($target.data('poster'));
          infoWrapper.find('.poster img, form img').attr('src', $target.data('profile-photo'));
          infoWrapper.find('.date-posted .timeago').attr('title', $target.data('date-created'));
          infoWrapper.find('form').attr('action', $target.data('comment-path'));
          infoWrapper.fadeIn(function() {
            return $(this).removeClass('hidden');
          });
          $('.timeago').timeago();
          $('.text-info-wrapper').slimscroll({
            height: "420px"
          });
          CF.widgets.text_editor.renderComments(target, dialog);
          return $('#text-editor-dialog').dialog('option', 'position', 'center');
        },
        complete: function() {},
        error: function() {}
      });
    },
    renderComments: function(target, dialog) {
      return $.ajax({
        url: $(target).data('get-comments-url'),
        type: 'GET',
        dataType: 'json',
        success: function(data) {
          var comments, list;
          comments = $(data.html).hide();
          list = $(dialog.target).find('.comments-list');
          list.find('.loader').remove();
          list.append(comments);
          $('.timeago').timeago();
          list.find('ul').fadeIn();
          return $('#text-editor-dialog').dialog('option', 'position', 'center');
        }
      });
    }
  };

}).call(this);
(function() {

  CF.widgets.video_player = {
    init: function() {
      $('.play-video').on('click', this.show);
      CF.widgets.comments.init();
      return $('.video-info-wrapper').slimscroll({
        height: "360px"
      });
    },
    show: function(e) {
      var $this, infoWrapper, player;
      e.preventDefault();
      $this = $(this);
      player = videojs('#video_html5_api');
      infoWrapper = $('#video-dialog .video-info-wrapper');
      $('#video-dialog').dialog({
        modal: true,
        width: 1084,
        height: 450,
        draggable: false,
        title: $this.data('video-title') || 'Content Forest Video Player',
        open: function(dialog) {
          $('.ui-dialog-titlebar-close').replaceWith("<a class='close-dialog-link' href='#'><i class='icon-remove'></i></a>");
          player.src($this.attr('href'));
          infoWrapper.find('.name a').attr('href', $this.data('profile-link')).text($this.data('poster'));
          infoWrapper.find('.poster img, form img').attr('src', $this.data('profile-photo'));
          infoWrapper.find('.date-posted .timeago').attr('title', $this.data('date-created'));
          infoWrapper.find('form').attr('action', $this.data('comment-path'));
          $('.ui-widget-overlay').addClass('darken-overlay');
          $('.timeago').timeago();
          CF.widgets.video_player.renderComments($this, dialog);
          return $('#video-dialog').dialog('option', 'position', 'center');
        },
        close: function(dialog) {
          var $dialog;
          player.pause();
          $('.ui-widget-overlay').removeClass('darken-overlay');
          $dialog = $(dialog.target);
          $dialog.find('.comments-list').html('<div class="loader"></div>');
          return $dialog.find('comments-box textarea').val('');
        }
      });
      return false;
    },
    renderComments: function(link, dialog) {
      return $.ajax({
        url: link.data('get-comments-url'),
        type: 'GET',
        dataType: 'json',
        success: function(data) {
          var comments, list;
          comments = $(data.html).hide();
          list = $(dialog.target).find('.comments-list');
          list.find('.loader').remove();
          list.append(comments);
          $('abbr.timeago').timeago();
          return list.find('ul').fadeIn();
        }
      });
    }
  };

}).call(this);
(function() {

  this.CF.util.namespace_exists = function(namespace) {
    var exists;
    exists = false;
    try {
      exists = !!eval(namespace);
    } catch (_error) {}
    return exists;
  };

}).call(this);
(function() {

  CF.views.pitches = {
    init: function() {
      return $('#sidebar-left li > a').click(function(e) {
        var calendar;
        e.preventDefault();
        $(this).tab('show');
        if (e.currentTarget.id === 'calendar-tab-link') {
          calendar = $('#calendar');
          return calendar.fullCalendar({
            header: {
              right: 'prev,next',
              center: 'title',
              left: 'today,month,agendaWeek'
            },
            events: calendar.data('in-progress')
          });
        }
      });
    }
  };

}).call(this);
(function() {

  CF.views.projects = {
    init: function() {
      $('#create-video-btn').on('click', this.showUploadVideo);
      $('#create-text-btn').on('click', this.showUploadText);
      $('#create-graphic-btn').on('click', this.showUploadGraphic);
      $('#create-audio-btn').on('click', this.showUploadAudio);
      CF.widgets.video_player.init();
      CF.widgets.text_editor.init();
      CF.widgets.audio_player.init();
      CF.widgets.graphics.init();
      CF.views.tasks.init();
      CF.views.task_lists.init();
      $('#invite-team').popover({
        html: true
      });
      $('#content').on('keydown', '#search-input', this.getSearchList);
      $('body').on('click', '.popover-close', function(e) {
        e.preventDefault();
        $('#invite-team').popover('hide');
        return false;
      });
      $("body").on("ajax:before", ".add-member-link", this.checkIfMember);
      return $("body").on("ajax:success", ".add-member-link", this.appendNewTeamMember);
    },
    checkIfMember: function(e) {
      if ($(this).hasClass('member-already')) {
        e.preventDefault();
        return false;
      }
    },
    appendNewTeamMember: function(e, data) {
      if (data.request_status === "success") {
        $('#current-project-team-members').append(data.content);
        return $(this).addClass("member-already").append("<i class='halflings-icon ok'></i>");
      }
    },
    getSearchList: function(e) {
      var $form, $this;
      $this = $(this);
      $form = $this.closest('form');
      if ($this.val() === "" || $.trim($this.val()) === "") {
        $form.find('p.search-desc').removeClass('hidden');
        return $('.search-results-wrapper').html('');
      } else {
        return $.ajax({
          url: $form.attr('action'),
          type: 'GET',
          dataType: 'json',
          data: $form.serializeArray(),
          beforeSend: function() {
            return $form.find('.controls').append("<div class='loader'></div>");
          },
          success: function(data) {
            var $list;
            $form.find('p.search-desc').addClass('hidden');
            $('.search-results-wrapper').html(data.html);
            $list = $form.closest('.search-invite-content').find('.profile-list');
            if ($list.height() > 300) {
              return $list.slimscroll({
                height: "300px"
              });
            }
          },
          error: function() {},
          complete: function(data) {
            return $form.find('.loader').remove();
          }
        });
      }
    },
    showUploadVideo: function(e) {
      e.preventDefault();
      $('#media_btn').hide();
      $('#media_content').hide('slow');
      $('#create_video').toggle('slow');
      $('#create_text').hide();
      $('#create_graphic').hide();
      $('#new-audio').hide();
      return false;
    },
    addComment: function(id) {
      $.ajax({
        url: '/tasks/' + id + '/new_comment',
        type: 'POST',
        dataType: 'json',
        data: {
          comment: $('.new-comment-input').val()
        },
        success: function(data) {
          if (data.status === 'success') {
            $('.task_comments').append("<p>" + $('.new-comment-input').val() + "</p>");
            return $('.new-comment-input').val('');
          }
        }
      });
      return false;
    },
    showTasks: function(target) {
      $.ajax({
        url: '/tasks/' + target,
        type: 'GET',
        dataType: 'json',
        success: function(data) {
          if (data.status === 'success') {
            return $('#taskDetail').html(data.html);
          }
        }
      });
      $("#taskDetail").modal("show");
      return false;
    },
    taskListHeadRename: function() {
      $('.taskListInput').hide();
      $('.taskListHead').click(function() {
        $(this).parent().find('input').show().focus();
        return $(this).hide();
      });
      return $('.taskListInput').on("focusout keydown", function(e) {
        var header;
        if (e.type === "focusout" || e.keyCode === 13) {
          header = $(this).parent().find('.taskListHead');
          header.show();
          $(this).hide();
          return $.ajax({
            url: '/task_lists/' + $(this).attr('id') + '/rename',
            type: 'POST',
            data: {
              name: $(this).val()
            },
            dataType: 'json',
            success: function(data) {
              if (data.status === 'success') {
                return header.html('<i class="halflings-icon check"></i>' + data.title);
              } else if (data.status === 'error') {
                return alert('Sorry, something went wrong');
              }
            }
          });
        }
      });
    },
    showUploadText: function(e) {
      e.preventDefault();
      $('#media_btn').hide();
      $('#media_content').hide('slow');
      $('#create_text').toggle('slow');
      $('#create_video').hide();
      $('#new-audio').hide();
      return false;
    },
    showUploadGraphic: function(e) {
      e.preventDefault();
      $('#media_btn').hide();
      $('#create_text').hide();
      $('#media_content').hide('slow');
      $('#create_graphic').toggle('slow');
      $('#create_video').hide();
      $('#new-audio').hide();
      return false;
    },
    showUploadAudio: function(e) {
      e.preventDefault();
      $('#media_btn').hide();
      $('#media_content').hide('slow');
      $('#create_graphic').hide();
      $('#create_text').hide();
      $('#create_video').hide();
      $('#new-audio').fadeIn('slow', function() {
        return $(this).removeClass('hidden');
      });
      return false;
    }
  };

  CF.views.projects.taskListHeadRename();

}).call(this);
(function() {

  CF.views.tasks = {
    init: function() {
      $('#task_content').on('click', '.add-new-task-wrapper', this.newTask);
      $('#task_content').on('click', '.btn-cancel-create-task', this.cancelTask);
      $(document).on('click', this.blurCreateTask);
      return $("#task_content").on('click', '.dd-item', this.showTask);
    },
    newTask: function(e) {
      var $container;
      e.preventDefault();
      $container = $(this).closest('.box-content');
      $container.find('.add-new-task-wrapper').addClass('hidden');
      $container.find('.new-task-form-wrapper').removeClass('hidden');
      $container.find('.task-title').focus();
      return false;
    },
    cancelTask: function(e) {
      var $wrapper;
      e.preventDefault();
      $wrapper = $(this).closest('.new-task-form-wrapper');
      $wrapper.addClass('hidden');
      $wrapper.find('textarea').val('');
      $wrapper.siblings('.add-new-task-wrapper').removeClass('hidden');
      return false;
    },
    blurCreateTask: function(e) {
      var $target, $wrapper;
      $target = $(e.target);
      if (!($target.closest(".task-wrapper").length || ($target.attr('class') && "btn-cancel-create-task btn-add-task".indexOf($target.attr('class')) > 0))) {
        $wrapper = $('.btn-cancel-create-task').closest('.new-task-form-wrapper');
        $wrapper.addClass('hidden');
        $wrapper.find('textarea');
        return $wrapper.siblings('.add-new-task-wrapper').removeClass('hidden');
      }
    },
    showTask: function(e) {
      var id;
      e.preventDefault();
      id = $(this).attr('data-task-id');
      $.ajax({
        url: '/tasks/' + id,
        type: 'GET',
        dataType: 'json',
        success: function(data) {
          if (data.status === 'success') {
            $('#edit-task-dialog').html(data.html).fadeIn();
            return $('#edit-task-dialog .cleditor').cleditor({
              width: '415px'
            });
          }
        }
      });
      $("#edit-task-dialog").modal("show");
      return false;
    },
    openEditTask: function(e) {
      return $('#edit-task-dialog').dialog({
        title: "Edit Task",
        width: "850px",
        open: function(dialog) {}
      });
    },
    fetchEditTask: function(taskid, url) {
      return $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function(data) {},
        error: function() {}
      });
    }
  };

}).call(this);
(function() {

  CF.views.task_lists = {
    init: function() {
      $('#task_content').on('click', '.create-list.idle', this.showCreateList);
      $('#task_content').on('click', '#btn-cancel-create-list', this.cancelCreateList);
      return $(document).on('click', this.blurCreateList);
    },
    showCreateList: function(e) {
      e.preventDefault();
      $('#new-list').addClass('hidden');
      $('#task_list_title').removeClass('hidden').focus();
      $('#btn-create-list').removeClass('hidden');
      $('#btn-cancel-create-list').removeClass('hidden');
      $('.create-list').removeClass('idle');
      return false;
    },
    cancelCreateList: function(e) {
      e.preventDefault();
      CF.views.task_lists.hideCreateList(e);
      $('#task_list_title').val('');
      return false;
    },
    blurCreateList: function(e) {
      var $target;
      $target = $(e.target);
      if (!($target.closest(".create-list").length && $target.attr('id') && "task_lists task_list_title btn-create-list".indexOf($target.attr('id')) > 0)) {
        return CF.views.task_lists.hideCreateList(e);
      }
    },
    hideCreateList: function(e) {
      $('#new-list').removeClass('hidden');
      $('#task_list_title').addClass('hidden');
      $('#btn-create-list').addClass('hidden');
      $('#btn-cancel-create-list').addClass('hidden');
      return $('.create-list').addClass('idle');
    }
  };

}).call(this);
(function() {



}).call(this);
