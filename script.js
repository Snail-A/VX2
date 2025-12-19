document.addEventListener('DOMContentLoaded', () => {
    const envelopeScene = document.getElementById('envelopeScene');
    const letterScene = document.getElementById('letterScene');
    const openBtn = document.getElementById('openBtn');
    const bgMusic = document.getElementById('bgMusic');
    const musicControl = document.getElementById('musicControl');

    let isOpened = false;

    // Detect WeChat browser
    const isWeChat = /MicroMessenger/i.test(navigator.userAgent);

    // Aggressive preload strategy
    const forceLoad = () => {
        bgMusic.load();
        // For WeChat: try to play and pause immediately to trigger buffering
        if (isWeChat) {
            const p = bgMusic.play();
            if (p !== undefined) {
                p.then(() => {
                    bgMusic.pause();
                    console.log("WeChat: Audio primed");
                }).catch(() => { });
            }
        }
    };

    bgMusic.addEventListener('playing', () => {
        musicControl.classList.add('playing');
    });

    bgMusic.addEventListener('pause', () => {
        musicControl.classList.remove('playing');
    });

    // DEBUG ALERTS - REMOVE AFTER FIXING
    // alert("脚本已加载 v5.1 - 准备测试");

    // Try to load immediately
    forceLoad();

    bgMusic.addEventListener('error', (e) => {
        const err = bgMusic.error;
        alert("音频加载错误: " + err.code + "\n" + err.message);
    });

    if (isWeChat) {
        if (typeof WeixinJSBridge !== 'undefined') {
            WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
                forceLoad();
            });
        } else {
            document.addEventListener('WeixinJSBridgeReady', function () {
                forceLoad();
            }, false);
        }
    }

    // Add buffering feedback
    bgMusic.addEventListener('waiting', () => {
        if (isOpened) {
            // Simple toast or console log, for now just log
            // In a real app we would show a spinner
            console.log("Buffering...");
        }
    });

    const interactHandler = (e) => {
        // Prevent default but ensure we don't block scrolling if needed
        // e.preventDefault(); 

        // Improve load timing: start loading on touch start
        bgMusic.load();

        if (e.type === 'touchstart') return; // Just load on touchstart

        e.preventDefault(); // Prevent default on click/touchend

        if (isOpened) return;
        isOpened = true;

        bgMusic.muted = false;
        bgMusic.volume = 1.0;



        const playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Play started (or pending buffering)
            }).catch(error => {
                // If it's not an abort error (which happens when we load() again), alert it
                if (error.name !== 'AbortError') {
                    alert("播放受阻: " + error);
                    document.body.addEventListener('click', () => {
                        bgMusic.play();
                    }, { once: true });
                }
            });
        }

        openLetter();
    };

    // Use click for desktop and touchend for mobile
    openBtn.addEventListener('click', interactHandler);
    // Add touchstart for early loading
    openBtn.addEventListener('touchstart', interactHandler, { passive: true });
    // Remove touchend to avoid double firing with click (click fires after touchend)

    musicControl.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleMusic();
    });

    function playMusicNow() {
        bgMusic.muted = false;
        bgMusic.volume = 1.0;
        const playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => { });
        }
    }

    function openLetter() {
        document.body.classList.add('envelope-open');
        setTimeout(() => {
            letterScene.classList.remove('hidden');
            void letterScene.offsetWidth;
            document.body.classList.add('show-letter');
            setTimeout(() => {
                envelopeScene.classList.add('hidden');
            }, 1000);
        }, 1200);
    }

    function toggleMusic() {
        if (bgMusic.paused) {
            playMusicNow();
        } else {
            bgMusic.pause();
        }
    }
});
