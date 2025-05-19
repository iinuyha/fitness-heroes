
   
# 💪 피트니스 히어로즈, 에너지를 모아라! [피트니스 히어로즈]

[![HCI KOREA 2025 우수작](https://img.shields.io/badge/HCI_KOREA_2025-Creative_Award_우수작-FFEB99?style=for-the-badge&logo=trophy&logoColor=black)]()

> 🏆 본 프로젝트는 **HCI KOREA 2025 Creative Award** 우수작으로 선정되었습니다!

<img width="700" alt="image" src="https://github.com/user-attachments/assets/1ba92396-e080-4fab-bc65-6dac07c2452f" />


## 🎮 게임 개요

[**피트니스 히어로즈**]는 스토리 기반의 운동 미션과 게임 요소를 결합한 **운동 습관 형성 지원 게임**입니다.  
초보자도 재미있게 참여할 수 있도록 설계되었으며, **WebRTC**, **ML Kit**, **TensorFlow**를 활용해 **실시간 운동 자세 분석 및 피드백**을 제공합니다.

- **운동 동기 부여**를 위한 친구와의 실시간 협력 & 경쟁
- **카메라 기반 운동 자세 추적**과 실시간 피드백 제공
- **운동 기록 및 점수 누적**, 지속적인 성취감 제공
- **Socket.IO와 WebRTC 통신 기술**을 통한 실시간 상호작용

  
<br/>

## 👥 팀원 소개

| 이름 | 소속 | 역할 |
|------|------|------|
| **김해민** | 광운대학교 정보융합학부 | 백엔드, 데이터베이스 관리 |
| **문혜진** | 광운대학교 정보융합학부 | 백엔드, 데이터베이스 관리 |
| (🙋‍♀️ ME!) **손아현** | 광운대학교 정보융합학부 | 프론트엔드, 백엔드, 배포 및 인프라 구축 |
| **강윤수** | 광운대학교 동북아문화산업학부 | 기획 및 디자인 |



<br/>

## 🔧 주요 기술 스택

| 프론트엔드 | 백엔드 | 배포 및 인프라 |
|------------|--------|----------------|
| ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) <br> ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) <br> ![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white) <br> ![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white) <br> ![Context API](https://img.shields.io/badge/Context_API-764ABC?style=for-the-badge) <br> ![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white) | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) <br> ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) <br> ![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white) <br> ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white) | ![AWS EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white) <br> ![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white) <br> ![HTTPS](https://img.shields.io/badge/HTTPS-0052CC?style=for-the-badge&logo=letsencrypt&logoColor=white) <br> ![Google STUN](https://img.shields.io/badge/Google_STUN-4285F4?style=for-the-badge&logo=google&logoColor=white) |

<br/>

## 🎥 시연 영상

> 아래 영상을 통해 **"피트니스 히어로즈"의 주요 기능과 사용자 흐름**을 확인해보세요!

[![시연 영상 썸네일](https://img.youtube.com/vi/zCysxB4WIXE/0.jpg)](https://www.youtube.com/watch?v=zCysxB4WIXE)

🔗 [유튜브에서 보기](https://www.youtube.com/watch?v=zCysxB4WIXE)

<br/>

## 🛠 프로젝트 내 담당 및 트러블슈팅

### [프론트엔드 개발]

1. **Bearer Token 방식 로그인 인증 기능 구현**
   - JWT를 `localStorage`에 저장해 자동 인증 유지
   - API 요청 시 `Authorization` 헤더에 포함되도록 구성

2. **실시간 온라인 상태 관리 기능 구현**
   - `React Context` + `WebSocket` 조합으로 유저 접속 여부 실시간 관리
   - `useRef` 기반 중복 등록 방지 처리

3. **운동 대결 수락 팝업 전역 처리**
   - 조건부 리스너 등록을 통해 대결 요청 이벤트 충돌 방지
   - 대결 UI 팝업과 수락 여부 처리 로직 통합

4. **운동 횟수 카운팅용 비디오 스트림 및 모델 인스턴스 관리**
   - `useRef`와 `WebRTC`로 영상 관리
   - `TensorFlow` 기반 자세 분석 및 상태 값 변환을 객체화해 효율적 관리

5. **운동 대결 중 소켓 연결 상태 지속 관리**
   - `Socket.IO` 인스턴스를 `useRef`로 전역 유지
   - 상대방 퇴장/이탈 시 자동 상태 정리 처리로 혼란 최소화


### [백엔드 개발]

1. **JWT 기반 인증 처리 구현**
   - 클라이언트에서 전달받은 토큰을 검증해 사용자 ID 추출 및 인증

2. **Socket.IO를 통한 실시간 데이터 통신**
   - 친구 접속/요청/수락 상태를 실시간으로 표시
   - 아이템 구매, 코인 차감, 운동 결과 등 **모든 이벤트를 동기화**


### [배포 및 인프라 구축]

1. **AWS 기반 서비스 배포**
   - EC2, 도메인, 보안 그룹 등을 활용한 프로덕션 환경 구축

2. **HTTPS 보안 연결 구성**
   - Nginx + Let's Encrypt 조합으로 SSL 인증서 설정

3. **WebRTC 연결 안정화**
   - Google STUN 서버 기반 NAT 환경에서도 안정적인 연결 보장

