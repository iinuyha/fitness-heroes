import React, { useState, useEffect } from 'react';

const EmailVerification = ({ onVerify }) => {
  const [email, setEmail] = useState('');
  const [serverCode, setServerCode] = useState(''); // 서버에서 받아온 인증번호
  const [verificationCode, setVerificationCode] = useState(''); // 사용자가 입력한 인증번호
  const [emailMsg, setEmailMsg] = useState(''); // 이메일 관련 에러 메세지
  const [authMsg, setAuthMsg] = useState('');   // 인증번호 관련 에러 메세지
  const [loading, setLoading] = useState(false);  // 메일 전송 전까지 로딩중 여부
  const [isVerified, setIsVerified] = useState(false);  // 인증번호 일치 후 인증 완료 여부
  const [countdown, setCountdown] = useState(0); // 카운트다운 초 (종료되면 -1로)
  const [isCountdownStarted, setIsCountdownStarted] = useState(false); // 카운트다운 시작 여부

  // 인증번호 발송 버튼 누르면 실행되는 함수
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // 메일 전송 전까지 로딩중으로

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/sendEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      // 메일 전송 성공시
      if (data.ok) {
        setLoading(false); // 로딩중 해제
        setServerCode(data.code); // 서버에서 받은 인증번호 저장
        setCountdown(180); // 3분 카운트다운 시작
        setIsCountdownStarted(true); // 카운트다운 시작 상태 true로
        setEmailMsg('');  // 이메일 관련 에러메시지 띄울거 없으니까 ''으로 설정
      }
      // 메일 전송 실패시
      else {
        setEmailMsg('이메일 발송에 실패했습니다.'); // 이메일 관련 에러메세지 설정
      }
    } catch (error) {
      console.error('오류 발생:', error);
      setEmailMsg('서버와의 연결에 문제가 발생했습니다.');  // 이메일 관련 에러메세지 설정
    } finally {
      setLoading(false);
    }
  };

  // 인증번호 일치 여부 확인 함수
  const handleVerification = () => {
    // 입력한 인증번호와 서버에서 받은 인증번호 비교
    if (verificationCode === serverCode) {  // 인증번호 일치 시
      setIsVerified(true);  // 인증 상태 true로
      setAuthMsg(''); // 인증번호 관련 에러메시지 띄울거 없으니까 ''으로 설정
      setCountdown(-1); // 카운트다운 종료
      onVerify(true); // 부모 컴포넌트에도 인증 상태를 true로 전달
    } else {
      setAuthMsg('잘못된 인증번호입니다. 다시 시도하세요.');
    }
  };

  // 카운트다운 효과
  useEffect(() => {
    let timer;
    if (countdown > 0 && !isVerified) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else if (isCountdownStarted && countdown === 0) {
      setEmailMsg('인증 시간이 만료되었습니다.');
      setIsVerified(false);
      setVerificationCode('');
      setIsCountdownStarted(false); // 카운트다운 종료 상태 설정
      setCountdown(-1);
    }
    return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 클리어
  }, [countdown, isCountdownStarted, isVerified]); // 의존성 배열에 isCountdownStarted 추가

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit}>
        <div className="flex mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소"
            required
            className="w-4/6 p-2 border-b-2 border-white focus:border-[#0675C5] bg-transparent text-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || isVerified} // 로딩 중이거나 인증 완료 시 비활성화
            className={`w-2/6 ml-2 font-bold py-2 px-4 rounded-full
              ${countdown > 0 || isVerified
                ? 'bg-[#0675C5] text-white'  // 카운트다운 중일 때 파란색 배경
                : 'bg-white text-black hover:bg-[#0675C5] hover:text-white'}`}  // 기본 상태
          >
            {loading ? '전송 중...'
              : countdown > 0 ? `남은 시간: ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
              : isVerified ? '인증 완료'
              : '인증 요청'}
          </button>

        </div>
        <p className='text-red-500'>{emailMsg}</p>
      </form>

      {isCountdownStarted && !(countdown == -1) && !isVerified && (
        <div className="flex mb-4">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="인증번호"
            required
            className="w-4/6 p-2 border-b-2 border-white focus:border-[#0675C5] bg-transparent text-white focus:outline-none"
          />
          <button
            onClick={handleVerification}
            disabled={isVerified}
            className={`w-2/6 ml-2 bg-white hover:bg-[#0675C5] hover:text-white text-black font-bold py-2 px-4 rounded-full`}
            >
            인증번호 확인
          </button>
        </div>
      )}
      <p className='text-red-500'>{authMsg}</p>
    </div>
  );
};

export default EmailVerification;