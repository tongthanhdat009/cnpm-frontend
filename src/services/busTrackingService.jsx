import apiClient from './apiClient';

const BusTrackingService = {
  /**
   * Cập nhật vị trí xe buýt
   */
  updateBusLocation: async (idXeBuyt, viDo, kinhDo) => {
    const response = await apiClient.post('/api/v1/bus-tracking/update-location', {
      id_xe_buyt: idXeBuyt,
      vi_do: viDo,
      kinh_do: kinhDo
    });
    return response.data;
  },

  /**
   * Lấy vị trí xe buýt hiện tại
   */
  getBusLocation: async (idXeBuyt) => {
    const response = await apiClient.get(`/api/v1/bus-tracking/bus/${idXeBuyt}`);
    return response.data;
  },

  /**
   * Lấy vị trí xe của chuyến đi
   */
  getTripBusLocation: async (idChuyenDi) => {
    const response = await apiClient.get(`/api/v1/bus-tracking/trip/${idChuyenDi}`);
    return response.data;
  },

  /**
   * Lấy danh sách chuyến đi đang hoạt động của học sinh
   */
  getActiveTripsForStudent: async (idHocSinh) => {
    const response = await apiClient.get(`/api/v1/bus-tracking/student/${idHocSinh}/active-trips`);
    return response.data;
  }
};

export default BusTrackingService;
