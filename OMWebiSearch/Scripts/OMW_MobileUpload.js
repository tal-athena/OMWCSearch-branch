'use strict';

(function () {
    var chunkSize = 10000;

    var baseUrl = $('#hdnAppBaseUrl').val();
    var uploadInProgress = false;
    var upload = {};

    var $startButtonContent = '<span class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-refresh ui-btn-icon-left ui-btn-a">Start</span>';
    var $pauseButtonContent = '<span class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-forbidden ui-btn-icon-left ui-btn-a">Pause</span>';
    var $resumeButtonContent = '<span class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-recycle ui-btn-icon-left ui-btn-a">Resume</span>';
    var $cancelButton = '<div class="cancel"><span class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-delete ui-btn-icon-left ui-btn-a">Cancel</span></div>';
    var $startButton = '<div class="start">' + $startButtonContent + '</div>';


    $(document).ready(function () {

        var url = baseUrl + 'Upload/FileUpload/';

        var fileUpload = $('#fileUpload').fileupload({
            autoUpload: true,
            url: url + 'Upload',
            multipart: false,
            maxChunkSize: chunkSize,
            maxNumberOfFiles: 1,
            add: function (e, data) {
                startUpload(this, e, data);
            },
            beforeSend: function (jqXHR, settings) {
                //Add headers
                var file = settings.files[0];

                jqXHR.setRequestHeader('X-File-Name', !!upload.fileName ? upload.fileName : file.name);
                jqXHR.setRequestHeader('X-File-Size', file.size);
                jqXHR.setRequestHeader('X-Signature', upload.md5hash);
                jqXHR.setRequestHeader('X-Template', upload.template);
                if (settings.chunksNumber) {
                    jqXHR.setRequestHeader('X-Chunk-Index', settings.chunksIndex);
                    jqXHR.setRequestHeader('X-Chunks-Number', settings.chunksNumber);
                }

                upload.jqXHR = jqXHR;
                upload.data.uploadedBytes = settings.uploadedBytes;
            },
            progress: function (e, data) {
                calculateProgress(data);
            }
        })
            .on('fileuploadchunkdone', function (e, data) {
                //Get the name from response
                var newName = JSON.parse(data.result).newName;

                upload.fileName = newName;
            })
            .bind('fileuploadsubmit', function (e, data) {
                var filename = !!upload.fileName ? upload.fileName : upload.data.files[0].name;
                $.getJSON(url + 'GetFile', { file: filename }, function (result) {

                    var size = !result.size ? 0 : result.size;
                    upload.data.uploadedBytes = size;

                    //Change status of upload 
                    upload.inProgress = true;
                    //Change buttons
                    $('#uploadItem').find('.start').html($pauseButtonContent);
                });

            })
            .bind('fileuploaddone', function (e, data) {
                upload.inProgress = false;
                upload.finished = true;

                var filename = !!upload.fileName ? upload.fileName : data.files[0].name;

                $.getJSON(url + 'GetStoryURL', { file: filename }, function (result) {

                    //Get URL for story and show url instead of buttons

                    var uploadElement = $('#uploadItem');
                    uploadElement.find('.start').remove();
                    uploadElement.find('.cancel').remove();
                    var a = '<div class="upload-message"><a href="/' + result.url + '" class="uploaded-story-link">Open Object</a><div>';
                    uploadElement.find('.upload-buttons').append(a);

                    //Show file picker on upload button
                    $('#uploadButton').off('click');
                    $('#fileUpload').css('z-index', 'auto');
                });
            })
            .bind('fileuploadfail', function (e, data) {

                //If upload failed of stoped change button text and upload status
                upload.inProgress = false;

                if (data.jqXHR.status === 0) {
                    //Paused
                    $('#uploadItem').find('.start').html($resumeButtonContent);
                }
                else {
                    //Show error
                    var uploadElement = $('#uploadItem');
                    uploadElement.find('.start').remove();
                    uploadElement.find('.cancel').remove();
                    var a = '<div class="upload-message"><a id="error-btn-' + pos + '" class="uploaded-story-link">Error</a><div>';
                    uploadElement.find('.upload-buttons').append(a);
                    //On click alert error message
                    $('#error-btn-' + pos).click(function () {
                        alert(data.errorThrown);
                    });
                }
            });


        $("#uploadPopupMenu").off('click', '.start').on('click', '.start', function () {

            if (!!upload && !!upload.data) {
                if (upload.inProgress) {
                    //Pause
                    upload.jqXHR.abort();
                    $(this).html($resumeButtonContent);
                }
                else {
                    //Start upload
                    if (!upload.finished) {
                        upload.data.submit();
                    }

                    $(this).html($pauseButtonContent);
                }
            }
        });

        $('#uploadPopupMenu').on('click', '.cancel', function (e) {
            if (!!upload && !!upload.jqXHR) {
                if (!!upload.jqXHR.abort) {
                    upload.jqXHR.abort();
                }
                var filename = !!upload.fileName ? upload.fileName : upload.data.files[0].name;

                //Remove from server
                cancelUpload(upload, filename);
            }
        });


        var startUpload = function (that, e, data) {

            var name = data.files[0].name;

            //If it is already added just continue with upload
            if (!!upload && upload.name === name) {
                alert('Already in the list');
            }
            else {
                $.getJSON(url + 'GetMatch', { file: data.files[0].name }, function (result) {

                    console.log(result);
                    if (!!result.match && result.match.length === 0) {
                        alert("There is no match!");
                    }
                    else {

                        $('#uploadContent').html('<div id="uploadItem">' +
                                '<div class="uploadImgAndText"><img id="fileType" /><span id="fileName"></span></div>' +
                                '<div class="progress"><span id="uploadFileSize" class="file-size"></span><div class="progress-bar"></div></div>' +
                                '<div class="upload-buttons">' +
                                    '<div id="startButton"></div>' +
                                    '<div id="cancelButton"></div>' +
                                '</div>' +
                            '</div>');

                        //Add to uploads
                        upload = { data: data, jqXHR: {}, finished: false };

                        //Show values for upload
                        $('#fileType').attr('src', getIconPath(name));
                        $('#fileName').text(name);
                        $('#uploadFileSize').text(humanFileSize(data.files[0].size));
                        $('#startButton').html($startButton);
                        $('#cancelButton').html($cancelButton);


                        $('#fileUpload').css('z-index', -5);
                        $('#uploadButton').click(function () {
                            showUploadPopUp();
                        });

                        //Calculate progress
                        var progress = parseInt(data.uploadedBytes / data.files[0].size * 100, 10);
                        $('#uploadItem .progress-bar').css('width', progress + '%');


                        if (result.match.length === 1) {

                            //Show popup
                            showUploadPopUp();

                            upload.template = result.match[0];

                            //Start upload
                            $.blueimp.fileupload.prototype
                                    .options.add.call(that, e, data);
                        }
                        else {
                            //Ask user to choose and then start upload with selected value

                            $('#matchContent').html('');
                            //upload.template = result.match;
                            var content = '';
                            for (var i = 0; i < result.match.length; i++) {
                                var li = '<li class="matchItem" data-match="' + result.match[i] + '"><img class="matchImage" src="' + getTemplateIconPath(result.match[i]) + '" /><span>' + result.match[i] + '</span></li>';
                                content += li;
                            }
                            $('#matchContent').append(content);
                            $('.matchItem').click(function () {
                                upload.template = $(this).data('match');
                                $('#uploadMatchesPopupMenu').popup().popup('close');

                                //Start upload
                                $.blueimp.fileupload.prototype
                                  .options.add.call(that, e, data);
                            });

                            //Show new popup that should get all matches in list
                            $('#uploadMatchesPopupMenu').off("popupafterclose").on("popupafterclose", function () {
                                if (!!upload.template) {
                                    $('#uploadPopupMenu').popup().popup('open');
                                }
                                else {
                                    //Stop upload
                                    $('#uploadItem').remove();

                                    $('#uploadButton').off('click');
                                    $('#fileUpload').css('z-index', 'auto');
                                }
                            });
                            $('#startPagePopupMenu').off("popupafterclose").on("popupafterclose", function () {
                                $('#uploadMatchesPopupMenu').popup().popup('open');
                            });
                            $('#startPagePopupMenu').popup().popup('close');
                            delete upload.template;
                        }


                    }
                });
            }
        };

        $('#matchCancel').click(function () {
            $('#uploadMatchesPopupMenu').popup().popup('close');
        });

        var showUploadPopUp = function () {
            $("#startPagePopupMenu").off("popupafterclose").on("popupafterclose", function () {
                $('#uploadPopupMenu').popup().popup('open');
            })
            $('#startPagePopupMenu').popup().popup('close');
        };

        var getTemplateIconPath = function (filename) {
            var path = baseUrl + 'Content/Images/FileTypeIcons/';
            path += 'file.jpg';
            return path;
        };

        var getIconPath = function (filename) {
            //Get extension
            var ext = filename.substr(filename.lastIndexOf('.') + 1);

            var path = baseUrl + 'Content/Images/FileTypeIcons/';
            if (ext == 'jpeg' || ext == 'jpg' || ext == 'png') {
                path += 'image.jpg';
            }
            else if (ext == 'mp3' || ext == 'wav') {
                path += 'audio.jpg';
            }
            else {
                path += 'file.jpg';
            }

            //Return path
            return path;
        };

        var calculateProgress = function (data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#uploadItem .progress-bar').css('width', progress + '%');
        };

        var humanFileSize = function (bytes, si) {
            var thresh = si ? 1000 : 1024;
            if (bytes < thresh) return bytes + ' B';
            var units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
            var u = -1;
            do {
                bytes /= thresh;
                ++u;
            } while (bytes >= thresh);
            return bytes.toFixed(2) + ' ' + units[u];
        };


        var cancelUpload = function (upload, filename) {
            $.getJSON(url + 'RemoveFile', { file: filename }, function (result) {
                upload.data.uploadedBytes = 0;
                $('#uploadItem').remove();

                $('#uploadButton').off('click');
                $('#fileUpload').css('z-index', 'auto');
                //Close popup
                $('#uploadPopupMenu').popup().popup('close');
            });
        };

    });

})();