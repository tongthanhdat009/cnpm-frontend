/**
 * Utility functions để xử lý ngày giờ cho frontend
 */

/**
 * Chuyển đổi thời gian từ database (đã bao gồm UTC+7) sang định dạng hiển thị
 * Database lưu thời gian đã cộng thêm 7 giờ, nên cần trừ lại 7 giờ khi hiển thị
 * @param {string|Date} dateTime - Thời gian từ database
 * @returns {string} - Thời gian đã format theo múi giờ Việt Nam
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) return "";

  const date = new Date(dateTime);

  // Trừ 7 giờ vì database đã lưu UTC+7 nhưng JavaScript tự động cộng thêm 7 giờ
  const vietnamTime = new Date(date.getTime() - 7 * 60 * 60 * 1000);

  return vietnamTime.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

/**
 * Chuyển đổi thời gian từ database sang Date object với múi giờ đúng
 * @param {string|Date} dateTime - Thời gian từ database
 * @returns {Date} - Date object với múi giờ Việt Nam
 */
export const parseDateTime = (dateTime) => {
  if (!dateTime) return new Date();

  const date = new Date(dateTime);
  // Trừ 7 giờ vì database đã lưu UTC+7
  return new Date(date.getTime() - 7 * 60 * 60 * 1000);
};

/**
 * Format ngày theo định dạng DD/MM/YYYY
 * @param {string|Date} dateTime - Thời gian cần format
 * @returns {string} - Ngày đã format
 */
export const formatDate = (dateTime) => {
  if (!dateTime) return "";

  const date = new Date(dateTime);
  const vietnamTime = new Date(date.getTime() - 7 * 60 * 60 * 1000);

  return vietnamTime.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/**
 * Format giờ theo định dạng HH:mm
 * @param {string|Date} dateTime - Thời gian cần format
 * @returns {string} - Giờ đã format
 */
export const formatTime = (dateTime) => {
  if (!dateTime) return "";

  const date = new Date(dateTime);
  const vietnamTime = new Date(date.getTime() - 7 * 60 * 60 * 1000);

  return vietnamTime.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Lấy thời gian hiện tại theo múi giờ Việt Nam
 * @returns {Date} - Thời gian hiện tại
 */
export const getCurrentTime = () => {
  return new Date();
};
