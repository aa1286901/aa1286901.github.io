fetch('assets/tariffs.json')
.then(response => response.json())
.then(data => {
  const slidesContainer = document.getElementById('tariff-slides');
  data.forEach((tariff, index) => {
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide');
    slide.dataset.index = index;
    
    slide.innerHTML = `
      <div class="sim-card">
        <div class="chip"></div>
        <div class="details">
          <p class="tariff">${tariff.name}</p>
          <p class="price">${tariff.price}</p>
        </div>
        <div class="info1">
          <p class="info">
            <i class="fa-solid fa-wifi"></i>
            <span>${tariff.data}</span>
          </p>
          <p class="info">
            <i class="fa-solid fa-phone"></i>
            <span>${tariff.minutes}</span>
          </p>
          <p class="info">
            <i class="fa-solid fa-comment-dots"></i>
            <span>${tariff.sms}</span>
          </p>
        </div>
        <div class="mts-logo" style="background-image: url('${tariff.logo}');"></div>
      </div>
    `;
    slidesContainer.appendChild(slide);
  });
  
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'assets/swiper.js';
  document.body.appendChild(script);

  // Add event listeners for tab buttons
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const index = button.dataset.index;
      const swiper = document.querySelector('.swiper').swiper;
      swiper.slideTo(index);
    });
  });
})
.catch(error => console.error('Ошибка загрузки данных: ', error));