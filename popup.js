document.getElementById('fullscreenToggle').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const elem = document.getElementById('DayViewerAnimationBlock');

      if (!elem) {
        alert('Could not find DayViewerAnimationBlock');
        return;
      }

      // Function to check if image exists using Image() constructor
      function checkImageExists(url) {
        return new Promise((resolve) => {
          const img = new Image();
          let resolved = false;

          img.onload = () => {
            if (!resolved) {
              resolved = true;
              console.log(`Image exists: ${url}`);
              resolve(true);
            }
          };

          img.onerror = () => {
            if (!resolved) {
              resolved = true;
              console.log(`Image not found: ${url}`);
              resolve(false);
            }
          };

          // Set crossOrigin before src to avoid CORS issues
          img.crossOrigin = 'anonymous';
          img.src = url;

          // Add timeout to prevent hanging
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              console.log(`Image check timeout: ${url}`);
              resolve(false);
            }
          }, 15000); // 15 second timeout (increased from 10)
        });
      }

            // Function to generate timestamp accounting for server lag
      function generateCurrentTimestamp() {
        // Account for server processing lag - check for images from 10 minutes ago
        const now = new Date();
        const tenMinutesAgo = new Date(now.getTime() - (10 * 60 * 1000));

        const year = tenMinutesAgo.getUTCFullYear();
        const dayOfYear = Math.floor((tenMinutesAgo - new Date(year, 0, 1)) / 86400000) + 1;
        const hours = tenMinutesAgo.getUTCHours().toString().padStart(2, '0');

        // Find the closest matching minute from server's available times
        const targetMinute = tenMinutesAgo.getUTCMinutes();
        const serverMinutes = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56];

        // Find the closest minute that is less than or equal to target time
        let closestMinute = serverMinutes[0]; // Default to first minute
        for (let i = serverMinutes.length - 1; i >= 0; i--) {
          if (serverMinutes[i] <= targetMinute) {
            closestMinute = serverMinutes[i];
            break;
          }
        }

        const minutes = closestMinute.toString().padStart(2, '0');

        return `${year}${dayOfYear.toString().padStart(3, '0')}${hours}${minutes}`;
      }

      // Function to format timestamp for display
      function formatTimestampForDisplay(timestamp) {
        const year = timestamp.slice(0, 4);
        const dayOfYear = parseInt(timestamp.slice(4, 7));
        const hours = timestamp.slice(7, 9);
        const minutes = timestamp.slice(9, 11);

        const date = new Date(year, 0, dayOfYear);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        return `${day} ${date.toLocaleString('en', { month: 'short' })} ${year} - ${hours}${minutes} UTC`;
      }

      // Function to get next image ID
      function getNextImageId() {
        const existingImages = document.querySelectorAll('#DayViewerAnimationBlock img[id^="F_"]');
        const ids = Array.from(existingImages).map(img => parseInt(img.id.split('_')[1]));
        return Math.max(...ids, 0) + 1;
      }

      // Function to add new image if it exists
      async function addNewImageIfExists() {
        const timestamp = generateCurrentTimestamp();
        const imageUrl = `https://cdn.star.nesdis.noaa.gov/GOES18/ABI/CONUS/GEOCOLOR/${timestamp}_GOES18-ABI-CONUS-GEOCOLOR-1250x750.jpg`;
        const fullSizeUrl = `https://cdn.star.nesdis.noaa.gov/GOES18/ABI/CONUS/GEOCOLOR/${timestamp}_GOES18-ABI-CONUS-GEOCOLOR-2500x1500.jpg`;

        console.log(`Checking for new image: ${imageUrl}`);

        // Check if image exists using Image() constructor
        const imageExists = await checkImageExists(imageUrl);

        if (imageExists) {
          // Check if we already have this timestamp
          const existingImage = document.querySelector(`img[src*="${timestamp}_GOES18"]`);
          if (existingImage) {
            console.log(`Image for ${timestamp} already exists, skipping.`);
            return;
          }

          console.log(`New image found! Adding: ${imageUrl}`);

          const imageId = getNextImageId();
          const displayTime = formatTimestampForDisplay(timestamp);

          // Create new slide div with proper structure
          const newSlideDiv = document.createElement('div');
          newSlideDiv.style.cssText = 'opacity: 0; position: relative;';
          newSlideDiv.setAttribute('data-slide-id', imageId);
          newSlideDiv.innerHTML = `
            <div class='animCaption' data-caption-id='${imageId}'>GeoColor - True Color daytime, multispectral IR at night - <span data-ts='${timestamp}' class='TZToggle' title='${displayTime}'>${displayTime}</span></div>
            <a href='${fullSizeUrl}' class='FBAnim' title='GeoColor - True Color daytime, multispectral IR at night - ${displayTime}' data-link-id='${imageId}'>
              <img id='F_${imageId}' src='${imageUrl}' crossOrigin="Anonymous"
                   alt='GeoColor - True Color daytime, multispectral IR at night - ${displayTime}'
                   width='1250' height='750' title='GeoColor - True Color daytime, multispectral IR at night - ${displayTime}'
                   class='img-responsive' decoding='sync' data-img-id='${imageId}' data-timestamp='${timestamp}'>
            </a>
          `;

                    // Add to animation block
          const animationBlock = document.getElementById('DayViewerAnimationBlock');

          // Temporarily suppress website's error handlers
          console.log('Adding new slide to DOM...');
          const originalOnError = window.onerror;
          window.onerror = function(msg, url, line, col, error) {
            if (msg.includes('Cannot read properties of null')) {
              console.log('Suppressed website error:', msg);
              return true; // Suppress the error
            }
            return originalOnError ? originalOnError.apply(this, arguments) : false;
          };

          // Add the slide
          animationBlock.appendChild(newSlideDiv);

          // Restore original error handler after a short delay
          setTimeout(() => {
            window.onerror = originalOnError;
          }, 1000);

          console.log('New slide added to DOM successfully');

          // Update Cycle2 to include new slide (if jQuery and cycle plugin are available)
          if (typeof $ !== 'undefined' && $.fn.cycle) {
            try {
              console.log('Attempting to add slide to Cycle2...');
              $('#DayViewerAnimationBlock').cycle('add', newSlideDiv);
              console.log('Slide added to Cycle2 successfully');
            } catch (e) {
              console.log('Cycle2 not available, slide added manually');
            }
          }

          // Update slider max value (if jQuery UI slider is available)
          if (typeof $ !== 'undefined' && $.fn.slider) {
            try {
              const sliderElement = $("#animSlider");
              console.log('Slider element found:', sliderElement.length > 0);

              if (sliderElement.length > 0) {
                const sliderInstance = sliderElement.slider('instance');
                console.log('Slider instance exists:', !!sliderInstance);

                if (sliderInstance) {
                  const newSliderMax = document.getElementsByClassName("animCaption").length;
                  const currentMax = sliderElement.slider('option', 'max');
                  console.log('Current slider max:', currentMax, 'New max:', newSliderMax);

                  // Only update if the value has actually changed
                  if (currentMax !== newSliderMax) {
                    console.log('Updating slider max value...');
                    sliderElement.slider('option', 'max', newSliderMax);
                    console.log('Slider max updated successfully');
                  } else {
                    console.log('Slider max unchanged, skipping update');
                  }
                } else {
                  console.log('Slider not properly initialized, skipping update');
                }
              } else {
                console.log('Slider element not found, skipping update');
              }
            } catch (e) {
              console.log('jQuery UI slider update failed:', e.message);
              console.log('Error stack:', e.stack);
            }
          } else {
            console.log('jQuery or slider plugin not available');
          }

          // Remove old images to prevent memory buildup (keep last 24 = 2 hours)
          const allSlides = animationBlock.children;
          if (allSlides.length > 24) {
            const slideToRemove = allSlides[0];

            // Try to use Cycle2 remove if available, otherwise remove manually
            if (typeof $ !== 'undefined' && $.fn.cycle) {
              try {
                $('#DayViewerAnimationBlock').cycle('remove', 0);
              } catch (e) {
                // Fallback to manual removal
                slideToRemove.remove();
              }
            } else {
              // Manual removal
              slideToRemove.remove();
            }
            console.log('Removed oldest slide to maintain memory usage');
          }

          console.log(`Successfully added image ${imageId} for ${displayTime}`);
        } else {
          console.log(`No new image available for ${timestamp}`);
        }
      }

      // Start auto-refresh immediately and every minute
      addNewImageIfExists(); // Check immediately
      setInterval(addNewImageIfExists, 60000); // Every minute (60,000ms)

      // Create aggressive CSS to force fullscreen
      const style = document.createElement('style');
      style.id = 'fullscreen-force-styles';
      style.textContent = `
        #DayViewerAnimationBlock {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 99999 !important;
          background-color: black !important;
        }

        #DayViewerAnimationBlock > div {
          width: 100vw !important;
          height: 100vh !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        #DayViewerAnimationBlock img {
          max-width: none !important;
          max-height: none !important;
          width: 100vw !important;
          height: 100vh !important;
          object-fit: contain !important;
        }

        #DayViewerAnimationBlock .animCaption {
          display: none !important;
        }
      `;
      document.head.appendChild(style);

      // Remove all HTML sizing attributes
      const imgs = elem.getElementsByTagName('img');
      for (let img of imgs) {
        img.removeAttribute('width');
        img.removeAttribute('height');
      }

      // Hide page scroll
      document.body.style.overflow = 'hidden';

      // Go fullscreen
      elem.requestFullscreen?.().catch(console.error);
    }
  });
});
