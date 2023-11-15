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
    const detailsElements = document.querySelectorAll('.gci-scroller details');
    detailsElements.forEach((details) => {
      details.open = !details.open;
      const summary = details.querySelector('.gci-scroller summary');
      const hideText = summary.getAttribute('data-hide-text');
      const showText = summary.getAttribute('data-show-text');
      summary.textContent = details.open ? hideText : showText;
    });
  }
  
  const detailsElements = document.querySelectorAll('.gci-scroller details');
  detailsElements.forEach((details) => {
    const summary = details.querySelector('.gci-scroller summary');
    summary.addEventListener('click', toggleAllDetails);
  });

});