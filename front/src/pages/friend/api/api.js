import axios from "axios";

// 친구 목록 조회
export const fetchFriendList = async (token) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/api/friend`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("친구 목록 조회 실패:", error);
    throw error.response
      ? error.response.data
      : new Error("친구 목록 조회 조회 실패");
  }
};

// 친구 조회(검색)
export const searchFriend = async (token, friendId) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/api/friend/search`,
      { id: friendId }, // body에 친구 ID 전달
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data; // 성공 시 친구 데이터 반환
  } catch (error) {
    console.error("친구 추가 중 오류 발생:", error);
    throw error.response
      ? error.response.data
      : new Error("친구 추가 중 오류 발생");
  }
};

// 친구 초대하는 함수
export const inviteFriend = async (friendId) => {
  // try {
  //   const response = await axios.post("/api/invite", { friendId });
  //   return response.data; // 초대 결과 반환
  // } catch (error) {
  //   console.error("초대 중 오류 발생:", error);
  //   throw error;
  // }

  // 임의로 초대 성공 반환
  return { success: true, message: "초대 성공" };
};

// 초대 상태 확인하는 함수
export const checkInvitationStatus = async (friendId) => {
  // try {
  //   const response = await axios.get(`/api/invitation-status/${friendId}`);
  //   return response.data; // 초대 상태 반환
  // } catch (error) {
  //   console.error("초대 상태 확인 중 오류 발생:", error);
  //   throw error;
  // }

  // 임의로 친구가 초대를 수락한 상태로 반환
  return { accepted: true };
};

// 초대 수락 함수
export const acceptInvitation = async (friendId) => {
  // try {
  //   const response = await axios.post("/api/accept-invitation", { friendId });
  //   return response.data; // 초대 수락 결과 반환
  // } catch (error) {
  //   console.error("초대 수락 중 오류 발생:", error);
  //   throw error;
  // }

  // 임의로 수락 성공 반환
  return { success: true, message: "초대를 수락했습니다." };
};
