import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs'; // TensorFlow.js
import '@tensorflow/tfjs-backend-webgl'; // WebGL 백엔드
import * as posedetection from '@tensorflow-models/pose-detection'; // MoveNet 라이브러리
import Webcam from 'react-webcam';

function JumpingJackCounter() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const [count, setCount] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isLanding, setIsLanding] = useState(false);

  // 점프 높이 및 손목/어깨 위치 조건
  const jumpThreshold = 75;

  useEffect(() => {
    const setupBackend = async () => {
      try {
        await tf.setBackend('webgl'); // WebGL 백엔드 설정
        await tf.ready();
        console.log('WebGL 백엔드 설정 완료');
      } catch (error) {
        console.error('WebGL 백엔드 설정 실패:', error);
      }
    };

    const loadModel = async () => {
      try {
        const detector = await posedetection.createDetector(
          posedetection.SupportedModels.MoveNet, {
            modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          }
        );
        detectorRef.current = detector;
        console.log('MoveNet 모델 로드 성공');
      } catch (error) {
        console.error('MoveNet 모델 로드 실패:', error);
      }
    };

    setupBackend().then(() => loadModel());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      detectPose();
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const detectPose = async () => {
    const detector = detectorRef.current;

    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      detector
    ) {
      const video = webcamRef.current.video;

      const poses = await detector.estimatePoses(video, {
        maxPoses: 1,
        flipHorizontal: false,
      });

      if (poses && poses.length > 0) {
        const pose = poses[0];
        drawPose(pose, video.videoWidth, video.videoHeight);
        processPose(pose, video.videoHeight);
      }
    }
  };

  const processPose = (pose, videoHeight) => {
    // 필요한 관절만 필터링
    const keypoints = pose.keypoints.filter(
      (kp) =>
        ['left_ankle', 'right_ankle', 'left_wrist', 'right_wrist', 'left_shoulder', 'right_shoulder'].includes(kp.name)
    );
  
    // 관절 좌표 및 신뢰도 확인
    const leftAnkle = keypoints.find((kp) => kp.name === 'left_ankle' && kp.score > 0.5);
    const rightAnkle = keypoints.find((kp) => kp.name === 'right_ankle' && kp.score > 0.5);
    const leftWrist = keypoints.find((kp) => kp.name === 'left_wrist' && kp.score > 0.5);
    const rightWrist = keypoints.find((kp) => kp.name === 'right_wrist' && kp.score > 0.5);
    const leftShoulder = keypoints.find((kp) => kp.name === 'left_shoulder' && kp.score > 0.5);
    const rightShoulder = keypoints.find((kp) => kp.name === 'right_shoulder' && kp.score > 0.5);
  
    if (leftAnkle && rightAnkle && leftWrist && rightWrist && leftShoulder && rightShoulder) {
      // 땅에서 발목까지의 거리 계산
      const leftAnkleDistance = videoHeight - leftAnkle.y;
      const rightAnkleDistance = videoHeight - rightAnkle.y;
  
      // 발목의 거리 콘솔 출력
      console.log(`Left Ankle Distance from Ground: ${leftAnkleDistance}`);
      console.log(`Right Ankle Distance from Ground: ${rightAnkleDistance}`);
  
      // 점프 감지: 발목이 땅에서 jumpThreshold 이상 올라간 경우
      if (
        leftAnkleDistance > jumpThreshold &&
        rightAnkleDistance > jumpThreshold &&
        leftWrist.y < leftShoulder.y && // 손목이 어깨 위로 올라감
        rightWrist.y < rightShoulder.y &&
        !isJumping // 이미 점프 상태가 아닌 경우만
      ) {
        setIsJumping(true);
        setIsLanding(false);
  
        // 점프 상태 출력
        console.log("점프 상태: isJumping = true, isLanding = false");
        return;
      }
  
      // 착지 감지: 발목이 땅에서 jumpThreshold 이하로 내려온 경우
      if (
        leftAnkleDistance <= jumpThreshold &&
        rightAnkleDistance <= jumpThreshold &&
        isJumping && // 이전에 점프 상태여야 함
        !isLanding // 이미 착지 상태가 아닌 경우
      ) {
        // 발목이 땅과 가까워진 뒤 손목 조건을 확인
        if (
          leftWrist.y > leftShoulder.y && // 손목이 어깨 아래로 내려감
          rightWrist.y > rightShoulder.y
        ) {
          setCount((prevCount) => prevCount + 1);
          setIsLanding(true);
          setIsJumping(false);
  
        console.log("점핑잭 카운트 증가! 현재 카운트:", count + 1);
        console.log("착지 상태: isJumping = false, isLanding = true");
      }
    }
  
      // 착지 상태 초기화
      if (
        leftAnkleDistance <= jumpThreshold &&
        rightAnkleDistance <= jumpThreshold &&
        isLanding
      ) {
        setIsLanding(false);
  
        console.log("착지 상태 초기화: isLanding = false");
      }
    }
  };

  
  const drawPose = (pose, videoWidth, videoHeight) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  
    const canvasWidth = canvasRef.current.width;
    const canvasHeight = canvasRef.current.height;
  
    const xScale = canvasWidth / videoWidth;
    const yScale = canvasHeight / videoHeight;
  
    // 필요한 관절만 필터링
    const keypoints = pose.keypoints.filter((kp) => 
      ['left_ankle', 'right_ankle', 'left_wrist', 'right_wrist', 'left_shoulder', 'right_shoulder'].includes(kp.name)
    );
  
    keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.5) {
        const adjustedX = keypoint.x * xScale;
        const adjustedY = keypoint.y * yScale;
  
        ctx.beginPath();
        ctx.arc(adjustedX, adjustedY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      }
    });
  };

  
  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      <h1>점핑잭 카운터</h1>
      <div style={{ position: 'relative', width: 800, height: 600 }}>
        <Webcam
          ref={webcamRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 800,
            height: 600,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 800,
            height: 600,
          }}
          width={800}
          height={600}
        />
      </div>
      <h2>점핑잭 횟수: {count}</h2>
      <button onClick={() => setCount(0)}>리셋</button>
    </div>
  );
}

export default JumpingJackCounter;