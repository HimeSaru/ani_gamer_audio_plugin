
(function (){
    var equalLoudnessFlag = false;

    function GainController(mPlayer){
        var root = document.createElement("div");
        root.id = "gain_controller";
        root.className = "vjs-playback-rate vjs-menu-button vjs-menu-button-popup vjs-control vjs-button";

        var textContainer = document.createElement("div");
        textContainer.className = "vjs-playback-rate-value";
        root.appendChild(textContainer);

        var textTitle = document.createElement("div");
        textTitle.style.fontSize = "10px";
        textTitle.style.position = "absolute";
        textTitle.style.top = "-2px"
        textTitle.style.width = "42px";
        textTitle.innerText = "Gain";
        textContainer.appendChild(textTitle);

        var textValue = document.createElement("div");
        textValue.style.marginTop = "6px";
        textContainer.appendChild(textValue);
        
        var btn = document.createElement("button");
        btn.className = "vjs-playback-rate vjs-menu-button vjs-menu-button-popup vjs-button";
        btn.type = "button";
        btn.title = "Gain";
        root.appendChild(btn);

        var audioCtx = new AudioContext();
        var source = audioCtx.createMediaElementSource(mPlayer);
        var input = audioCtx.createGain();
        var gainNode = audioCtx.createGain();
        var output = audioCtx.createGain();

        source.connect(gainNode);
        gainNode.connect(input)
        if(equalLoudnessFlag){
            equalLoudness(audioCtx , input , output);
        }else{
            input.connect(output);
        }

        output.connect(audioCtx.destination);
        textValue.innerText = gainNode.gain.value;

        var menu = new Menu();
        menu.onGainChange = function(value){
            gainNode.gain.value = value;
            textValue.innerText = value;
        }
        menu.onEqualLoudnessChange = function(value){
            equalLoudnessFlag = value;
            input.disconnect();
            if(equalLoudnessFlag){
                equalLoudness(audioCtx , input , output);
            }else{
                input.connect(output);
            }
        }
        root.appendChild(menu);
        
        return root;
    }

    function Menu(){
        root = document.createElement("div");
        root.className = "vjs-menu";
        root.style.padding = "10px";

        var row1 = document.createElement("div");
        row1.className = "vjs-menu-item vjs-danmu-opacity";
        root.appendChild(row1);
        
        var row1title = document.createElement("h3");
        row1title.innerText = "音量增益大小 " + 1;
        row1.appendChild(row1title);

        var row1input = document.createElement("input");
        row1input.className = "DanmuOpacityRange";
        row1input.type = "range";
        row1input.max = 10;
        row1input.min = 1;
        row1input.step = 1;
        row1input.value = 1;
        row1.appendChild(row1input);

        row1input.oninput = function(ev){
            row1title.innerText = "音量增益大小 " + row1input.value;
            root.onGainChange(row1input.value);
        };

        var row2 = document.createElement("div");
        row2.className = "vjs-menu-item vjs-danmu-opacity";
        root.appendChild(row2);

        var row2title = document.createElement("h3");
        row2title.innerText = "響度增強";
        row2title.style.display = "inline-block";
        row2.appendChild(row2title);

        var row2input = document.createElement("input");
        row2input.type = "checkbox";
        row2input.onchange = function(ev){
            root.onEqualLoudnessChange(row2input.checked);
        }
        row2.appendChild(row2input);

        root.onGainChange = function(value){};
        root.onEqualLoudnessChange = function(value){};
        return root;
    }

    function videoOnReady (mPlayer) {
        var container = document.getElementById("video-container");
        var controlBar = container.getElementsByClassName("vjs-control-bar")[0];
        controlBar.appendChild(new GainController(mPlayer));
    }

    function checkPlayer(){
        var mPlayer = document.getElementById("ani_video_html5_api");
        if(mPlayer){
            videoOnReady(mPlayer);
        } else {
            setTimeout(function(){
                checkPlayer();
            } , 1000);
        }
    };

    /**
     * 
     * @param {AudioContext} audioCtx 
     * @param {AudioNode} inputNode 
     * @param {AudioNode} outputNode 
     * @param {Number} from
     * @param {Number} to
     * @param {Number} dB
     */
    function rangeFilter(audioCtx , inputNode , outputNode , from , to , dB){
        var highpassFilter = audioCtx.createBiquadFilter();
        highpassFilter.type = "highpass";
        highpassFilter.frequency.value = from;

        var lowpassFilter = audioCtx.createBiquadFilter();
        lowpassFilter.type = "lowpass";
        lowpassFilter.frequency.value = to;
        var gainNode = audioCtx.createGain(Math.pow(10 , dB/20) );

        inputNode.connect(highpassFilter);
        highpassFilter.connect(lowpassFilter)
        lowpassFilter.connect(gainNode);
        gainNode.connect(outputNode);
    }

    /**
     * 
     * @param {AudioContext} audioCtx 
     * @param {AudioNode} source 
     * @param {AudioNode} gainNode 
     */
    function equalLoudness(audioCtx , source , gainNode){
        rangeFilter(audioCtx , source , gainNode , 20 , 22.5 , 65.62);  //20
        rangeFilter(audioCtx , source , gainNode , 22.5 , 28.25 , 65.62); //25
        rangeFilter(audioCtx , source , gainNode , 28.25 , 35.75 , 55.12); //31.5
        rangeFilter(audioCtx , source , gainNode , 35.75 , 45 , 45.53); //40
        rangeFilter(audioCtx , source , gainNode , 45 , 56.5 , 37.63); //50
        rangeFilter(audioCtx , source , gainNode , 56.5 , 71.5 , 30.86); //63
        rangeFilter(audioCtx , source , gainNode , 71.5 , 90 , 25.03); //80
        rangeFilter(audioCtx , source , gainNode , 90 , 112.5 , 20.51); //100
        rangeFilter(audioCtx , source , gainNode , 112.5 , 142.5 , 16.65); //125
        rangeFilter(audioCtx , source , gainNode , 142.5 , 180 , 13.12); //160
        rangeFilter(audioCtx , source , gainNode , 180 , 225 , 10.09); //200
        rangeFilter(audioCtx , source , gainNode , 225 , 282.5 , 7.54); //250
        rangeFilter(audioCtx , source , gainNode , 282.5 , 357.5 , 5.11); //315
        rangeFilter(audioCtx , source , gainNode , 357.5 , 450 , 3.06); //400
        rangeFilter(audioCtx , source , gainNode , 450 , 565 , 1.48); //500
        rangeFilter(audioCtx , source , gainNode , 565 , 715 , 0.3); //630
        rangeFilter(audioCtx , source , gainNode , 715 , 900 , -0.3); //800
        rangeFilter(audioCtx , source , gainNode , 900 , 1125 , -0.01); //1000
        rangeFilter(audioCtx , source , gainNode , 1125 , 1425 , 1.03); //1250
        rangeFilter(audioCtx , source , gainNode , 1425 , 1800 , -1.19); //1600
        rangeFilter(audioCtx , source , gainNode , 1800 , 2250 , -4.11); //2000
        rangeFilter(audioCtx , source , gainNode , 2250 , 2825 , -7.05); //2500
        rangeFilter(audioCtx , source , gainNode , 2825 , 3575 , -9.03); //3150
        rangeFilter(audioCtx , source , gainNode , 3575 , 4500 , -8.49); //4000
        rangeFilter(audioCtx , source , gainNode , 4500 , 5650 , -4.48); //5000
        rangeFilter(audioCtx , source , gainNode , 5650 , 7150 , 3.28); //6300
        rangeFilter(audioCtx , source , gainNode , 7150 , 9000 , 9.83); //8000
        rangeFilter(audioCtx , source , gainNode , 9000 , 11250 , 10.48); //10000
        rangeFilter(audioCtx , source , gainNode , 11250 , 14250 , 8.38); //12500
        rangeFilter(audioCtx , source , gainNode , 14250 , 18000 , 14.1); //16000
        rangeFilter(audioCtx , source , gainNode , 18000 , 20000 , 14.1); //20000
        /*rangeFilter(audioCtx , source , gainNode , 20 , 22.5 , 75.76);  //20
        rangeFilter(audioCtx , source , gainNode , 22.5 , 28.25 , 75.76); //25
        rangeFilter(audioCtx , source , gainNode , 28.25 , 35.75 , 68.21); //31.5
        rangeFilter(audioCtx , source , gainNode , 35.75 , 45 , 61.14); //40
        rangeFilter(audioCtx , source , gainNode , 45 , 56.5 , 54.96); //50
        rangeFilter(audioCtx , source , gainNode , 56.5 , 71.5 , 49.01); //63
        rangeFilter(audioCtx , source , gainNode , 71.5 , 90 , 43.24); //80
        rangeFilter(audioCtx , source , gainNode , 90 , 112.5 , 38.13); //100
        rangeFilter(audioCtx , source , gainNode , 112.5 , 142.5 , 33.48); //125
        rangeFilter(audioCtx , source , gainNode , 142.5 , 180 , 28.77); //160
        rangeFilter(audioCtx , source , gainNode , 180 , 225 , 24.84); //200
        rangeFilter(audioCtx , source , gainNode , 225 , 282.5 , 21.33); //250
        rangeFilter(audioCtx , source , gainNode , 282.5 , 357.5 , 18.05); //315
        rangeFilter(audioCtx , source , gainNode , 357.5 , 450 , 15.14); //400
        rangeFilter(audioCtx , source , gainNode , 450 , 565 , 12.98); //500
        rangeFilter(audioCtx , source , gainNode , 565 , 715 , 11.18); //630
        rangeFilter(audioCtx , source , gainNode , 715 , 900 , 9.99); //800
        rangeFilter(audioCtx , source , gainNode , 900 , 1125 , 10); //1000
        rangeFilter(audioCtx , source , gainNode , 1125 , 1425 , 11.26); //1250
        rangeFilter(audioCtx , source , gainNode , 1425 , 1800 , 10.43); //1600
        rangeFilter(audioCtx , source , gainNode , 1800 , 2250 , 7.27); //2000
        rangeFilter(audioCtx , source , gainNode , 2250 , 2825 , 4.45); //2500
        rangeFilter(audioCtx , source , gainNode , 2825 , 3575 , 3.04); //3150
        rangeFilter(audioCtx , source , gainNode , 3575 , 4500 , 3.8); //4000
        rangeFilter(audioCtx , source , gainNode , 4500 , 5650 , 7.46); //5000
        rangeFilter(audioCtx , source , gainNode , 5650 , 7150 , 14.35); //6300
        rangeFilter(audioCtx , source , gainNode , 7150 , 9000 , 20.98); //8000
        rangeFilter(audioCtx , source , gainNode , 9000 , 11250 , 23.43); //10000
        rangeFilter(audioCtx , source , gainNode , 11250 , 14250 , 22.33); //12500
        rangeFilter(audioCtx , source , gainNode , 14250 , 18000 , 25.17); //16000
        rangeFilter(audioCtx , source , gainNode , 18000 , 20000 , 25.17); //20000*/
    }
    
    checkPlayer();

})();

