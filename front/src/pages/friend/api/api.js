import axios from "axios"; // axios 사용

// 친구 목록 가져오는 함수
export const fetchFriendList = async () => {
  // try {
  //   const response = await axios.get("/api/friends"); // 서버에서 친구 목록 받아옴
  //   return response.data; // 친구 목록 반환
  // } catch (error) {
  //   console.error("친구 목록을 불러오는 중 오류 발생:", error);
  //   throw error;
  // }

  // 일단 임의 데이터 불러오게끔 함
  const mockFriendList = [
    { userId: "cjftn55", username: "김철수" },
    { userId: "dudgml3121", username: "이영희" },
    { userId: "dudtn35", username: "박영수" },
    { userId: "altn354", username: "최민수" },
    { userId: "wlals1", username: "한지민" },
    { userId: "wasds1", username: "손아현" },
    { userId: "qwers1", username: "김해민" },
    { userId: "hthals1", username: "문혜진" },
    { userId: "vxcls1", username: "강윤수" },
    { userId: "asd1", username: "하하호호" },
  ];

  return mockFriendList;
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
