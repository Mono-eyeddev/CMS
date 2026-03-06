import api from "./api";

export const submitKPI = async (kpiData) => {
  try {
    const res = await api.post("/auth/manager/kpi/submit/", kpiData);
    return res.data;
  } catch (error) {
    // send backend message to React
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Submission failed";

    throw new Error(message);
  }
};