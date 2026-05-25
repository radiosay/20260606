(function initNaverMap() {
  const mapRoot = document.getElementById('wedding-map');
  const config = window.APP_CONFIG.map;

  if (!mapRoot || !config) return;

  const script = document.createElement('script');
  script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${config.clientId}`;

  script.onload = function () {
    const map = new naver.maps.Map(mapRoot, {
      center: new naver.maps.LatLng(config.lat, config.lng),
      zoom: 16
    });

    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(config.lat, config.lng),
      map
    });

    const infoWindow = new naver.maps.InfoWindow({
      content: `
        <div style="padding:10px 12px;font-size:12px;line-height:1.5;color:#403534;min-width:160px;">
          <strong>${config.placeName}</strong><br>
          ${config.address}
        </div>
      `
    });

    infoWindow.open(map, marker);
  };

  script.onerror = function () {
    mapRoot.innerHTML = `
      <a class="map-fallback"
         href="https://map.naver.com/v5/search/${encodeURIComponent(config.fallbackQuery)}"
         target="_blank"
         rel="noopener noreferrer">
        <div class="map-icon">📍</div>
        <div class="map-label">${config.placeName}</div>
        <div class="map-sub">지도 API 연결에 실패했습니다.<br>눌러서 네이버 지도에서 바로 보기</div>
      </a>
    `;
  };

  document.head.appendChild(script);
})();