import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
});

export const saveOnboardingInfo = async (onboardingData) => {
  const token = localStorage.getItem("jwtToken");
  try {
    const response = await api.post("/api/user/onboarding", onboardingData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.message;
  } catch (error) {
    console.error("Failed to save onboarding info:", error);
    throw error;
  }
};
