import { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export function useHandGestures() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isOpenPalm, setIsOpenPalm] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null); // 'left' | 'right' | null
  const [errorMsg, setErrorMsg] = useState('');

  // 用于挥手检测的引用
  const prevXRef = useRef(null);
  const lastSwipeTimeRef = useRef(0);

  const startCamera = async () => {
    setIsStarted(true);
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(e => console.error("播放被拒:", e));
      }
    } catch (err) {
      console.error("摄像头开启失败:", err);
      setErrorMsg("无法开启摄像头，请检查权限");
    }
  };

  useEffect(() => {
    let handLandmarker = null;
    let animationFrameId = null;
    let lastVideoTime = -1;

    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        setIsLoaded(true);
      } catch (err) {
        console.error("AI 模型加载失败:", err);
        setErrorMsg("AI 模型加载失败，请检查网络");
      }
    };

    const predictWebcam = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video || !canvas || !handLandmarker) {
        animationFrameId = requestAnimationFrame(predictWebcam);
        return;
      }

      if (video.readyState < 2 || video.videoWidth === 0 || !isStarted) {
        animationFrameId = requestAnimationFrame(predictWebcam);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      try {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          const results = handLandmarker.detectForVideo(video, performance.now());

          if (results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0];
            
            landmarks.forEach((landmark) => {
              const x = (1 - landmark.x) * canvas.width;
              const y = landmark.y * canvas.height;
              ctx.beginPath();
              ctx.arc(x, y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = "#00FF00";
              ctx.fill();
            });

            // 取手腕(0) 和 中指根部(9) 的平均 X 坐标，更稳定
            const currentX = (landmarks[0].x + landmarks[9].x) / 2;

            // --- 挥手检测逻辑 ---
            const now = Date.now();
            const timeSinceLastSwipe = now - lastSwipeTimeRef.current;

            if (prevXRef.current !== null && timeSinceLastSwipe > 1000) { // 1秒防抖
              const deltaX = currentX - prevXRef.current;
              
              // 位移超过 0.1（画面宽度的10%）判定为挥手
              if (Math.abs(deltaX) > 0.1) {
                if (deltaX > 0) {
                  setSwipeDirection('right'); // MediaPipe X 向右增加
                } else {
                  setSwipeDirection('left');
                }
                lastSwipeTimeRef.current = now;
                console.log(`挥手检测: ${deltaX > 0 ? '向右' : '向左'}`);
                
                // 300ms 后清除挥手状态，避免重复触发
                setTimeout(() => setSwipeDirection(null), 300);
              }
            }
            prevXRef.current = currentX;

            // --- 张开/握拳检测 ---
            const indexFingerTip = landmarks[8];
            const wrist = landmarks[0];
            const distance = Math.sqrt(
              Math.pow(indexFingerTip.x - wrist.x, 2) + 
              Math.pow(indexFingerTip.y - wrist.y, 2)
            );
            setIsOpenPalm(distance > 0.15);
          } else {
            // 没检测到手时，重置 X 坐标
            prevXRef.current = null;
          }
        }
      } catch (err) {
        console.error("单帧识别出错:", err);
      }

      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    initMediaPipe();
    predictWebcam();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [isStarted]);

  return { videoRef, canvasRef, isLoaded, isStarted, isOpenPalm, swipeDirection, errorMsg, startCamera };
}