import axios from "axios";

export const saveNewEpisode = async ({ token, episode, concern, date }) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/api/story`,
      { episode: episode, concern: concern, date: date },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("운동 기록 저장 성공:", response.data);
    return response.data; // 저장 성공 시 데이터 반환
  } catch (error) {
    console.error("운동기록 저장저장 실패", error);
    throw error;
  }
};
