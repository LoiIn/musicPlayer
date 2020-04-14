$(document).ready(function () {
    $.ajax({
        type: "GET",
        url: "https://5e90a65b2810f4001648b1be.mockapi.io/api/v1/music",
        data: "music",
        success: function (music) {
        var playerTrack = $("#player-track"),
            authorName = $('#author-name'), trackName = $('#track-name'), albumArt = $('#album-art'),
            sArea = $('#s-area'), seekBar = $('#seek-bar'), trackTime = $('#track-time'),
            insTime = $('#ins-time'), sHover = $('#s-hover'),
            playPauseButton = $("#play-pause"),  i = playPauseButton.find('i'),
            tProgress = $('#current-time'), tTime = $('#track-length'), 
            seekT, seekLoc, seekBarPos, cM, ctMinutes, ctSeconds, curMinutes, curSeconds,
            durMinutes, durSeconds, playProgress, bTime, nTime = 0, buffInterval = null, clearautoplay = null, tFlag = 0, 
            playPreviousTrackButton = $('#play-previous'), playNextTrackButton = $('#play-next'), currIndex = -1;


        
        function playPause()
        {
            setTimeout(function()
            {
                if(audio.paused)
                {
                    playerTrack.addClass('active');
                    albumArt.addClass('active');
                    checkBuffering();
                    i.attr('class','fas fa-pause');
                    audio.play();
                }
                else
                {
                    playerTrack.removeClass('active');
                    albumArt.removeClass('active');
                    clearInterval(buffInterval);
                    albumArt.removeClass('buffering');
                    i.attr('class','fas fa-play');
                    audio.pause();
                    clearInterval(clearautoplay);
                }
            },300);
        }

        //giup hien thi nhung thoi diem ma minh di chuot tren track nhac ung voi thoi gian nao trong bai hat
        function showHover(event)
        {
            seekBarPos = sArea.offset(); //lay vi tri cua track nhac
            seekT = event.clientX - seekBarPos.left;
            //gt: event.clientX: lay toa do X cua vi tri con tro so voi le trai cua body
            //-seekBarPos.left  tra ve vi tri ma phan tu cach le trai cua body
            
            seekLoc = audio.duration * (seekT / sArea.outerWidth());
            //outerWidth: tra ve chieu rong ben ngoai cua phan tu, bao gom ca border va padding, khong bao gom margin
            //audio.duration: do dai thuc te cua bai hat <=> 100%
            //seeLock se tra ve phan tram <=> so s da chay duoc
            
            sHover.width(seekT);//cap nhat width cho the sHover
            
            cM = seekLoc / 60;//quy ve phut:giay
            
            ctMinutes = Math.floor(cM);//lay phan nguyen <=> so phut 
                                    //neu la so duong: 5.05||5.95 => 5
                                    //neu la so am   : -5.05||-5.95 => -6

            ctSeconds = Math.floor(seekLoc - ctMinutes * 60); //<=> so giay
            
            if( (ctMinutes < 0) || (ctSeconds < 0) )
                return;
            
            if( (ctMinutes < 0) || (ctSeconds < 0) )
                return;
            
            if(ctMinutes < 10)
                ctMinutes = '0'+ctMinutes;
            if(ctSeconds < 10)
                ctSeconds = '0'+ctSeconds;
            
            if( isNaN(ctMinutes) || isNaN(ctSeconds) )//check xem da dung dinh dang chua??
                insTime.text('--:--');
            else
                insTime.text(ctMinutes+':'+ctSeconds);
                
            insTime.css({'left':seekT,'margin-left':'-21px'}).fadeIn(0);
            //giup thoi gian thuc se di chuyen theo con tro chuot khi hover len track nhac.
            
        }

        //khoi tao gia tri ban dau cho thoi gian hover
        function hideHover()
        {
            sHover.width(0);
            insTime.text('00:00').css({'left':'0px','margin-left':'0px'}).fadeOut(0);		
        }
        
        //track thoi gian thuc chay 
        function playFromClickedPos()
        {
            audio.currentTime = seekLoc;
            seekBar.width(seekT);
            hideHover();
        }

    
        //update khi nhap chuot den mot thoi diem nghe bat ki trong track nhac
        function updateCurrTime()
        {
            nTime = new Date();
            nTime = nTime.getTime();
            //The internal clock in JavaScript starts at midnight January 1, 1970
            //display the number of milliseconds since midnight, January 1, 1970

            if( tFlag == 1)
            {
                tFlag = 1;
                trackTime.addClass('active');
            }

            curMinutes = Math.floor(audio.currentTime / 60);//so phut hien tai da phat
            curSeconds = Math.floor(audio.currentTime - curMinutes * 60);//so s da phat duoc
            
            durMinutes = Math.floor(audio.duration / 60);//so phut cua bai hat
            durSeconds = Math.floor(audio.duration - durMinutes * 60);//so s cua bai hat
            
            playProgress = (audio.currentTime / audio.duration) * 100;//hoan thanh duoc bao nhieu % cua bai hat
        
            if(curMinutes < 10)
                curMinutes = '0'+curMinutes;
            if(curSeconds < 10)
                curSeconds = '0'+curSeconds;
            
            if(durMinutes < 10)
                durMinutes = '0'+durMinutes;
            if(durSeconds < 10)
                durSeconds = '0'+durSeconds;
            
            if( isNaN(curMinutes) || isNaN(curSeconds) )
                tProgress.text('00:00');
            else
                tProgress.text(curMinutes+':'+curSeconds);
            
            if( isNaN(durMinutes) || isNaN(durSeconds) )
                tTime.text('00:00');
            else
                tTime.text(durMinutes+':'+durSeconds);
            
            if( isNaN(curMinutes) || isNaN(curSeconds) || isNaN(durMinutes) || isNaN(durSeconds) )
                trackTime.removeClass('active');
            else
                trackTime.addClass('active');

            
            seekBar.width(playProgress+'%');
            //hien thi do thanh mau do: thoi luong ma no da phat so voi tong
            
            if( playProgress == 100 )
            {
                selectTrack(1);
            }
        }

        // function noplaytrack()
        // {
        //     i.attr('class','fa fa-play');
        //     seekBar.width(0);
        //     tProgress.text('00:00');
        //     albumArt.removeClass('buffering').removeClass('active');
        //     clearInterval(buffInterval);
        // }

        //trang thai: dang load nhac
        function checkBuffering(){
            clearInterval(buffInterval);
            buffInterval = setInterval(function()
            { 
                if( (nTime == 0) || (bTime - nTime) > 1000 ){
                    albumArt.addClass('buffering');
                }  
                else{
                    albumArt.removeClass('buffering');
                }
    
                bTime = new Date();
                bTime = bTime.getTime();
            },100);//sau 100ms btime lai duoc cap nhat mot lan          
        }
   
        function autoplaytrack (){ 
            clearautoplay =  setInterval(function(){
                playerTrack.addClass('active');
                albumArt.addClass('active');
                checkBuffering();
                i.attr('class','fas fa-pause');
                audio.play();
                playPause();
            }, 1000);
        }

    // delta dong vai tro la chuyen sang bai hat khac á
        function selectTrack(delta){
            if( delta == 0 || delta == 1 ){
                if(currIndex >= music.length - 1) currIndex = 0;
                else currIndex ++;
            }
            else {
                if(currIndex <= 0) currIndex = music.length -1;
                else currIndex -- ;
            }

            // if( (currIndex > -1) && (currIndex < music.length) ){
                //bai hat dau tien se duoc buffering va chay
                i.attr('class','fas fa-play');
                if( delta == 0 ){
                    albumArt.addClass('buffering active');
                } 
                else{
                    // chuyen sang trang thai chay
                    albumArt.removeClass('buffering');
                   
                    playerTrack.removeClass('active');
                    audio.play();
                    // playerTrack.addClass('active');
                    // albumArt.addClass('active');
                
                    clearInterval(buffInterval);
                    checkBuffering();            
                    
                }

                //set s-area ve gia tri ban dau
                seekBar.width(0);
                // trackTime.removeClass('active');
                tProgress.text('00:00');
                tTime.text('00:00');

                currAuthor = music[currIndex].author;
                currTrackName = music[currIndex].name;
                audio.src = music[currIndex].track;
                
                // nTime = 0;
                // bTime = new Date();
                // bTime = bTime.getTime();

                //infor of song
                authorName.text(currAuthor);
                trackName.text(currTrackName);
                $('#album-art img').attr("src",music[currIndex].image);
                // $('#album-art img').addClass('active');

                // name and lyrics
                $("#song_infor h3").text(currTrackName);
                $("#song_infor i").text(currAuthor);
                $("#contents p").text(music[currIndex].lyric);
            // }
            console.log(currIndex);
            
            // else{
            //     if( delta == 0 || delta == 1 ){
            //         --currIndex;
            //     }
            //     else ++currIndex;
            // }
        }
   
        function initPlayer(){
            var delta = 0;
            
            audio = new Audio();
            // autoplaytrack();
            
            selectTrack(delta);
            playPauseButton.on('click',playPause);
            audio.loop = false;
            
            sArea.mousemove(function(event){ showHover(event); });
            
            sArea.mouseout(hideHover);
            
            sArea.on('click',playFromClickedPos);
            
            $(audio).on('timeupdate',updateCurrTime);

            playPreviousTrackButton.on('click',function(){
                 selectTrack(delta - 1 );
                } );
            playNextTrackButton.on('click',function(){ selectTrack(delta + 1);});

        }
    
        initPlayer();

        // show infor of title
        var list_song = $("#category ul li a");
        list_song.each(function(){
            $(this).click(function (e) { 
                e.preventDefault();
                // toggle active class
                list_song.each(function(){$(this).removeClass("active");});
                $(this).addClass("active");

                // show infor
                var a  = $(this).html();
                var count = 0;

                $("#album_infor h3").text(a);
                function numberSongs(){
                    for(i = 0; i < music.length; i++){
                        if(music[i].category === a) count++;
                    }
                }
                numberSongs();
                $("#album_infor i").text(count + " songs");

                function showListSongs(){
                    for(i = 0; i < music.length; i++){
                        if(music[i].category === a){
                            $("#list_songs ul").add(
                                    `<li><a>${music[i].name}</a></li>`
                            ).appendTo('#list_songs ul');
                        }
                    }
                }
                $("#list_songs ul").text('');//delete history of ul
                showListSongs();
                chooseSongFromList();
            });    
            
        })//end show infor title

        function chooseSongFromList(){
            var song_click = $("#list_songs ul li a");
            song_click.each(function(){
                $(this).click(function(e){
                    e.preventDefault();
                    song_click.each(function(){$(this).removeClass("song_active");})
                    $(this).addClass("song_active");
                })
            });
        }
    }
    });

});