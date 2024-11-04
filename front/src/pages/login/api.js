import axios from "axios";

export const login = async (id, password) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/api/login`,
      { id, password }
    );
    // 로그인 성공 시
    if (response.status === 200 && response.data.success) {
      localStorage.setItem("token", response.data.token); // 로그인 성공 시 JWT를 localStorage에 저장
      return {
        success: true,
        token: response.data.token,
        isFirstTime: response.data.isFirstTime,
      };
    }
  } catch (error) {
    // 에러 처리
    if (error.response) {
      // 서버 응답이 있는 경우
      const { status, data } = error.response;

      if (status === 404 && data.message === "User not found") {
        return { success: false, message: "존재하지 않는 아이디입니다" };
      } else if (status === 401 && data.message === "Incorrect password") {
        return { success: false, message: "일치하지 않는 비밀번호입니다" };
      }
    }
    // 그 외 에러 처리
    return {
      success: false,
      message: "로그인 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
};

// 보호된 경로에 접근할 때 JWT를 Authorization 헤더에 포함
export const getProtectedData = async () => {
  const token = localStorage.getItem("token"); // localStorage에서 토큰 가져오기

  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/api/protected`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Bearer 방식으로 토큰 전송
        },
      }
    );

    return response.data; // 서버에서 받은 데이터 반환
  } catch (error) {
    console.error("Failed to fetch protected data:", error);
    throw error;
  }
};
