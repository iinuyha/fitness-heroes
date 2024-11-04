import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
});

export const checkIdAvailability = async (id) => {
  try {
    const response = await api.get("/api/user/check-id", {
      params: { id },
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("ID 확인 실패");
  }
};

export const signup = async (id, password, email) => {
  try {
    const response = await api.post(
      "/api/signup",
      { id, password, email },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("회원가입 실패");
  }
};
