import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs"; // TensorFlow.js
import "@tensorflow/tfjs-backend-webgl"; // WebGL 백엔드
import * as posedetection from "@tensorflow-models/pose-detection"; // MoveNet 라이브러리
import Webcam from "react-webcam";

function JumpingJackCounter() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const [count, setCount] = useState(0);
  let isJumping = false;

  useEffect(() => {
    const setupBackend = async () => {
      try {
        await tf.setBackend("webgl"); // WebGL 백엔드 설정
        await tf.ready();
        console.log("WebGL 백엔드 설정 완료");
      } catch (error) {
        console.error("WebGL 백엔드 설정 실패:", error);
      }
    };

    const loadModel = async () => {
      try {
        const detector = await posedetection.createDetector(
          posedetection.SupportedModels.MoveNet,
          {
            modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          }
        );
        detectorRef.current = detector;
        console.log("MoveNet 모델 로드 성공");
      } catch (error) {
        console.error("MoveNet 모델 로드 실패:", error);
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
        processPose(pose);
      }
    }
  };

  const processPose = (pose) => {
    // 필요한 관절만 필터링
    const keypoints = pose.keypoints.filter((kp) =>
      [
        "left_ankle",
        "right_ankle",
        "left_wrist",
        "right_wrist",
        "left_shoulder",
        "right_shoulder",
        "nose",
      ].includes(kp.name)
    );

    // 관절 좌표 및 신뢰도 확인
    const leftAnkle = keypoints.find(
      (kp) => kp.name === "left_ankle" && kp.score > 0.5
    );
    const rightAnkle = keypoints.find(
      (kp) => kp.name === "right_ankle" && kp.score > 0.5
    );
    const leftWrist = keypoints.find(
      (kp) => kp.name === "left_wrist" && kp.score > 0.5
    );
    const rightWrist = keypoints.find(
      (kp) => kp.name === "right_wrist" && kp.score > 0.5
    );
    const leftShoulder = keypoints.find(
      (kp) => kp.name === "left_shoulder" && kp.score > 0.5
    );
    const rightShoulder = keypoints.find(
      (kp) => kp.name === "right_shoulder" && kp.score > 0.5
    );
    const nose = keypoints.find((kp) => kp.name === "nose" && kp.score > 0.5);

    if (
      leftAnkle &&
      rightAnkle &&
      leftWrist &&
      rightWrist &&
      leftShoulder &&
      rightShoulder &&
      nose
    ) {
      // 발목 사이 거리와 어깨 사이 거리 계산
      const ankleDistance = Math.abs(rightAnkle.x - leftAnkle.x);
      const shoulderDistance = Math.abs(rightShoulder.x - leftShoulder.x);

      // 점프 감지: 발목 사이의 거리가 어깨보다 크고 손목이 머리 위에 있는 경우
      if (
        ankleDistance > shoulderDistance &&
        leftWrist.y < nose.y &&
        rightWrist.y < nose.y &&
        !isJumping // 이미 점프 상태가 아닌 경우만
      ) {
        isJumping = true;
        console.log("점프 감지");
      }

      // 착지 감지: 발목 사이의 거리가 어깨보다 작고 손목이 어깨 아래로 내려간 경우
      if (
        ankleDistance <= shoulderDistance &&
        isJumping &&
        leftWrist.y > leftShoulder.y && // 손목이 어깨 아래로 내려감
        rightWrist.y > rightShoulder.y
      ) {
        setCount((prevCount) => prevCount + 1);
        console.log("착지 감지");
        console.log("점핑잭 카운트 증가!");
        isJumping = false;
      }
    }
  };

  const drawPose = (pose, videoWidth, videoHeight) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const canvasWidth = canvasRef.current.width;
    const canvasHeight = canvasRef.current.height;

    const xScale = canvasWidth / videoWidth;
    const yScale = canvasHeight / videoHeight;

    // 필요한 관절만 필터링
    const keypoints = pose.keypoints.filter((kp) =>
      [
        "left_ankle",
        "right_ankle",
        "left_wrist",
        "right_wrist",
        "left_shoulder",
        "right_shoulder",
        "nose",
      ].includes(kp.name)
    );

    keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.5) {
        const adjustedX = keypoint.x * xScale;
        const adjustedY = keypoint.y * yScale;

        ctx.beginPath();
        ctx.arc(adjustedX, adjustedY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Webcam */}
      <Webcam
        ref={webcamRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        width={window.innerWidth}
        height={window.innerHeight}
      />
      {/* 점핑잭 카운트 표시 */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-50 text-white px-6 py-3 rounded-lg text-lg font-bold">
        점핑잭 횟수: {count}
      </div>
      {/* 리셋 버튼 (하단 가운데) */}
      <button
        onClick={() => setCount(0)}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-50 text-white px-6 py-3 rounded-lg text-lg font-bold"
      >
        리셋
      </button>
    </div>
  );
}

export default JumpingJackCounter;
