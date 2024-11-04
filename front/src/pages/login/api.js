import axios from "axios";

export const login = async (id, password) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/api/login`,
      { id, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Login failed");
  }
};
