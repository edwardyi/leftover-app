import React from 'react';

const UserLocationButton = ({ onLocation, label = '取得目前位置' }) => {
  const handleClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          onLocation({ lat: latitude, lng: longitude });
        },
        (err) => {
          alert('無法取得定位資訊');
        }
      );
    } else {
      alert('瀏覽器不支援定位功能');
    }
  };

  return <button onClick={handleClick} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">{label}</button>;
};

export default UserLocationButton; 