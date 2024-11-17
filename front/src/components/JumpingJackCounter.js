import React, { useRef, useState, useEffect } from 'react';
import * as posenet from '@tensorflow-models/posenet';
import '@tensorflow/tfjs';
import Webcam from 'react-webcam';

function JumpingJackCounter() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [count, setCount] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isLanding, setIsLanding] = useState(false);
  const jumpThreshold = 50;

  useEffect(() => {
    const loadPosenet = async () => {
      const net = await posenet.load();
      setInterval(() => {
        detect(net);
      }, 100);
    };
    loadPosenet();
  }, []);

  const detect = async (net) => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const pose = await net.estimateSinglePose(video, {
        flipHorizontal: false,
      });

      if (pose && pose.keypoints) {
        drawPose(pose);
      }

      const leftWrist = pose.keypoints.find((point) => point && point.part === 'leftWrist');
      const rightWrist = pose.keypoints.find((point) => point && point.part === 'rightWrist');
      const leftAnkle = pose.keypoints.find((point) => point && point.part === 'leftAnkle');
      const rightAnkle = pose.keypoints.find((point) => point && point.part === 'rightAnkle');
      const leftHip = pose.keypoints.find((point) => point && point.part === 'leftHip');
      const rightHip = pose.keypoints.find((point) => point && point.part === 'rightHip');
      const leftEye = pose.keypoints.find((point) => point && point.part === 'leftEye');
      const rightEye = pose.keypoints.find((point) => point && point.part === 'rightEye');

      if (leftAnkle && rightAnkle && leftWrist && rightWrist && leftHip && rightHip) {
        // 점핑잭 동작 감지
        if (
          leftAnkle.position.y < leftHip.position.y - jumpThreshold &&
          rightAnkle.position.y < rightHip.position.y - jumpThreshold &&
          leftWrist.position.y < leftEye.position.y &&
          rightWrist.position.y < rightEye.position.y
        ) {
          setIsJumping(true);
          setIsLanding(false);
        }

        if (
          leftAnkle.position.y > leftHip.position.y &&
          rightAnkle.position.y > rightHip.position.y &&
          leftWrist.position.y > leftHip.position.y &&
          rightWrist.position.y > rightHip.position.y &&
          isJumping &&
          !isLanding
        ) {
          setCount((prevCount) => prevCount + 1);
          setIsLanding(true);
          setIsJumping(false);
        }

        if (
          leftAnkle.position.y > leftHip.position.y &&
          rightAnkle.position.y > rightHip.position.y
        ) {
          setIsLanding(false);
        }
      }
    }
  };

  // 관절에 점만 그리기 함수
  const drawPose = (pose) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    const keypoints = pose.keypoints.filter((kp) => kp && kp.score > 0.5); // 신뢰도 50% 이상인 포인트만 표시

    // 점 그리기
    keypoints.forEach((keypoint) => {
      const { y, x } = keypoint.position;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
    });
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>점핑잭 카운터</h1>
      <Webcam ref={webcamRef} style={{ width: 640, height: 480 }} />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0 }}
        width={640}
        height={480}
      />
      <h2>점핑잭 횟수: {count}</h2>
      <button onClick={() => setCount(0)}>리셋</button>
    </div>
  );
}

export default JumpingJackCounter;