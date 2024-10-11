import React, { useState, useEffect } from 'react';

const EmailVerification = ({ onVerify }) => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(''); // 인증벟노
  const [emailMsg, setEmailMsg] = useState(''); // 이메일 전송 관련 메세지
  const [authMsg, setAuthMsg] = useState('');   // 인증 관련 메세지
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);  // 인증 완료 여부
  const [serverCode, setServerCode] = useState(''); // 서버에서 받은 인증번호 저장
  const [countdown, setCountdown] = useState(0); // 카운트다운 상태
  const [isCountdownStarted, setIsCountdownStarted] = useState(false); // 카운트다운 시작 여부
  const [isCountdownEnded, setIsCountdownEnded] = useState(false); // 카운트다운 시작 여부

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/sendEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.ok) {
        setServerCode(data.code); // 서버에서 받은 인증번호 저장
        setCountdown(180); // 3분 카운트다운 시작
        setIsCountdownStarted(true); // 카운트다운 시작 상태 설정
        setEmailMsg('');
        setIsCountdownEnded(false);
      } else {
        setEmailMsg('이메일 발송에 실패했습니다.');
      }
    } catch (error) {
      console.error('오류 발생:', error);
      setEmailMsg('서버와의 연결에 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = () => {
    // 입력한 인증번호와 서버에서 받은 인증번호 비교
    if (verificationCode === serverCode) {  // 인증번호 일치 시
      setIsVerified(true);
      onVerify();
      setAuthMsg('');
      onVerify(true); // 인증 완료 상태를 부모에게 전달
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
      setIsCountdownEnded(true); // 카운트다운 종료 상태 설정
      setIsVerified(false);
      setVerificationCode('');
      setIsCountdownStarted(false); // 카운트다운 종료 상태 설정
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
            disabled={loading || countdown > 0} // 카운트다운 중 버튼 비활성화
            className={`w-2/6 ml-2 bg-white text-black ${ (countdown > 0 || isVerified) ? 'bg-[#0675C5] text-white cursor-not-allowed' : 'hover:bg-[#0675C5] hover:text-white'} font-bold py-2 px-4 rounded-full`}
          >
            {loading ? '전송 중...'
            : (countdown > 0 && !isVerified) ? `남은 시간: ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
            : isVerified ? '인증 완료'
            : '인증 요청'}
          </button>
        </div>
        <p className='text-red-500'>{emailMsg}</p>
      </form>

      {isCountdownStarted && !isCountdownEnded && !isVerified && (
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
            className={`w-2/6 ml-2 bg-white ${isVerified ? 'bg-[#0675C5] text-white cursor-not-allowed' : 'hover:bg-[#0675C5] hover:text-white'} text-black font-bold py-2 px-4 rounded-full`}
            >
            {isVerified ? '인증 완료' : '인증번호 확인'}
          </button>
        </div>
      )}
      <p className='text-red-500'>{authMsg}</p>
    </div>
  );
};

export default EmailVerification;
