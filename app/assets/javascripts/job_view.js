$( document ).ready(function() {
  $('#project_description').hide();
  $('#examplePadBasic').pad({'padId':'test'});
  $('#project_title').click(function() {
    $('#project_description').toggle('slow');
  });

  
 $('.dd').nestable().on('change', function(returnData) {
    var tasklist = $(this).attr('data-task-list-id')
   $.each( $(returnData.target).nestable('serialize'), function( index, value) {
     console.log( value.taskListId + ": " + tasklist );
     if( typeof(value.taskListId) != 'undefined' && value.taskListId != tasklist){
         $.ajax({
         url: '/task_lists/'+tasklist+'/update_task',
         data: {task_id:value.taskId},
         type: 'POST',
         success: function(data){
           console.log( data.status );
         },
         error: function(data){
           console.log('auto save failed')
         }
       });
     }

   });
 });

 $('#task_due_date').live('change', function(){
    var id = $(this).data('id')
    var value = $(this).val();
   $.ajax({
       url: '/tasks/'+id,
       data: {'task[due_date]':value},
       type: 'PUT',
       dataType: 'json',
       success: function(data){
          $('#task-success-message').append('Saved Successfuly').fadeOut('slow');
       },
       error: function(data){
         console.log('auto save failed')
       }
     });
  });
  $('#task_status').live('change', function(){
    var selected = $(this).find('option:selected');
    var id = selected.data('id'); 
    var value = $(this).val();
    $.ajax({
       url: '/tasks/'+id,
       data: {'task[status]':value},
       type: 'PUT',
       dataType: 'json',
       success: function(data){
          $('#task-success-message').append('Saved Successfuly').fadeOut('slow');
       },
       error: function(data){
         console.log('auto save failed')
       }
     });
  });

  $('.due_date, .assign').live('click', function(){
    $(this).parent().find('input').toggle();
  });

  var load_media = function() {
    $('#media_btn').toggle('slow')
    $('#media_content').toggle('slow');
  } 

  $('#remove-workspace-text').click(function(){
    $('#create_text').toggle('slow');
    load_media();
  });

  $('#remove-workspace-graphic').click(function(){
    $('#create_graphic').toggle('slow');
    load_media();
  });

  $('#remove-workspace-video').click(function(){
    $('#create_video').toggle('slow');
    load_media();
  });

  $('#create-graphic-pad').click(function(){
    $('#media_pad_btn').hide();
    $('#munk_pad_file_manager').toggle('slow');
    $('#create_graphic').toggle('slow');
  });

  $('#create-text-pad').click(function(){
    $('#media_pad_btn').hide();
    $('#munk_pad_file_manager').toggle('slow');
    $('#create_text').toggle('slow');
  });

  $('#save-task-btn').click(function(){
    $('#task_btn').hide();
    $('#save_task').toggle('slow');
    $('#task_list').toggle('slow');
  });

  $('#remove-save-task-template').click(function(){
    $('#task_btn').show();
    $('#save_task').toggle('slow');
    $('#task_list').toggle('slow');
  });

  $('#create_task').hide();
  $('#create_category').hide();
  $('#create_text').hide();
  $('#create_graphic').hide()
  $('#create_video').hide();
  $('#upload_file').hide();
  $('#storage_return').hide();

  $('#create_category_btn').click(function() {
    $('#task_btn').hide();
    $('#task_content').hide('slow');
    $('#create_category').toggle('slow');
  });

  $('#create_video_btn').click(function() {
    $('#media_btn').hide();
    $('#media_content').hide('slow');
    $('#create_video').toggle('slow');
  });   
  $('#storage_return').click(function(){
    $('#upload_file').slideUp('slideDown');
    $('#storage_return').hide();
    $('#media_btn').toggle('slow');
  });
  $('#upload_file_btn').click(function(){
    $('#media_btn').hide();
    $('#storage_return').toggle('slow');
    $('#upload_file').slideDown('slow');
  });

  $('#start_project_explataion_tour').click(function(){
    $('#projectHowTo').joyride({
        autoStart : true,
        postStepCallback : function (index, tip) {
        if (index == 2) {
          $(this).joyride('set_li', false, 1);
        }
      },
      modal:true,
      expose: true
    });
  });

  //returns height
  $.fn.getBgHeight = function () {
          var height = 0;
          var path = $(this).css('background').replace('url', '').replace('(', '').replace(')', '').replace('"', '').replace('"', '');
          var tempImg = '<img id="tempImg" src="' + path + '"/>';
          $('body').append(tempImg); // add to DOM before </body>
          $('#tempImg').hide(); //hide image
          height = $('#tempImg').height(); //get height
          $('#tempImg').remove(); //remove from DOM
          return height;
      };
  // returns width
  $.fn.getBgWidth = function () {
      var width = 0;
      var path = $(this).data('image');
      var tempImg = '<img id="tempImg" src="' + path + '"/>';
      $('body').append(tempImg); // add to DOM before </body>
      $('#tempImg').hide(); //hide image
      width = $('#tempImg').width(); //get width
      $('#tempImg').remove(); //remove from DOM
      return width;
  };
  // usage 
});

function arrange_size() {
  var height = $('#title-board').getBgHeight;
  var width = $('#title-board').getBgwidth;
  $('#title-board').css('width', width);
  $('#title-board').css('height', height);
}

$(window).load(function() {

});

$('#visible-to-team').click( function(){
  $.ajax({
    url: '/branch/change_idea_tab_status',
    data: {'id':$(this).data('branch')},
    type: 'POST',
    dataType: 'JSON',
    success: function(data){
      $('#not-visible-to-team').removeClass("disabled");
      $('#visible-to-team').addClass("disabled")
    },
    error: function(data){
      console.log('auto save failed')
    }
  });
});

$('#not-visible-to-team').click( function(){
  $.ajax({
    url: '/branch/change_idea_tab_status',
    data: {'id':$(this).data('branch')},
    type: 'POST',
    dataType: 'JSON',
    success: function(data){
      $('#not-visible-to-team').addClass("disabled");
      $('#visible-to-team').removeClass("disabled");
    },
    error: function(data){
      console.log('auto save failed')
    }
  });
});
$(document).ready(function(){
  $('.bootstrapeditor').wysihtml5();
});

// var Dropzone = require("dropzone");
// Dropzone.options.myAwesomeDropzone = {
//   paramName: "file", // The name that will be used to transfer the file
//   maxFilesize: 100, // MB
//   accept: function(file, done) {
//     if (file.name == "justinbieber.jpg") {
//       done("Naha, you don't.");
//     }
//     else { done(); }
//   }
// };
