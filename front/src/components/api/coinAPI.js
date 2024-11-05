import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
});

export const getCoinCount = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get("/api/user/coin", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.coin;
  } catch (error) {
    console.error("Failed to fetch coin count:", error);
    throw error;
  }
};
