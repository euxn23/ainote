import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const startSecond = 3730;
const songMs = 105000;
// const startSecond = 3742;
// const songMs = 12000;

function App() {
  const playerRef = useRef<any>(null);
  const loadedRef = useRef<boolean>(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [message, setMessage] = useState<string>('');

  const handleAudioRecordClick = async () => {
    if (!(playerRef.current && loadedRef.current && audioRef.current)) {
      setMessage('読み込み完了まで待ってネ');

      return;
    }
    if (!mediaStreamRef) {
      setMessage('マイク許可してクレメンス〜');

      return;
    }

    setMessage('');

    const stream = mediaStreamRef.current!;
    const recorder = new MediaRecorder(stream);

    const audio = audioRef.current;
    const player = playerRef.current;

    player.seekTo(startSecond);
    await sleep(1000);

    player.seekTo(startSecond);
    recorder.start();

    console.log(player.getVolume());

    recorder.addEventListener('dataavailable', ev => {
      audio.src = window.URL.createObjectURL(ev.data);
    });

    await sleep(songMs);

    recorder.stop();
    setMessage('録音完了！');

    const initialVolume = player.getVolume();

    while (player.getVolume() > 0) {
      player.setVolume(player.getVolume() - 5);
      await sleep(200);
    }

    player.pauseVideo();
    player.setVolume(initialVolume);
  };

  const handleAudioPlayClick = async () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) {
      setMessage('コールして欲しいな〜〜〜');

      return;
    }
    const player = playerRef.current!;
    player.seekTo(startSecond);
    audio.currentTime = 0;
    audio.play();
    player.playVideo();
  };

  useEffect(() => {
    const ytScriptTag = document.createElement('script');
    ytScriptTag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(ytScriptTag);

    const onPlayerReady = () => {
      loadedRef.current = true;
    };

    (window as any).onYouTubeIframeAPIReady = () => {
      const { YT } = window as any;
      playerRef.current = new YT.Player('player', {
        height: '360',
        width: '640',
        videoId: 'M5zxb_3d2FA',
        startSeconds: startSecond,
        events: {
          onReady: onPlayerReady
        }
      });
    };

    navigator.getUserMedia(
      { audio: true, video: false },
      stream => {
        mediaStreamRef.current = stream;
        const audio = new Audio();
        audio.setAttribute('controls', '');
        audioRef.current = audio;
      },
      () => {
        setMessage('マイク許可してクレメンス〜');
      }
    );
  }, []);

  return (
    <div className="App">
      <div>
        <div>
          <button onClick={handleAudioRecordClick}>
            曲を再生して合いの手を入れる
          </button>
          <button onClick={handleAudioPlayClick}>
            録音した合いの手を合わせて再生
          </button>
        </div>
        <div style={{ fontSize: '4rem', color: 'red' }}>{message}</div>
      </div>
    </div>
  );
}

export default App;
