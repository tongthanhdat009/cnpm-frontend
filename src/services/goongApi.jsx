import polyline from '@mapbox/polyline';

const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY;

const getCoordinates = async (address) => {
  const url = `https://rsapi.goong.io/geocode?address=${encodeURIComponent(
    address
  )}&api_key=${GOONG_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.status === 'OK') {
    return data.results[0].geometry.location;
  }
  throw new Error(`Không tìm thấy tọa độ cho địa chỉ: ${address}`);
};

// CẬP NHẬT HÀM NÀY
export const fetchGoongRoute = async (startAddress, endAddress) => {
  const startCoords = await getCoordinates(startAddress);
  const endCoords = await getCoordinates(endAddress);

  const origin = `${startCoords.lat},${startCoords.lng}`;
  const destination = `${endCoords.lat},${endCoords.lng}`;
  const directionUrl = `https://rsapi.goong.io/Direction?origin=${origin}&destination=${destination}&vehicle=car&api_key=${GOONG_API_KEY}`;

  const directionResponse = await fetch(directionUrl);
  const directionData = await directionResponse.json();

  // Kiểm tra và trả về toàn bộ object của tuyến đường đầu tiên
  if (directionData?.routes?.[0]) {
    return directionData.routes[0]; // Trả về cả { distance, duration, overview_polyline }
  }

  console.error('API không trả về tuyến đường:', directionData);
  throw new Error('Không tìm thấy tuyến đường nào.');
};