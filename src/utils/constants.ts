// export const backendURL = "http://localhost:8080";
export const backendURL =
  "https://intelligent-multimodal-rag-backend-291445686450.us-central1.run.app";
export const access_token = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("Token not found in localStorage");
    return null;
  }

  return token;
};
