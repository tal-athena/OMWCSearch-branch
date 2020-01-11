'use strict';

(function () {
    var chunkSize = 10000;

    var baseUrl = $('#hdnAppBaseUrl').val();
    var globalJqXHR;
    var uploadable = [];
    var uploadInProgress = false;
    var $cancelButton = '<div class="cancel toolbarButton"><img class=" iconBox" src="/OMWebiSearch/Content/Images/ButtonFind036.png"><span class="buttonText">Cancel</span></div>';

    var $startUploadButtonContent = '<img class=" iconBox" src="/OMWebiSearch/Content/Images/ButtonFind036.png"><span class="buttonText">Start Upload</span>';
    var $clearTableButtonContent = '<img class=" iconBox" src="/OMWebiSearch/Content/Images/ButtonFind036.png"><span class="buttonText">Clear Table</span>';
    var $cancelUploadButtonContent = '<img class=" iconBox" src="/OMWebiSearch/Content/Images/ButtonFind036.png"><span class="buttonText">Cancel Upload</span>';


    var $startButtonContent = '<img class=" iconBox" src="/OMWebiSearch/Content/Images/ButtonFind036.png"><span class="buttonText">Start</span>';
    var $pauseButtonContent = '<img class=" iconBox" src="/OMWebiSearch/Content/Images/ButtonNew036.png"><span class="buttonText">Pause</span>';
    var $resumeButtonContent = '<img class=" iconBox" src="/OMWebiSearch/Content/Images/ButtonSave036.png"><span class="buttonText">Resume</span>';
    var $startButton = '<div class="start toolbarButton">' + $startButtonContent + '</div>';

    $(document).ready(function () {

        $('.uploadBtnLabel, #uploadButtonDiv').click(function () {
            $('#openUploadModal').addClass('showModalDialog');
        });
        $('#closeUploadModal').click(function () {

            //Remove all finished from list
            for (var i = 0; i < uploadable.length; i++) {
                if (uploadable[i].finished) {
                    $('#pos-' + i).remove();
                }
            }

            $('#openUploadModal').removeClass('showModalDialog');
        });

        var url = baseUrl + 'Upload/FileUpload/';

        var fileUpload = $('#fileUpload').fileupload({
            autoUpload: true,
            url: url + 'Upload',
            multipart: false,
            maxChunkSize: chunkSize,
            maxNumberOfFiles: 5,
            add: function (e, data) {
                startUpdate(this, e, data);
            },
            beforeSend: function (jqXHR, settings) {
                //Add headers
                var file = settings.files[0];

                var pos = getIdFromUploadedFiles(file.name);

                jqXHR.setRequestHeader('X-File-Name', !!uploadable[pos].fileName ? uploadable[pos].fileName : file.name);
                jqXHR.setRequestHeader('X-File-Size', file.size);
                jqXHR.setRequestHeader('X-Signature', uploadable[pos].md5hash);
                jqXHR.setRequestHeader('X-Template', uploadable[pos].template);
                if (settings.chunksNumber) {
                    jqXHR.setRequestHeader('X-Chunk-Index', settings.chunksIndex);
                    jqXHR.setRequestHeader('X-Chunks-Number', settings.chunksNumber);
                }

                uploadable[pos].jqXHR = jqXHR;
                uploadable[pos].data.uploadedBytes = settings.uploadedBytes;
            },
            progress: function (e, data) {
                calculateProgress(data);
            },
            //progressall: function (e, data) {
            //    calculateProgressAll(data);
            //}
        })
            .on('fileuploadchunkdone', function (e, data) {
                //Get the name from response
                var newName = JSON.parse(data.result).newName;
                var pos = getIdFromUploadedFiles(data.files[0].name);

                uploadable[pos].fileName = newName;
            })
            .bind('fileuploadsubmit', function (e, data) {
                var pos = getIdFromUploadedFiles(data.files[0].name);

                var filename = !!uploadable[pos].fileName ? uploadable[pos].fileName : uploadable[pos].data.files[0].name;
                $.getJSON(url + 'GetFile', { file: filename }, function (result) {

                    var size = !result.size ? 0 : result.size;
                    uploadable[pos].data.uploadedBytes = size;


                    //Change status of upload 
                    uploadable[pos].inProgress = true;
                    //Change buttons
                    //$('.upload-start-all span').text('Pause');
                    //$('#pos-' + pos).find('.start').text('Pause');
                    $('.upload-start-all').html($pauseButtonContent);
                    $('#pos-' + pos).find('.start').html($pauseButtonContent);
                    $('.upload-clear-table').html($cancelUploadButtonContent);
                });

            })
            .bind('fileuploaddone', function (e, data) {
                var pos = getIdFromUploadedFiles(data.files[0].name);
                uploadable[pos].inProgress = false;
                uploadable[pos].finished = true;

                if (!uploadsActive()) {
                    //If this was the last active upload change buttons
                    $('.upload-start-all').html($startUploadButtonContent);
                    $('.upload-clear-table').html($clearTableButtonContent);
                }

                var filename = !!uploadable[pos].fileName ? uploadable[pos].fileName : data.files[0].name;

                $.getJSON(url + 'GetStoryURL', { file: filename }, function (result) {

                    //Get URL for story and show url instead of buttons

                    var uploadElement = $('#pos-' + pos);
                    uploadElement.find('.start').remove();
                    uploadElement.find('.cancel').remove();
                    var a = '<a href="' + result.url + '" class="uploaded-story-link">Open Object</a>';
                    uploadElement.find('.upload-buttons').append(a);
                });
            })
            .bind('fileuploadfail', function (e, data) {

                //If upload failed of stoped change button text and upload status
                var pos = getIdFromUploadedFiles(data.files[0].name);
                uploadable[pos].inProgress = false;

                if (data.jqXHR.status === 0) {
                    //Paused
                    $('.upload-start-all').html($resumeButtonContent);
                    $('#pos-' + pos).find('.start').html($resumeButtonContent);
                }
                else {
                    //Show error
                    var uploadElement = $('#pos-' + pos);
                    uploadElement.find('.start').remove();
                    uploadElement.find('.cancel').remove();
                    var a = '<a id="error-btn-' + pos + '" class="uploaded-story-link">Error</a>';
                    uploadElement.find('.upload-buttons').append(a);
                    //On click alert error message
                    $('#error-btn-' + pos).click(function () {
                        alert(data.errorThrown);
                    });

                    if (!uploadsActive()) {
                        //If this was the last active upload change buttons
                        $('.upload-start-all').html($startUploadButtonContent);
                        $('.upload-clear-table').html($clearTableButtonContent);
                    }
                }
            });


        $("#uploads").off('click', '.start').on('click', '.start', function () {

            var pos = $(this).parent().parent().data('pos');
            if (!!uploadable[pos] && !!uploadable[pos].data) {
                if (uploadable[pos].inProgress) {
                    //Pause
                    uploadable[pos].jqXHR.abort();
                    //$(this).text('Resume');
                    $(this).html($resumeButtonContent);
                }
                else {
                    //$.getJSON(url + 'GetFile', { file: uploadable[pos].data.files[0].name }, function (result) {

                    //    var size = !result.size ? 0 : result.size;
                    //    uploadable[pos].data.uploadedBytes = size;

                    //Start upload
                    if (!uploadable[pos].finished) {
                        uploadable[pos].data.submit();
                    }

                    $(this).html($pauseButtonContent);
                    //    $(this).text('Pause');
                    //});
                }
            }
        });

        $('#uploads').on('click', '.cancel', function (e) {
            //Cancel only this one
            var pos = $(this).parent().parent().data('pos');
            if (!!uploadable[pos] && !!uploadable[pos].jqXHR) {
                if (!!uploadable[pos].jqXHR.abort) {
                    uploadable[pos].jqXHR.abort();
                }

                var filename = !!uploadable[pos].fileName ? uploadable[pos].fileName : uploadable[pos].data.files[0].name;

                //Remove from server
                cancelUpload(filename, pos);
            }
        });


        var startUpdate = function (that, e, data) {

            var name = data.files[0].name;

            //If it is already added just continue with upload
            if (getFileFromUploadedFiles(name) !== null) {
                alert('Already in the list');
            }
            else {

                $.getJSON(url + 'GetMatch', { file: data.files[0].name }, function (result) {

                    console.log(result);
                    if (!!result.match && result.match.length === 0) {
                        alert("There is no match!");
                    }
                    else {

                        //Add to uploads
                        uploadable.push({ data: data, jqXHR: {}, finished: false });

                        ////Start upload
                        //$.blueimp.fileupload.prototype
                        //        .options.add.call(that, e, data);

                        //Add new item to the list 
                        var pos = (uploadable.length - 1).toString();
                        var li = '<li id="pos-' + pos + '" data-pos="' + pos + '">' +
                            '<img class="icon" src=' + getIconPath(name) + ' />' +
                            '<div class="name">' + name + '</div>' +
                            '<div class="upload-buttons">' + $cancelButton + $startButton + '</div>' +
                        '<div class="progress"><span class="file-size">' + humanFileSize(data.files[0].size) + '</span><div class="progress-bar"></div></div>'
                        + '</li>';
                        $('#uploads').append(li);


                        //Calculate progress
                        var progress = parseInt(data.uploadedBytes / data.files[0].size * 100, 10);
                        $('#pos-' + pos + ' .progress-bar').css('width', progress + '%');

                        if (result.match.length === 1) {
                            //Set template
                            uploadable[pos].template = result.match[0];

                            //Start upload
                            uploadable[pos].data.submit();

                        }
                        else {
                            //Show new modal for every item that needs to be resolved

                            //uploadable[pos].template = result.match;
                            var modal = '<div id="tempModal_' + pos + '"><div class="templateBack"></div><div class="chooseTemplateModal" data-pos="' + pos + '"><h3>' + name + '</h3><div><ul>';
                            for (var i = 0; i < result.match.length; i++) {
                                modal += '<li><img src="' + getTemplateIconPath(result.match[i]) + '" /><span>' + result.match[i] + '</span></li>';
                            }
                            modal += '</ul></div><button class="cancel toolbarButton">Cancel</button></div>';

                            $('body').append(modal);

                            $(document).on('click', '#tempModal_' + pos + ' button', function () {
                                //Stop and remove this upload
                                uploadable[pos] = {};
                                $('#pos-' + pos).remove();
                                //Close modal
                                $('#tempModal_' + pos).remove();
                            });
                            $(document).on('click', '#tempModal_' + pos + ' li', function () {
                                //Template selected
                                var template = $(this).find('span').text();
                                uploadable[pos].template = template;

                                //Start upload
                                uploadable[pos].data.submit();

                                //Close modal
                                $('#tempModal_' + pos).remove();
                            });
                        }
                    }
                });
            }
        };

        var uploadsActive = function () {
            for (var i = 0; i < uploadable.length; i++) {
                if (!!uploadable[i].data && uploadable[i].inProgress) {
                    return true;
                }
            }
            return false;
        };


        var getIdFromUploadedFiles = function (name) {
            for (var i = 0; i < uploadable.length; i++) {
                if (!!uploadable[i].data && uploadable[i].data.files[0].name === name) {
                    return i;
                }
            }
            return 0;
        };

        var getFileFromUploadedFiles = function (name) {
            for (var i = 0; i < uploadable.length; i++) {
                if (!!uploadable[i].data && uploadable[i].data.files[0].name === name) {
                    return uploadable[i];
                }
            }
            return null;
        };

        var getTemplateIconPath = function (filename) {
            var path = baseUrl + 'Content/Images/FileTypeIcons/';
            path += 'file.jpg';
            return path;
        };

        var getIconPath = function (filename) {
            //Get extension
            var ext = filename.substr(filename.lastIndexOf('.') + 1);

            console.log(ext);
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
            var id = getIdFromUploadedFiles(data.files[0].name);
            $('#pos-' + id + ' .progress-bar').css('width', progress + '%');
        };

        var calculateProgressAll = function (data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#uploadProgress .progress-bar').css('width', progress + '%');
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
        }

        $('.upload-start-all').click(function () {
            if ($(this).find('span').text() === 'Start Upload') {
                for (var i = 0; i < uploadable.length; i++) {
                    ////Start upload
                    //$.blueimp.fileupload.prototype
                    //        .options.add.call(that, e, data);
                    if (!uploadable[i].finished && !!uploadable[i].data) {
                        uploadable[i].data.submit();
                        uploadable[i].inProgress = true;
                    }
                }
            }
            else {
                if (uploadsActive()) {
                    //Pause uploads
                    for (var i = 0; i < uploadable.length; i++) {
                        if (!!uploadable[i].data && uploadable[i].inProgress && !uploadable[i].finished) {
                            uploadable[i].jqXHR.abort();
                            uploadable[i].inProgress = false;
                        }
                    }
                }
                else {
                    //Resume/Start all
                    for (var i = 0; i < uploadable.length; i++) {
                        if (!!uploadable[i].data && !uploadable[i].inProgress && !uploadable[i].finished) {
                            uploadable[i].data.submit();
                            uploadable[i].inProgress = true;
                        }
                    }
                }
            }
        });

        $('.upload-clear-table').click(function () {
            if ($(this).text() === 'Cancel Upload') {
                //Cancel uploads
                for (var i = 0; i < uploadable.length; i++) {
                    if (!!uploadable[i].data && !uploadable[i].finished && !!uploadable[i].data) {
                        uploadable[i].jqXHR.abort();


                        var filename = !!uploadable[i].fileName ? uploadable[i].fileName : uploadable[i].data.files[0].name;
                        cancelUpload(filename, i);
                    }
                }
                $(this).text('Clear Table');
            }
            else {
                //Clear table
                uploadable = [];
                $('#uploads').empty();
            }
        });

        var cancelUpload = function (name, position) {
            $.getJSON(url + 'RemoveFile', { file: name }, function (result) {
                uploadable[position].data.uploadedBytes = 0;
                $('#pos-' + position + ' .progress-bar').css('width', 0 + '%');
                //$('#pos-' + position + ' .start').text('Start');
                $('#pos-' + position + ' .start').html($startButtonContent);
            });
        };
    });

})();