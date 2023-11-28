
$(document).ready(function () {
  const updateMainFeatureImage = () => {
    const mainFeatureWrap = document.querySelector('.enhanced .main-feature-wrap');
    if (!mainFeatureWrap) {
      return; // Exit the function if mainFeatureWrap is not found
    }
    const picture = mainFeatureWrap.querySelector('picture');
    if (!picture) {
      return; // Exit the function if picture is not found
    }
    const sources = picture.querySelectorAll('source');
    const matchingSource = Array.from(sources).find((source) => window.matchMedia(source.getAttribute('media')).matches);
    if (matchingSource) {
      const imageUrl = matchingSource.getAttribute('srcset');
      mainFeatureWrap.style.backgroundImage = `url(${imageUrl})`;
    }
  };
  window.addEventListener('resize', updateMainFeatureImage);
  window.onload = () => {
    updateMainFeatureImage(); // Execute after the page is fully loaded
  };
  
  function toggleAllDetails(event) {
    event.preventDefault();
    const detailsElements = document.querySelectorAll('.plan-cards.gci-scroller details');
    detailsElements.forEach((details) => {
      details.open = !details.open;
      const summary = details.querySelector('.plan-cards.gci-scroller summary');
      const hideText = summary.getAttribute('data-hide-text');
      const showText = summary.getAttribute('data-show-text');
      summary.textContent = details.open ? hideText : showText;
    });
  }
  
  const detailsElements = document.querySelectorAll('.plan-cards.gci-scroller details');
  detailsElements.forEach((details) => {
    const summary = details.querySelector('.plan-cards.gci-scroller summary');
    summary.addEventListener('click', toggleAllDetails);
  });
  
  /* ====
    BROAD BAND LABEL CAROUSEL
  ==== */

  $('.broad-band-scroll-wrapper')
  .slick({
    slidesToShow: 4,
    slidesToScroll: 4,
    infinite: false,
    centerMode: false,
    focusOnSelect: true,
    arrows: true,
    dots: true,
    appendArrows: $('.slick-navigation'),
    appendDots: $('.slick-navigation span'),
    prevArrow: '<button type="button" class="slick-prev"><svg width="15" height="20" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.5161 3.88L4.48389 10L10.5161 16.12" stroke="#312E3B" stroke-width="5" stroke-linecap="square"/></svg></button>',
    nextArrow: '<button type="button" class="slick-prev"><svg width="15" height="20" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.48386 16.12L10.5161 10L4.48385 3.88" stroke="#312E3B" stroke-width="5" stroke-linecap="square"/></svg></button>',
    responsive: [
      {
        breakpoint: 1025,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          arrows: true,
          dots: true,
        }
      },
      {
        breakpoint: 770,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          dots: true,
        }
      }
    ]
  })
});