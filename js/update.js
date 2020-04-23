$(document).ready(function () {

    // lyric move
    $("#fa_caret_1").click(function (e) { 
        e.preventDefault();
        var x = $("#lyrics").position().left;
        if(x < 0){
            TweenMax.to($("#lyrics"), 1.5, {left:0,ease: "power4.out"});
        }
        if(x == 0){
            TweenMax.to($("#lyrics"), 1.5, {left:-400,ease: "power4.out"});
        }
        $(this).toggleClass("fa-caret-right");
        $(this).toggleClass("fa-caret-left");
    });

    // album_list move
    var k = $(window).width();
    $("#fa_caret_2").click(function (e) { 
        e.preventDefault();
        var x = $("#album_list").position().left + 420;
        if(x > k){
            TweenMax.to($("#album_list"), 1.5, {right:0,ease: "power4.out"});
        }
        if(x == k){
            TweenMax.to($("#album_list"), 1.5, {right:-400,ease: "power4.out"});
        }
        $(this).toggleClass("fa-caret-right");
        $(this).toggleClass("fa-caret-left");
    });

    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    let musicSong = []; //list songs in database
    //get song from mockapi
    function getSongFromDB(){
        $.ajax({
            type: "GET",
            url: "https://5e90a65b2810f4001648b1be.mockapi.io/api/v1/music",
            data: "music",
            dataType: "json",
            async: false,
            success: function (music) {
                for(i = 0; i < music.length; i++){
                    musicSong[i]=JSON.parse(JSON.stringify(music[i]));
                }
            }
        });
        
    }
    getSongFromDB();

    let songArr = [];//list songs of one category
    getArrSongs = function(title){
        songArr.splice(0, songArr.length);
        var a = title,
            count = 0;
        for(i = 0; i < musicSong.length; i++){
            if(musicSong[i].category === a){
                var song  = new Object();
                song.id = count + 1;
                song.category =a;
                song.author = musicSong[i].author;
                song.name = musicSong[i].name;
                song.track = musicSong[i].track;
                song.image = musicSong[i].image;
                song.lyric = musicSong[i].lyric;
                songArr[count] = JSON.parse(JSON.stringify(song));
                count++;
            } 
        }
    }
    getArrSongs('Nhạc trẻ');

    // show infor of title
     var list_song = $("#category ul li a");
     list_song.each(function(){
         $(this).click(function (e) { 
             e.preventDefault();
             // toggle active class
             list_song.each(function(){$(this).removeClass("active_cate");});
             $(this).addClass("active_cate");
             TweenMax.to($("#album_list"), 1.5, {right:0,ease: "power4.out"});
             $("#fa_caret_2").attr("class", "fa fa-caret-right");

             // show infor
             updateListSong($(this).html());
            
         });    
         
     })//end show infor title

     //get index category whose playing song to add class update
     function getIndexCategory(title){
        for( i =0;  i < list_song.length; i++){
            if(list_song[i].text == title){
                return i;
            }
        }
    }

    function updateListSong(title){
        // update list song
        getArrSongs(title);
        var q = getIndexCategory(title);
        $("#category ul li a").each(function(){$(this).removeClass("active_cate");});
        $('#category ul li a:eq('+q+')').addClass("active_cate");

        var a  = title;
        // var count = 0;
        $("#album_infor h3").text(a);
        // function numberSongs(){
        //     for(i = 0; i < musicSong.length; i++){
        //         if(musicSong[i].category === a) count++;
        //     }
        // }
        // numberSongs();
        $("#album_infor i").text(songArr.length+ " songs");

        function showListSongs(){
            for(i = 0; i < songArr.length; i++){
                if(songArr[i].category === a){
                    $("#list_songs ul").add(
                            `<li><a>${songArr[i].name}</a></li>`
                    ).appendTo('#list_songs ul');
                }
            }
        }
        $("#list_songs ul").text('');//delete history of ul
        showListSongs();
        chooseSongFromList();
    }


    function chooseSongFromList(){
        var song_click = $("#list_songs ul li a");
        var count = 0;
        function numberSongs(){
            for(i = 0; i < songArr.length; i++){
                if(songArr[i].category === $("#album_infor h3").html()) count++;
            }
        }
        song_click.each(function(){
            $(this).click(function(e){
                e.preventDefault();
                song_click.each(function(){$(this).removeClass("song_active");});
                TweenMax.to($("#lyrics"), 1.5, {left:0,ease: "power4.out"});
                $("#fa_caret_1").attr("class", "fa fa-caret-left");
                $(this).addClass("song_active");
                numberSongs();
                for(i = 0; i < songArr.length; i++){
                    if($(this).html() == songArr[i].name){
                        selectSong2(i);
                    }
                }
                count = 0;
            })
        });
    }

    var playTrack = $("#player-track"), albumArt = $("#album-art"),
        playPauseBtn = $("#play-pause i"),sArea = $("#s-area"),
        sHover = $("#s-hover"),ins_time = $("#ins-time"),
        seek_bar = $("#seek-bar"), time_flag = 0, track_time = $("#track-time"),
        cur_minutes, cur_seconds, song_minutes, song_seconds,
        cur_time = $("#current-time"), length_of_song = $("#track-length"),
        ran_process, run_time, load_time, bar_position, pointer_pos, ran_seconds, 
        get_seconds, get_minutes, loadInterval = null,
        index = -1, author_name = $("#author-name"), track_name = $("#track-name");

    function playPause(){
        setTimeout(function(){
            if(audio.paused){
                playTrack.addClass("active");
                albumArt.addClass("active");
                loading();
                playPauseBtn.attr("class", "fas fa-pause");
                audio.play();
            }else{
                playTrack.removeClass("active");
                albumArt.removeClass("active");
                clearInterval(loadInterval);
                albumArt.removeClass('buffering');
                playPauseBtn.attr("class", "fas fa-play");
                audio.pause();
            }
        },300);
    }

    // show time that you want to select or see on track
    function wishPlaceHover(event){
        //get track's postiton 
        bar_position = sArea.offset();

        //get pointer's positon on track
        pointer_pos = event.clientX - bar_position.left;

        //get ran minutes
        ran_seconds = audio.duration * (pointer_pos / sArea.outerWidth());
        
        //update sHover's width
        sHover.width(pointer_pos);

        //get exactly times that pointer's position
        get_minutes = Math.floor(ran_seconds / 60);
        get_seconds = Math.floor(ran_seconds - get_minutes * 60);

        //set show's format
        if( isNaN(get_minutes) || isNaN(get_seconds)) ins_time.text('--:--');
        if( get_minutes < 0  || get_seconds < 0) return;
        if( get_minutes < 10) get_minutes = '0' + get_minutes;
        if( get_seconds < 10) get_seconds = '0' + get_seconds;
        else ins_time.text(get_minutes + ':' + get_seconds);

        ins_time.css({'left': pointer_pos, 'margin-left' : '-21px'}).fadeIn(0);
    }

    
    // hover area will hidden after user click
    function wishPlaceHidden(){
        sHover.width(0);
        ins_time.text('00:00').css({'left':'0px','margin-left':'0px'}).fadeOut(0);
    }

    // get truth of track's bar that can see
    function truthBar(){
        audio.currentTime = ran_seconds;
        seek_bar.width(pointer_pos);
        wishPlaceHidden();
    }
    
    //update time when song is playing status
    function currTime(){

        run_time =  new Date();
        run_time =  run_time.getTime();

        // show track-time
        if(time_flag == 1){
            time_flag = 1;
            track_time.addClass('active');
        }

        // get current times
        cur_minutes = Math.floor(audio.currentTime / 60);
        cur_seconds = Math.floor(audio.currentTime - cur_minutes * 60);

        // get song's time
        song_minutes = Math.floor(audio.duration / 60);
        song_seconds = Math.floor(audio.duration - song_minutes * 60);

        ran_process = (audio.currentTime / audio.duration) * 100;

        //set show's format
        if(cur_minutes < 10) cur_minutes = '0' + cur_minutes;
        if(cur_seconds < 10) cur_seconds = '0' + cur_seconds;
        if(song_minutes <  10) song_minutes = '0' + song_minutes;
        if(song_seconds < 10) song_seconds = '0' + song_seconds;

        //show cur_time
        if(isNaN(cur_minutes) || isNaN(cur_seconds)) cur_time.text('00:00');
        else cur_time.text(cur_minutes + ':' + cur_seconds);
        //show lenght of song
        if(isNaN(song_minutes) || isNaN(song_seconds)) length_of_song.text('00:00');
        else length_of_song.text(song_minutes + ':' + song_seconds);

        //check format all 
        if( isNaN(cur_minutes) || isNaN(cur_seconds) || isNaN(song_minutes) || isNaN(song_seconds) ){
            track_time.removeClass('active');
        }
        else track_time.addClass('active');
        
        seek_bar.width(ran_process + '%');
        // next song
        if(ran_process == 100){ selectSong(1);}

    }
    
    // loading staus 
    function loading(){
        clearInterval(loadInterval);
        loadInterval = setInterval(function(){
            if( run_time == 0 || (load_time -  run_time) > 1000){
                albumArt.addClass('buffering');
            }else{
                albumArt.removeClass('buffering');
            }
            load_time = new Date();
            load_time = load_time.getTime();
        },100);
    };

    //check current list has choosen's song
    function checkstatusListSong(a){
        if($("#album_infor h3").html() == a) return true;
        else return false;
    }            
    
    //play user's choosen song
    function selectSong(delta){
        // update index
        if(delta == 0 || delta == 1){
            if(index >= songArr.length - 1) index = 0;
            else index ++;
        }
        else if(delta == -1){
            if(index <= 0 ) index = songArr.length - 1;
            else index --;
        }

        //if current song is not inslid list,list will update   
        if(checkstatusListSong(songArr[index].category) == false){
            updateListSong(songArr[index].category);
        }
        $("#list_songs ul li a").each(function(){$(this).removeClass("song_active");});
        // var e = getIndexSong(songArr[index].name);
        $('#list_songs ul li a:eq('+index+')').addClass("song_active");

        // play song[index]
        // playPauseBtn.attr("class", "fas fa-play");
        if(delta == 0){
            albumArt.addClass('buffering active');
        }else{
            playPauseBtn.attr("class", "fas fa-pause");
            albumArt.removeClass('buffering');
            // audio.play();
            // audio.autoplay = true;
            // skip loading status when song is not play status
            clearInterval(loadInterval);
            loading();
        }
        audio.autoplay = true;
        seek_bar.width(0);
        cur_time.text('00:00');
        length_of_song.text('00:00');
        
        // song's infor
        author_name.text(songArr[index].author);
        track_name.text(songArr[index].name);
        audio.src = songArr[index].track;
        
        $("#album-art img").attr("src", songArr[index].image);

        // song's name and lyrics
        $('#song_infor h3').text(songArr[index].name);
        $('#song_infor i').text(songArr[index].author);
        if(songArr[index].lyric == ''){
            $('#contents p').text("<Bài hát này hiện chưa có lời>")
        }else{
            $('#contents p').text(songArr[index].lyric);
        }
        
    }

    function selectSong2(delta){
        index = delta;
        playPauseBtn.attr("class", "fas fa-pause");
        // albumArt.removeClass('buffering');
        playTrack.addClass('active');
        // audio.play();
        audio.autoplay = true;
        
        // skip loading status when song is not play status
        clearInterval(loadInterval);
        loading();
        seek_bar.width(0);
        cur_time.text('00:00');
        length_of_song.text('00:00');
        
        // song's infor
        author_name.text(songArr[index].author);
        track_name.text(songArr[index].name);
        audio.src = songArr[index].track;
        $("#album-art img").attr("src", songArr[index].image);

        // song's name and lyrics
        $('#song_infor h3').text(songArr[index].name);
        $('#song_infor i').text(songArr[index].author);
        if(songArr[index].lyric == ''){
            $('#contents p').text("<Bài hát này hiện chưa có lời>")
        }else{
            $('#contents p').text(songArr[index].lyric);
        }
    }

    // init player
    function initPlayer(){
        audio = new Audio();
        selectSong(0);
        $("#play-pause").on('click',playPause);
        audio.loop =  false;

        sArea.mousemove(function(event){
            wishPlaceHover(event);
        });
        sArea.mouseout(wishPlaceHidden);

        sArea.on('click',truthBar);

        $(audio).on('timeupdate', function () {
            currTime();
        });
        // $(audio).on('timeupdate',currTime);

        $("#play-previous").on('click',function(){
            selectSong(-1);
        });
        $("#play-next").on('click',function(){
            selectSong(1);
        });
    }

    initPlayer();

     //2>add song
     //add song
    $('#request_btn').click(function (e) { 
        e.preventDefault();
        if(checkAddForm() ==  false){
            alert('Incorect! Check again!');
        }
        else{
            var s1 = $('#f_url').val(),
                s1str=   s1.split("\\"),
                s2 = $('#f_img').val(),
                s2str = s2.split('\\');
                var musicStr ='';
                var musicImg = 'images/'+ s2str[s2str.length-1];
                if($('#f_category').val() == "Nhạc trẻ") musicStr = 'music/young/' + s1str[s1str.length-1];
                if($('#f_category').val() == "Bolero") musicStr = 'music/bolero/' + s1str[s1str.length-1];
                if($('#f_category').val() == "Nhạc Nhật") musicStr = 'music/nihon/' + s1str[s1str.length-1];
                if($('#f_category').val() == "Nhạc US-UK") musicStr = 'music/us-uk/' + s1str[s1str.length-1];
                if($('#f_category').val() == "Khác ...") musicStr = 'music/others/' + s1str[s1str.length-1];
            $.ajax({
                type: 'POST',
                url: 'https://5e90a65b2810f4001648b1be.mockapi.io/api/v1/music',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify( { "category": $('#f_category').val(),
                                        "author": $('#f_author').val(),
                                        "name": $('#f_name').val(),
                                        "track": musicStr,
                                        "image": musicImg,
                                        "lyric": $('#f_lyric').val()} ),
                processData: false,
                success: function( data, textStatus, jQxhr ){
                    alert('Add(s) Song Successfull');
                    $('#f_author').val('');
                    $('#f_name').val('');
                    $('#f_url').val('');
                    $('#f_img').val('');
                    $('#f_lyric').val('');
                    $('#post_area').css({'display':'none'});
                },
                error: function( jqXhr, textStatus, errorThrown ){
                    console.log( errorThrown );
                }
            });
        }
    });
   
    function checkAddForm(){
        if(checkAuthor() == true && checkName()== true && checkUrl() == true && checkImg() == true) return true;
        else{return false;}
    }

    function checkAuthor(){
        if($('#f_author').val() == '') return false;
        else return true;
    }

    function checkName(){
        if($('#f_name').val() == '') return false;
        else return true;
    }

    function checkUrl(){
        var str = $('#f_url').val();
        if(str.length == 0 || str.slice(str.length-4, str.length) != '.mp3') return false;
        else return true;
    }

    function checkImg(){
        var str = $('#f_img').val();
        if(str.length == 0) return false;
        else{
            var Childs = str.slice(str.length-4, str.length);
            if(Childs == '.jpg' || Childs == '.png' || Childs == 'jpeg') return true;
            else return false;
        }
         
    }

    //3> Update Lyrics
    $('#new_lyrics').click(function (e) { 
        e.preventDefault();
        var e = getIndexSongFromDB(songArr[index].name);
        $.ajax({
            type: "PUT",
            url: `https://5e90a65b2810f4001648b1be.mockapi.io/api/v1/music/${e}`,
            contentType: 'application/json',
            dataType: "json",
            data:JSON.stringify({
                "lyric": $('#update_area textarea').val()
            }),
            success: function (data) {
                alert('update success full!');
                $('#contents p').text(data.lyric);
                $('#update_area').css({'display':'none'});
            }
        });
    });
    
    function getIndexSongFromDB(name){
        for( i =0;  i < musicSong.length; i++){
            if(musicSong[i].name === name){
                return musicSong[i].id; 
               
            }
        }
    }

    


    //4>remove song
    $('#remove_all').click(function (e) { 
        if (this.checked) {
            $('#check_remove input').each(function () { 
                $(this).prop('checked', true); //check 
            });            
        } else {
            $('#check_remove input').each(function () { //loop through each checkbox
                $(this).prop('checked', false); //uncheck              
            });
        }
    });

    loadListSongRemove();

    function loadListSongRemove(){
        for(i = 0; i < musicSong.length; i ++){
            $("#check_remove").add(
                `<label class="container">${musicSong[i].name}
                <input type="checkbox" id="l_${musicSong[i].id}">
                <span class="checkmark"></span>
                </label>`
            ).appendTo('#check_remove');
        }
    }
        
    $('#check_remove input').click(function (e) { 
        if(this.checked){
            var idd = $(this).attr('id');
            var iddArr = idd.split('_');
            $('#remove_btn').click(function (e) { 
                $.ajax({
                    type: "DELETE",
                    url: `https://5e90a65b2810f4001648b1be.mockapi.io/api/v1/music/${iddArr[iddArr.length-1]}`,
                    data: JSON.stringify,
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function (song) {
                        alert(song.name + ', is removed!');
                    }
                    });
            });
        }
    });

    $('#add_button').click(function (e) { 
        e.preventDefault();
        $('#post_area').css({'display':'block'});
        TweenMax.to($("#lyrics"), 2.5, {left:-400,ease: "power4.out", delay:0.5});
        $("#fa_caret_1").attr("class", "fa fa-caret-right");
        $('#f_category').val($('#album_infor h3').html());
    });

    $('#delete_button').click(function (e) { 
        e.preventDefault();
        $('#remove_area').css({'display':'block'});
        TweenMax.to($("#lyrics"), 2.5, {left:-400,ease: "power4.out", delay:0.5});
    });

    $('#update_btn').click(function (e) { 
        e.preventDefault();
        $('#update_area').css({'display':'block'});
        TweenMax.to($("#album_list"), 2.5, {right:-400,ease: "power4.out", delay:0.5});
        $("#fa_caret_2").attr("class", "fa fa-caret-left");
    });

    $('#cancel_btn').click(function (e) { 
        e.preventDefault();
        $('#post_area').css({'display':'none'});
    });

    $('#cancel_btn1').click(function (e) { 
        e.preventDefault();
        $('#update_area').css({'display':'none'});
    });

    $('#cancel_btn2').click(function (e) { 
        e.preventDefault();
        $('#remove_area').css({'display':'none'});
    });     
});