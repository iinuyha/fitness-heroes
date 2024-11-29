import axios from "axios";

export const saveNewEpisode = async ({
  token,
  episode,
  exe_name,
  exe_count,
  exe_set,
}) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/api/story/save-exercise`,
      { episode, exe_name, exe_set, exe_count },
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
