import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Request interceptor to add token if needed (assuming token is in localStorage if auth is implemented)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const syncShow = async (data) => {
  const response = await api.post('/shows/sync', data);
  if (!response.data.success) throw new Error(response.data.message || 'Failed to sync show');
  return response.data.data; 
};

export const getSeatMatrix = async (showId) => {
  const response = await api.get(`/seats/show/${showId}`);
  if (!response.data.success) throw new Error(response.data.message || 'Failed to get seats');
  return response.data.data;
};

export const getShowById = async (showId) => {
  const response = await api.get(`/shows/${showId}`);
  if (!response.data.success) throw new Error(response.data.message || 'Failed to get show details');
  return response.data.data;
};

export const lockSeats = async (showId, seatIds) => {
  const response = await api.post('/seats/lock', { showId, seatIds });
  if (!response.data.success) throw new Error(response.data.message || 'Failed to lock seats');
  return response.data.data;
};

export const releaseSeats = async (showId, seatIds) => {
  const response = await api.post('/seats/release', { showId, seatIds });
  if (!response.data.success) throw new Error(response.data.message || 'Failed to release seats');
  return response.data.data;
};

export const confirmBooking = async (bookingRequest) => {
  const response = await api.post('/booking/confirm', bookingRequest);
  if (!response.data.success) throw new Error(response.data.message || 'Failed to confirm booking');
  return response.data.data;
};

export const getBooking = async (bookingId) => {
  const response = await api.get(`/booking/${bookingId}`);
  if (!response.data.success) throw new Error(response.data.message || 'Failed to get booking');
  return response.data.data;
};

export const getMyBookings = async () => {
  const response = await api.get(`/booking/my-bookings`);
  if (!response.data.success) throw new Error(response.data.message || 'Failed to get bookings');
  return response.data.data;
};

export const initiatePayment = async (paymentRequest) => {
  const response = await api.post('/payment/initiate', paymentRequest);
  if (!response.data.success) throw new Error(response.data.message || 'Failed to initiate payment');
  return response.data.data;
};



export const getTicket = async (ticketId) => {
  const response = await api.get(`/ticket/${ticketId}`);
  if (!response.data.success) throw new Error(response.data.message || 'Failed to get ticket');
  return response.data.data;
};

export default api;
