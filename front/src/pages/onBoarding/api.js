import axios from "axios";

export const saveOnboardingInfo = async (onboardingData) => {
  const token = localStorage.getItem("jwtToken");
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/api/user/onboarding`,
      onboardingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.message;
  } catch (error) {
    console.error("Failed to save onboarding info:", error);
    throw error;
  }
};
