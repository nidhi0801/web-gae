var host=window.location.protocol+"//"+window.location.host;
var image_server=window.location.protocol+"//"+window.location.host;

var swfu;
	function showUploadTool() {
			swfu = new SWFUpload({
				// Backend Settings
				upload_url: host+"/admin/lib/article_file_upload/upload.php",
				// File Upload Settings
				file_size_limit : "10 MB",	// 2MB
				file_types : "*.mp3;",
				file_types_description : "mp3 only",
				file_upload_limit : "0",
				file_queue_error_handler : fileQueueError,
				file_dialog_complete_handler : fileDialogComplete,
				upload_progress_handler : uploadProgress,
				upload_error_handler : uploadError,
				upload_success_handler : uploadSuccess,
				upload_complete_handler : uploadComplete,

				// Button Settings
				button_image_url : image_server+"/images/fileupload/upload_mp3.gif",
				button_placeholder_id : "spanButtonPlaceholder",
				button_width: 108,
				button_height: 19,
				button_text_top_padding: 0,
				button_text_left_padding: 0,
				button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
				button_cursor: SWFUpload.CURSOR.HAND,
				
				// Flash Settings
				flash_url : host+"/admin/lib/article_file_upload/swf/swfupload.swf",

				custom_settings : {
					upload_target : "divFileProgressContainer"
				},
				
				// Debug Settings
				debug: false
				
			});
			
			
		}
