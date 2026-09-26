import apiClient from "./apiClient";

export const getCustomerOrders = async (userId) => {
  try {
    const response = await apiClient.get(`/orders/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return [];
  }
};

export const getCustomerFootprint = async (userId) => {
  try {
    const response = await apiClient.get(`/orders/user/${userId}/footprint`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer footprint:", error);
    return null;
  }
};