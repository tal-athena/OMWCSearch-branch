(function () {
    $(document).ready(function () {

        //Disable ajax
        $.mobile.ajaxEnabled = false;

        $('.formInput').keypress(function (event) {
            if (event.which == 13) {
                event.preventDefault();
                $("#logOnPage form").submit();
            }
        });

        $('.loginFormCancel').click(function (e) {
            e.preventDefault();
            //Reset values (username and password)
            $('#UserName').val('');
            $('#Password').val('');

            //Remove validations
            $('.field-validation-error').remove();
            $('.validation-summary-errors').remove();
        });
    });
})();
