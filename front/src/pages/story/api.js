import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
});

export const getStoryEpisode = async () => {
  const token = localStorage.getItem("jwtToken"); // JWT 토큰을 localStorage에서 가져오기
  try {
    const response = await api.get("/api/story", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data; // { concern: string, episode: number, date: string }
  } catch (error) {
    console.error("Failed to fetch story episode:", error);
    throw error;
  }
};
