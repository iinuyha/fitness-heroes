import axios from "axios";

export const getStoryEpisode = async (token) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/api/story`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // { concern: string, episode: number, date: string }
  } catch (error) {
    console.error("Failed to fetch story episode:", error);
    throw error;
  }
};
