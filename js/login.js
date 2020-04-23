$(document).ready(function () {

    getData();

    function getData(){
        $.ajax({
            type: "GET",
            url: "https://5e90a65b2810f4001648b1be.mockapi.io/api/v1/account",
            data: "acc",
            dataType: "json",
            success: function(acc){
                $('#create_acc').click(function (e) { 
                    if( checkNewAcc() == true){
                        if(checkExist(acc, $('#new_acc')) == true){
                            $('#create_acc').click(function(){return true});
                        }else{
                            $('#create_acc').click(function(){return false});
                        }
                    }
                });
            },
        });
    }

    function checkExist(data, name){
        for(i = 0; i < data.length; i++){
            if(name ==  data[i].name) return false;
        }
        return true;
    }

    function checkNewAcc () {
        if(onMail() == false && onPass() == true){
            $('#error1').css({'display':'block'});
            $('#error2').css({'display':'none'});
            return false;
        }
        if(onMail() == true && onPass() == false){
            $('#error2').css({'display':'block'});
            $('#error1').css({'display':'none'});
            return false;
        }
        if(onMail() == false && onPass() == false){
            $('#error2').css({'display':'block'});
            $('#error1').css({'display':'block'});
            return false;
        }
        if(onMail() == true && onPass() == true){
            $('#error2').css({'display':'none'});
            $('#error1').css({'display':'none'});
            return true;
        }
    }

    function onMail(){
        if($('#new_acc').val().match(/^[a-z][a-z0-9_\.]{5,32}@[a-z0-9]{2,}(\.[a-z0-9]{2,4}){1,2}$/)) return true;
        return false;
    }

    function onPass(){
        if($('#new_pass').val().length >= 5 && $('#new_pass').val().length <= 20) return true;
        else return false;
    }

    
});