$(document).ready(function () {
    $('.expandHeaderButton').click(function () {
        if ($('.headerButtonImage').hasClass('headerButtonImageExpand')) {
            $('.newHeaderMData').css({ "height": "0", "display":"block" });
            $('.newHeaderMData').animate({
                height: '60'
            }, 500, function() {
                 OMWClientContext.AdjustWholeHeight();
            });
        }
        else {
            $('.newHeaderMData').animate({
                height: '0'
            }, 500, function() {
                $('#newHeaderMData').hide();
                OMWClientContext.AdjustWholeHeight();
            });
        }
        $('.headerButtonImage').toggleClass('headerButtonImageCollapse headerButtonImageExpand');
        
    });

    if ($('#hdnStoryHShowText').val() !== 'True') {
        OMWClientContext.Story.Resizing();
    }

});

//Resize 
$(window).resize(function () {
    OMWClientContext.AdjustToolBar();
    OMWClientContext.AdjustWholeHeight();
    OMWClientContext._FixContentMWidth();
});